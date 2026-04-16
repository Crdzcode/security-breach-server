import type { Room, Player, GamePhase, RoomPublic } from '../types';
import { USERS_MAP } from '../auth/users';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory room store
// ─────────────────────────────────────────────────────────────────────────────

const rooms = new Map<string, Room>();

// ─── ID generation ────────────────────────────────────────────────────────────

function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function uniqueRoomId(): string {
  let id = generateRoomId();
  while (rooms.has(id)) id = generateRoomId();
  return id;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function createRoom(hostSocketId: string, turnDuration = 120, tasks = 0): Room {
  const id = uniqueRoomId();
  const room: Room = {
    id,
    hostSocketId,
    players: new Map(),
    phase: 'lobby',
    round: 0,
    pendingActions: [],
    actionLog: [],
    voteCount: 0,
    nextRoundVoteCount: 0,
    nextRoundVotesNeeded: 0,
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

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values());
}

export function deleteRoom(id: string): void {
  rooms.delete(id);
}

// ─── Player management ────────────────────────────────────────────────────────

/** Adds a player to the room. Returns false if the room is full or game already started. */
export function addPlayerToRoom(room: Room, codename: string, socketId: string): boolean {
  if (room.phase !== 'lobby') return false;

  const user = USERS_MAP.get(codename);
  if (!user) return false;

  const player: Player = {
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

export function removePlayerFromRoom(room: Room, codename: string): void {
  room.players.delete(codename);
}

export function markPlayerConnected(room: Room, codename: string, socketId: string): void {
  const player = room.players.get(codename);
  if (!player) return;
  player.socketId = socketId;
  player.isConnected = true;
}

export function markPlayerDisconnected(room: Room, codename: string): void {
  const player = room.players.get(codename);
  if (!player) return;
  player.isConnected = false;
}

/** Returns the room a socket is currently in, if any. */
export function findRoomBySocket(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.socketId === socketId) return room;
    }
    if (room.hostSocketId === socketId) return room;
  }
  return undefined;
}

/** Returns the player object matching the socket ID. */
export function findPlayerBySocket(socketId: string): { room: Room; player: Player } | undefined {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.socketId === socketId) return { room, player };
    }
  }
  return undefined;
}

// ─── Phase transitions ────────────────────────────────────────────────────────

export function setRoomPhase(room: Room, phase: GamePhase): void {
  room.phase = phase;
}

export function resetTurnState(room: Room): void {
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

export function toRoomPublic(room: Room): RoomPublic {
  return {
    id: room.id,
    playerCount: room.players.size,
    phase: room.phase,
    round: room.round,
    players: Array.from(room.players.values()).map((p) => ({
      codename:        p.codename,
      displayName:     p.displayName,
      image:           p.image,
      status:          p.status,
      hasVotedEndTurn: p.hasVotedEndTurn,
      isConnected:     p.isConnected,
    })),
  };
}
