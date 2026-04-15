"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const authEvents_1 = require("./events/authEvents");
const lobbyEvents_1 = require("./events/lobbyEvents");
const gameEvents_1 = require("./events/gameEvents");
const blackjackEvents_1 = require("./events/blackjackEvents");
const chatEvents_1 = require("./events/chatEvents");
function setupSocket(io) {
    io.on('connection', (socket) => {
        const transport = socket.conn.transport.name;
        console.log(`[socket] connected: ${socket.id} (transport: ${transport})`);
        socket.conn.on('upgrade', (newTransport) => {
            console.log(`[socket] upgraded: ${socket.id} polling → ${newTransport.name}`);
        });
        (0, authEvents_1.registerAuthEvents)(io, socket);
        (0, lobbyEvents_1.registerLobbyEvents)(io, socket);
        (0, gameEvents_1.registerGameEvents)(io, socket);
        (0, blackjackEvents_1.registerBlackjackEvents)(io, socket);
        (0, chatEvents_1.registerChatEvents)(io, socket);
        socket.on('disconnect', () => {
            console.log(`[socket] disconnected: ${socket.id}`);
        });
    });
}
