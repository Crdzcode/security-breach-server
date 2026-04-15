"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLobbyEvents = registerLobbyEvents;
const roomManager_1 = require("../../rooms/roomManager");
const classAssignment_1 = require("../../game/classAssignment");
// ─────────────────────────────────────────────────────────────────────────────
// Lobby events (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
function registerLobbyEvents(io, socket) {
    // Admin: criar nova sala
    socket.on('admin:create_room', () => {
        const room = (0, roomManager_1.createRoom)(socket.id);
        const pub = (0, roomManager_1.toRoomPublic)(room, false);
        // Responde ao admin que criou E notifica todos os outros admins conectados
        socket.emit('admin:room_created', pub);
        socket.to('admins').emit('admin:room_created', pub);
        console.log(`[lobby] sala criada: ${room.id}`);
    });
    // Admin: listar todas as salas
    socket.on('admin:list_rooms', () => {
        socket.emit('admin:rooms_list', (0, roomManager_1.getAllRooms)().map((r) => (0, roomManager_1.toRoomPublic)(r, true)));
    });
    // Admin: iniciar jogo
    socket.on('admin:start_game', (roomId) => {
        const room = (0, roomManager_1.getRoom)(roomId);
        if (!room) {
            socket.emit('server:error', { message: 'Sala não encontrada.' });
            return;
        }
        if (room.players.size < 2) {
            socket.emit('server:error', { message: `São necessários pelo menos 2 jogadores (sala tem ${room.players.size}).` });
            return;
        }
        if (room.phase !== 'lobby') {
            socket.emit('server:error', { message: 'O jogo nesta sala já foi iniciado.' });
            return;
        }
        (0, classAssignment_1.assignClasses)(room);
        (0, roomManager_1.setRoomPhase)(room, 'action');
        room.round = 1;
        (0, roomManager_1.resetTurnState)(room);
        // Envia briefing individual para cada jogador
        for (const player of room.players.values()) {
            const payload = (0, classAssignment_1.buildGameStartedPayload)(player);
            io.to(player.socketId).emit('server:game_started', payload);
        }
        // Broadcast de estado para a sala
        io.in(room.id).emit('server:game_update', {
            phase: room.phase,
            round: room.round,
            players: Array.from(room.players.values()).map((p) => ({
                codename: p.codename,
                displayName: p.displayName,
                image: p.image,
                status: p.status,
                hasVotedEndTurn: p.hasVotedEndTurn,
                isConnected: p.isConnected,
            })),
        });
        // Notifica TODOS os admins com o estado completo (com classes)
        io.to('admins').emit('admin:room_update', (0, roomManager_1.toRoomPublic)(room, true));
        console.log(`[lobby] jogo iniciado na sala ${room.id} com ${room.players.size} jogadores`);
    });
}
