import type { Server } from 'socket.io';
import { registerAuthEvents } from './events/authEvents';
import { registerLobbyEvents } from './events/lobbyEvents';
import { registerGameEvents } from './events/gameEvents';
import { registerBlackjackEvents } from './events/blackjackEvents';
import { registerChatEvents } from './events/chatEvents';

export function setupSocket(io: Server): void {
  io.on('connection', (socket) => {
    const transport = socket.conn.transport.name;
    console.log(`[socket] connected: ${socket.id} (transport: ${transport})`);

    socket.conn.on('upgrade', (newTransport) => {
      console.log(`[socket] upgraded: ${socket.id} polling → ${newTransport.name}`);
    });

    registerAuthEvents(io, socket);
    registerLobbyEvents(io, socket);
    registerGameEvents(io, socket);
    registerBlackjackEvents(io, socket);
    registerChatEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
