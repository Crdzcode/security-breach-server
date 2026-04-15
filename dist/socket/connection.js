"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const authEvents_1 = require("./events/authEvents");
const lobbyEvents_1 = require("./events/lobbyEvents");
const gameEvents_1 = require("./events/gameEvents");
const blackjackEvents_1 = require("./events/blackjackEvents");
function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log(`[socket] connected: ${socket.id}`);
        (0, authEvents_1.registerAuthEvents)(io, socket);
        (0, lobbyEvents_1.registerLobbyEvents)(io, socket);
        (0, gameEvents_1.registerGameEvents)(io, socket);
        (0, blackjackEvents_1.registerBlackjackEvents)(io, socket);
        socket.on('disconnect', () => {
            console.log(`[socket] disconnected: ${socket.id}`);
        });
    });
}
