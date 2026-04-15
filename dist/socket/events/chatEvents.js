"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatEvents = registerChatEvents;
const roomManager_1 = require("../../rooms/roomManager");
const crypto_1 = require("crypto");
// key = sorted codenames "A:B"
function convKey(a, b) {
    return [a, b].sort().join(':');
}
function registerChatEvents(io, socket) {
    // Send a private message
    socket.on('client:chat_send', (payload) => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        const { toCodename, content } = payload;
        if (!content?.trim() || toCodename === player.codename)
            return;
        const target = room.players.get(toCodename);
        if (!target)
            return;
        const message = {
            id: (0, crypto_1.randomUUID)(),
            fromCodename: player.codename,
            fromDisplayName: player.displayName,
            toCodename,
            content: content.trim().slice(0, 500),
            timestamp: Date.now(),
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
    socket.on('client:chat_history', (payload) => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        const key = convKey(player.codename, payload.withCodename);
        const messages = room.chatMessages.get(key) ?? [];
        socket.emit('server:chat_history', { withCodename: payload.withCodename, messages });
    });
}
