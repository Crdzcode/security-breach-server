import type { Server, Socket } from 'socket.io';
import {
  createRoom,
  getRoom,
  deleteRoom,
  toRoomPublic,
  getAllRooms,
  setRoomPhase,
  resetTurnState,
} from '../../rooms/roomManager';
import { assignClasses, buildGameStartedPayload } from '../../game/classAssignment';
import { startTurnTimer } from './gameEvents';

// ─────────────────────────────────────────────────────────────────────────────
// Lobby events (admin-only)
// ─────────────────────────────────────────────────────────────────────────────

function buildPlayers(room: import('../../types').Room) {
  return Array.from(room.players.values()).map((p) => ({
    codename:        p.codename,
    displayName:     p.displayName,
    image:           p.image,
    status:          p.status,
    hasVotedEndTurn: p.hasVotedEndTurn,
    isConnected:     p.isConnected,
  }));
}

export function registerLobbyEvents(io: Server, socket: Socket): void {

  // Admin: criar nova sala (duração opcional em segundos, tarefas opcionais)
  socket.on('admin:create_room', (payload?: { duration?: number; tasks?: number }) => {
    const duration = payload?.duration ?? 120;
    const tasks    = payload?.tasks    ?? 0;
    const room = createRoom(socket.id, duration, tasks);
    const pub  = toRoomPublic(room);

    socket.emit('admin:room_created', pub);
    socket.to('admins').emit('admin:room_created', pub);

    console.log(`[lobby] sala criada: ${room.id} (${duration}s)`);
  });

  // Admin: listar todas as salas
  socket.on('admin:list_rooms', () => {
    socket.emit('admin:rooms_list', getAllRooms().map((r) => toRoomPublic(r)));
  });

  // Admin: deletar sala
  socket.on('admin:delete_room', (roomId: string) => {
    const room = getRoom(roomId);
    if (!room) {
      socket.emit('server:error', { message: 'Sala não encontrada.' });
      return;
    }

    // Notifica jogadores/watchers que a sala foi removida
    io.in(room.id).emit('server:room_deleted', { roomId: room.id });

    deleteRoom(roomId);

    // Notifica todos os admins
    io.to('admins').emit('admin:room_deleted', { roomId });

    console.log(`[lobby] sala deletada: ${roomId}`);
  });

  // Admin: iniciar jogo
  socket.on('admin:start_game', (roomId: string) => {
    const room = getRoom(roomId);
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

    assignClasses(room);
    setRoomPhase(room, 'action');
    room.round = 1;
    room.roundStartAt = Date.now();
    resetTurnState(room);
    startTurnTimer(io, room); // auto-advance when turnDuration expires

    // Briefing individual por jogador
    for (const player of room.players.values()) {
      io.to(player.socketId).emit('server:game_started', buildGameStartedPayload(player, room));
    }

    // Broadcast estado para a sala (jogadores + watchers TV)
    io.in(room.id).emit('server:game_update', {
      phase:        room.phase,
      round:        room.round,
      players:      buildPlayers(room),
      turnDuration: room.turnDuration,
      roundStartAt: room.roundStartAt,
    });

    // Admins sem classes
    io.to('admins').emit('admin:room_update', toRoomPublic(room));

    console.log(`[lobby] jogo iniciado na sala ${room.id} com ${room.players.size} jogadores`);
  });
}
