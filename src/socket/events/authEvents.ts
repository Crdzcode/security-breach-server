import type { Server, Socket } from 'socket.io';
import type { LoginPayload } from '../../types';
import { findUser, isAdmin, availableLogins } from '../../auth/authService';
import {
  getRoom,
  addPlayerToRoom,
  findRoomBySocket,
  markPlayerDisconnected,
  toRoomPublic,
  getAllRooms,
} from '../../rooms/roomManager';

export function registerAuthEvents(io: Server, socket: Socket): void {

  socket.on('client:login', (payload: LoginPayload) => {
    const { codename, password, roomId } = payload;

    const result = findUser(codename, password);
    if (result.error) {
      if (result.error === 'not_found') {
        const available = availableLogins();
        console.log(`[auth] login falhou — codename desconhecido: "${codename}" | logins disponíveis: ${available.join(', ')}`);
        socket.emit('server:login_failure', { message: 'Credenciais inválidas.' });
      } else {
        console.log(`[auth] login falhou — senha incorreta para: "${codename}"`);
        socket.emit('server:login_failure', { message: 'Credenciais inválidas.' });
      }
      return;
    }
    const user = result.user;

    // ── Admin ─────────────────────────────────────────────────────────────────
    if (isAdmin(user)) {
      socket.join('admins');
      socket.emit('server:admin_login_success', {
        codename: user.codename,
        rooms: getAllRooms().map((r) => toRoomPublic(r)),
      });
      console.log(`[auth] admin "${user.codename}" conectado`);
      return;
    }

    // ── Player ────────────────────────────────────────────────────────────────
    if (!roomId) {
      console.log(`[auth] login falhou — "${user.codename}" não informou roomId`);
      socket.emit('server:login_failure', { message: 'Informe o código da sala.' });
      return;
    }

    const room = getRoom(roomId.toUpperCase());
    if (!room) {
      console.log(`[auth] login falhou — "${user.codename}" tentou entrar em sala inexistente: "${roomId.toUpperCase()}"`);
      socket.emit('server:login_failure', { message: 'Sala não encontrada.' });
      return;
    }

    const buildSelf = (p: import('../../types').Player) => ({
      codename:        p.codename,
      displayName:     p.displayName,
      image:           p.image,
      status:          p.status,
      hasVotedEndTurn: p.hasVotedEndTurn,
      isConnected:     true,
      modifiers:       p.modifiers,   // próprio jogador recebe seus modificadores
    });

    const buildPublic = (p: import('../../types').Player) => ({
      codename:        p.codename,
      displayName:     p.displayName,
      image:           p.image,
      status:          p.status,
      hasVotedEndTurn: p.hasVotedEndTurn,
      isConnected:     p.isConnected,
    });

    // Reconexão
    const existing = room.players.get(user.codename);
    if (existing) {
      existing.socketId    = socket.id;
      existing.isConnected = true;
      socket.join(room.id);

      socket.emit('server:login_success', {
        player:  buildSelf(existing),
        roomId:  room.id,
        players: Array.from(room.players.values()).map(buildPublic),
        phase:   room.phase,
        round:   room.round,
      });

      io.to('admins').emit('admin:room_update', toRoomPublic(room));
      return;
    }

    // Novo jogador
    const added = addPlayerToRoom(room, user.codename, socket.id);
    if (!added) {
      console.log(`[auth] login falhou — não foi possível adicionar "${user.codename}" à sala ${room.id}`);
      socket.emit('server:login_failure', { message: 'Não foi possível entrar na sala.' });
      return;
    }

    socket.join(room.id);
    const player = room.players.get(user.codename)!;

    socket.emit('server:login_success', {
      player:  buildSelf(player),
      roomId:  room.id,
      players: Array.from(room.players.values()).map(buildPublic),
      phase:   room.phase,
      round:   room.round,
    });

    // Notifica jogadores e watchers da sala
    socket.to(room.id).emit('server:player_joined', buildPublic(player));

    // Notifica admins
    io.to('admins').emit('admin:room_update', toRoomPublic(room));

    console.log(`[auth] "${user.codename}" entrou na sala ${room.id}`);
  });

  // ── Watcher público (tela de TV) ───────────────────────────────────────────
  socket.on('client:watch_room', (roomId: string) => {
    const room = getRoom(roomId?.toUpperCase?.());
    if (!room) {
      socket.emit('server:error', { message: 'Sala não encontrada.' });
      return;
    }

    socket.join(room.id);   // recebe player_joined / player_disconnected em tempo real

    socket.emit('server:room_state', {
      roomId:       room.id,
      phase:        room.phase,
      round:        room.round,
      turnDuration: room.turnDuration,
      roundStartAt: room.roundStartAt,
      players: Array.from(room.players.values()).map((p) => ({
        codename:        p.codename,
        displayName:     p.displayName,
        image:           p.image,
        status:          p.status,
        hasVotedEndTurn: p.hasVotedEndTurn,
        isConnected:     p.isConnected,
      })),
    });
  });

  socket.on('disconnect', () => {
    const found = findRoomBySocket(socket.id);
    if (!found) return;

    for (const player of found.players.values()) {
      if (player.socketId === socket.id) {
        markPlayerDisconnected(found, player.codename);
        socket.to(found.id).emit('server:player_disconnected', { codename: player.codename });
        io.to('admins').emit('admin:room_update', toRoomPublic(found));
        console.log(`[auth] "${player.codename}" desconectou da sala ${found.id}`);
        return;
      }
    }
  });
}
