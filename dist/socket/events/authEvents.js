"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthEvents = registerAuthEvents;
const authService_1 = require("../../auth/authService");
const roomManager_1 = require("../../rooms/roomManager");
function registerAuthEvents(io, socket) {
    socket.on('client:login', (payload) => {
        const { codename, password, roomId } = payload;
        const user = (0, authService_1.findUser)(codename, password);
        if (!user) {
            socket.emit('server:login_failure', { message: 'Credenciais inválidas.' });
            return;
        }
        // ── Admin ─────────────────────────────────────────────────────────────────
        if ((0, authService_1.isAdmin)(user)) {
            socket.join('admins');
            socket.emit('server:admin_login_success', {
                codename: user.codename,
                rooms: (0, roomManager_1.getAllRooms)().map((r) => (0, roomManager_1.toRoomPublic)(r, true)),
            });
            console.log(`[auth] admin "${user.codename}" conectado`);
            return;
        }
        // ── Player ────────────────────────────────────────────────────────────────
        if (!roomId) {
            socket.emit('server:login_failure', { message: 'Informe o código da sala.' });
            return;
        }
        const room = (0, roomManager_1.getRoom)(roomId.toUpperCase());
        if (!room) {
            socket.emit('server:login_failure', { message: 'Sala não encontrada.' });
            return;
        }
        const buildSelf = (p) => ({
            codename: p.codename,
            displayName: p.displayName,
            image: p.image,
            status: p.status,
            hasVotedEndTurn: p.hasVotedEndTurn,
            isConnected: true,
            modifiers: p.modifiers, // próprio jogador recebe seus modificadores
        });
        const buildPublic = (p) => ({
            codename: p.codename,
            displayName: p.displayName,
            image: p.image,
            status: p.status,
            hasVotedEndTurn: p.hasVotedEndTurn,
            isConnected: p.isConnected,
        });
        // Reconexão
        const existing = room.players.get(user.codename);
        if (existing) {
            existing.socketId = socket.id;
            existing.isConnected = true;
            socket.join(room.id);
            socket.emit('server:login_success', {
                player: buildSelf(existing),
                roomId: room.id,
                players: Array.from(room.players.values()).map(buildPublic),
                phase: room.phase,
                round: room.round,
            });
            io.to('admins').emit('admin:room_update', (0, roomManager_1.toRoomPublic)(room, room.phase !== 'lobby'));
            return;
        }
        // Novo jogador
        const added = (0, roomManager_1.addPlayerToRoom)(room, user.codename, socket.id);
        if (!added) {
            socket.emit('server:login_failure', { message: 'Não foi possível entrar na sala.' });
            return;
        }
        socket.join(room.id);
        const player = room.players.get(user.codename);
        socket.emit('server:login_success', {
            player: buildSelf(player),
            roomId: room.id,
            players: Array.from(room.players.values()).map(buildPublic),
            phase: room.phase,
            round: room.round,
        });
        // Notifica jogadores e watchers da sala
        socket.to(room.id).emit('server:player_joined', buildPublic(player));
        // Notifica admins
        io.to('admins').emit('admin:room_update', (0, roomManager_1.toRoomPublic)(room, false));
        console.log(`[auth] "${user.codename}" entrou na sala ${room.id}`);
    });
    // ── Watcher público (tela de TV) ───────────────────────────────────────────
    socket.on('client:watch_room', (roomId) => {
        const room = (0, roomManager_1.getRoom)(roomId?.toUpperCase?.());
        if (!room) {
            socket.emit('server:error', { message: 'Sala não encontrada.' });
            return;
        }
        socket.join(room.id); // recebe player_joined / player_disconnected em tempo real
        socket.emit('server:room_state', {
            roomId: room.id,
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
    });
    socket.on('disconnect', () => {
        const found = (0, roomManager_1.findRoomBySocket)(socket.id);
        if (!found)
            return;
        for (const player of found.players.values()) {
            if (player.socketId === socket.id) {
                (0, roomManager_1.markPlayerDisconnected)(found, player.codename);
                socket.to(found.id).emit('server:player_disconnected', { codename: player.codename });
                io.to('admins').emit('admin:room_update', (0, roomManager_1.toRoomPublic)(found, found.phase !== 'lobby'));
                console.log(`[auth] "${player.codename}" desconectou da sala ${found.id}`);
                return;
            }
        }
    });
}
