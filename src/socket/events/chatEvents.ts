import type { Server, Socket } from 'socket.io';
import { findPlayerBySocket } from '../../rooms/roomManager';
import type { ChatMessage } from '../../types';
import { randomUUID } from 'crypto';

// key = sorted codenames "A:B"
function convKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export function registerChatEvents(io: Server, socket: Socket): void {

  // Send a private message
  socket.on('client:chat_send', (payload: { toCodename: string; content: string }) => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { room, player } = found;

    const { toCodename, content } = payload;
    if (!content?.trim() || toCodename === player.codename) return;

    const target = room.players.get(toCodename);
    if (!target) return;

    const message: ChatMessage = {
      id:              randomUUID(),
      fromCodename:    player.codename,
      fromDisplayName: player.displayName,
      toCodename,
      content:         content.trim().slice(0, 500),
      timestamp:       Date.now(),
    };

    const key = convKey(player.codename, toCodename);
    const log = room.chatMessages.get(key) ?? [];
    log.push(message);
    room.chatMessages.set(key, log);

    // Deliver to sender and receiver
    socket.emit('server:chat_message', message);
    if (target.isConnected) {
      io.to(target.socketId).emit('server:chat_message', message);
    }
  });

  // Request history for a specific conversation
  socket.on('client:chat_history', (payload: { withCodename: string }) => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { room, player } = found;

    const key      = convKey(player.codename, payload.withCodename);
    const messages = room.chatMessages.get(key) ?? [];

    socket.emit('server:chat_history', { withCodename: payload.withCodename, messages });
  });
}
