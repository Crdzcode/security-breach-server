import type { Server } from 'socket.io';
import { registerAuthEvents } from './events/authEvents';
import { registerLobbyEvents } from './events/lobbyEvents';
import { registerGameEvents } from './events/gameEvents';
import { registerBlackjackEvents } from './events/blackjackEvents';

export function setupSocket(io: Server): void {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    registerAuthEvents(io, socket);
    registerLobbyEvents(io, socket);
    registerGameEvents(io, socket);
    registerBlackjackEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
