"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLobbyEvents = registerLobbyEvents;
const roomManager_1 = require("../../rooms/roomManager");
const classAssignment_1 = require("../../game/classAssignment");
const gameEvents_1 = require("./gameEvents");
// ─────────────────────────────────────────────────────────────────────────────
// Lobby events (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
function buildPlayers(room) {
    return Array.from(room.players.values()).map((p) => ({
        codename: p.codename,
        displayName: p.displayName,
        image: p.image,
        status: p.status,
        hasVotedEndTurn: p.hasVotedEndTurn,
        isConnected: p.isConnected,
    }));
}
function registerLobbyEvents(io, socket) {
    // Admin: criar nova sala (duração opcional em segundos, tarefas opcionais)
    socket.on('admin:create_room', (payload) => {
        const duration = payload?.duration ?? 120;
        const tasks = payload?.tasks ?? 0;
        const room = (0, roomManager_1.createRoom)(socket.id, duration, tasks);
        const pub = (0, roomManager_1.toRoomPublic)(room);
        socket.emit('admin:room_created', pub);
        socket.to('admins').emit('admin:room_created', pub);
        console.log(`[lobby] sala criada: ${room.id} (${duration}s)`);
    });
    // Admin: listar todas as salas
    socket.on('admin:list_rooms', () => {
        socket.emit('admin:rooms_list', (0, roomManager_1.getAllRooms)().map((r) => (0, roomManager_1.toRoomPublic)(r)));
    });
    // Admin: deletar sala
    socket.on('admin:delete_room', (roomId) => {
        const room = (0, roomManager_1.getRoom)(roomId);
        if (!room) {
            socket.emit('server:error', { message: 'Sala não encontrada.' });
            return;
        }
        // Notifica jogadores/watchers que a sala foi removida
        io.in(room.id).emit('server:room_deleted', { roomId: room.id });
        (0, roomManager_1.deleteRoom)(roomId);
        // Notifica todos os admins
        io.to('admins').emit('admin:room_deleted', { roomId });
        console.log(`[lobby] sala deletada: ${roomId}`);
    });
    // Admin: iniciar jogo
    socket.on('admin:start_game', (roomId) => {
        const room = (0, roomManager_1.getRoom)(roomId);
        if (!room) {
            socket.emit('server:error', { message: 'Sala não encontrada.' });
            return;
        }
        if (room.players.size < 4) {
            socket.emit('server:error', { message: `São necessários pelo menos 4 jogadores (sala tem ${room.players.size}). Precisam de ao menos 1 Assassino, 1 Policial, 1 V.I.P e 1 Inocente.` });
            return;
        }
        if (room.phase !== 'lobby') {
            socket.emit('server:error', { message: 'O jogo nesta sala já foi iniciado.' });
            return;
        }
        (0, classAssignment_1.assignClasses)(room);
        (0, roomManager_1.setRoomPhase)(room, 'action');
        room.round = 1;
        room.roundStartAt = Date.now();
        (0, roomManager_1.resetTurnState)(room);
        (0, gameEvents_1.startTurnTimer)(io, room); // auto-advance when turnDuration expires
        // Briefing individual por jogador
        for (const player of room.players.values()) {
            io.to(player.socketId).emit('server:game_started', (0, classAssignment_1.buildGameStartedPayload)(player, room));
        }
        // Broadcast estado para a sala (jogadores + watchers TV)
        io.in(room.id).emit('server:game_update', {
            phase: room.phase,
            round: room.round,
            players: buildPlayers(room),
            turnDuration: room.turnDuration,
            roundStartAt: room.roundStartAt,
        });
        // Admins sem classes
        io.to('admins').emit('admin:room_update', (0, roomManager_1.toRoomPublic)(room));
        console.log(`[lobby] jogo iniciado na sala ${room.id} com ${room.players.size} jogadores`);
    });
    // Admin: forçar início da próxima rodada
    socket.on('admin:force_next_round', (roomId) => {
        const room = (0, roomManager_1.getRoom)(roomId);
        if (!room) {
            socket.emit('server:error', { message: 'Sala não encontrada.' });
            return;
        }
        if (room.phase !== 'report') {
            socket.emit('server:error', { message: 'Só é possível forçar a próxima rodada durante a fase de relatório.' });
            return;
        }
        (0, gameEvents_1.startNextRound)(io, room);
        console.log(`[lobby] admin forçou próxima rodada na sala ${roomId}`);
    });
}
