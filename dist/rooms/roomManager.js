"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRoom = getRoom;
exports.getAllRooms = getAllRooms;
exports.deleteRoom = deleteRoom;
exports.addPlayerToRoom = addPlayerToRoom;
exports.removePlayerFromRoom = removePlayerFromRoom;
exports.markPlayerConnected = markPlayerConnected;
exports.markPlayerDisconnected = markPlayerDisconnected;
exports.findRoomBySocket = findRoomBySocket;
exports.findPlayerBySocket = findPlayerBySocket;
exports.setRoomPhase = setRoomPhase;
exports.resetTurnState = resetTurnState;
exports.toRoomPublic = toRoomPublic;
const users_1 = require("../auth/users");
// ─────────────────────────────────────────────────────────────────────────────
// In-memory room store
// ─────────────────────────────────────────────────────────────────────────────
const rooms = new Map();
// ─── ID generation ────────────────────────────────────────────────────────────
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}
function uniqueRoomId() {
    let id = generateRoomId();
    while (rooms.has(id))
        id = generateRoomId();
    return id;
}
// ─── CRUD ─────────────────────────────────────────────────────────────────────
function createRoom(hostSocketId, turnDuration = 120, tasks = 0) {
    const id = uniqueRoomId();
    const room = {
        id,
        hostSocketId,
        players: new Map(),
        phase: 'lobby',
        round: 0,
        pendingActions: [],
        actionLog: [],
        voteCount: 0,
        nextRoundVoteCount: 0,
        winner: null,
        turnDuration,
        roundStartAt: 0,
        targetedThisRound: [],
        pendingAutopsyResults: [],
        pendingVipAutoEscape: undefined,
        tasksTotal: tasks,
        tasksRemaining: tasks,
        chatMessages: new Map(),
    };
    rooms.set(id, room);
    return room;
}
function getRoom(id) {
    return rooms.get(id);
}
function getAllRooms() {
    return Array.from(rooms.values());
}
function deleteRoom(id) {
    rooms.delete(id);
}
// ─── Player management ────────────────────────────────────────────────────────
/** Adds a player to the room. Returns false if the room is full or game already started. */
function addPlayerToRoom(room, codename, socketId) {
    if (room.phase !== 'lobby')
        return false;
    const user = users_1.USERS_MAP.get(codename);
    if (!user)
        return false;
    const player = {
        codename: user.codename,
        socketId,
        displayName: user.fullName,
        image: user.image,
        class: null,
        status: 'alive',
        isArrested: false,
        isPoisoned: false,
        teammates: [],
        actionsUsed: 0,
        maxActions: 1,
        hasVotedEndTurn: false,
        isConnected: true,
        modifiers: user.modifiers,
        hasSurvivedDeath: false,
        firstAidConsumed: false,
        salvaguardaPlayed: false,
        wasAutopsied: false,
    };
    room.players.set(codename, player);
    return true;
}
function removePlayerFromRoom(room, codename) {
    room.players.delete(codename);
}
function markPlayerConnected(room, codename, socketId) {
    const player = room.players.get(codename);
    if (!player)
        return;
    player.socketId = socketId;
    player.isConnected = true;
}
function markPlayerDisconnected(room, codename) {
    const player = room.players.get(codename);
    if (!player)
        return;
    player.isConnected = false;
}
/** Returns the room a socket is currently in, if any. */
function findRoomBySocket(socketId) {
    for (const room of rooms.values()) {
        for (const player of room.players.values()) {
            if (player.socketId === socketId)
                return room;
        }
        if (room.hostSocketId === socketId)
            return room;
    }
    return undefined;
}
/** Returns the player object matching the socket ID. */
function findPlayerBySocket(socketId) {
    for (const room of rooms.values()) {
        for (const player of room.players.values()) {
            if (player.socketId === socketId)
                return { room, player };
        }
    }
    return undefined;
}
// ─── Phase transitions ────────────────────────────────────────────────────────
function setRoomPhase(room, phase) {
    room.phase = phase;
}
function resetTurnState(room) {
    room.pendingActions = [];
    room.voteCount = 0;
    room.nextRoundVoteCount = 0;
    room.targetedThisRound = [];
    room.pendingAutopsyResults = [];
    room.pendingVipAutoEscape = undefined;
    for (const player of room.players.values()) {
        player.hasVotedEndTurn = false;
        player.actionsUsed = 0;
        player.displayStatus = undefined;
    }
}
// ─── Public view helpers ──────────────────────────────────────────────────────
function toRoomPublic(room) {
    return {
        id: room.id,
        playerCount: room.players.size,
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
    };
}
