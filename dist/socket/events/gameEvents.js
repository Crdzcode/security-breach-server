"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blackjackSessions = void 0;
exports.registerGameEvents = registerGameEvents;
exports.endTurn = endTurn;
const roomManager_1 = require("../../rooms/roomManager");
const blackjack_1 = require("../../game/blackjack");
const resolveAction_1 = require("../../game/actions/resolveAction");
const winCondition_1 = require("../../game/winCondition");
// Active blackjack sessions keyed by codename
exports.blackjackSessions = new Map();
// ─────────────────────────────────────────────────────────────────────────────
// Game events
// ─────────────────────────────────────────────────────────────────────────────
function registerGameEvents(io, socket) {
    // Player submits an action — triggers blackjack
    socket.on('client:use_ability', (payload) => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        if (room.phase !== 'action') {
            socket.emit('server:error', { message: 'Não é a fase de ações.' });
            return;
        }
        if (player.status !== 'alive') {
            socket.emit('server:error', { message: 'Você não pode agir.' });
            return;
        }
        if (player.isArrested) {
            socket.emit('server:error', { message: 'Você está preso e não pode agir.' });
            return;
        }
        if (player.actionsUsed >= player.maxActions) {
            socket.emit('server:error', { message: 'Você já usou todas as suas ações.' });
            return;
        }
        const { abilityName, statType, targetCodename } = payload;
        const modifier = statType === 'Força'
            ? player.modifiers.strength
            : statType === 'Inteligência'
                ? player.modifiers.intelligence
                : player.modifiers.dexterity;
        player.actionsUsed++;
        // Create blackjack session for this action
        const session = (0, blackjack_1.createBlackjackSession)(player.codename, room.id, abilityName, statType, targetCodename, modifier);
        exports.blackjackSessions.set(player.codename, session);
        // Send blackjack start payload
        const dealerVisible = session.dealerHand.find((c) => !c.hidden);
        socket.emit('server:blackjack_start', {
            playerHand: session.playerHand,
            dealerVisibleCard: dealerVisible,
            playerScore: calcScore(session.playerHand),
            modifier: session.modifier,
            winsNeeded: session.winsNeeded,
            winsAchieved: session.winsAchieved,
            abilityName: session.abilityName,
            targetCodename: session.targetCodename,
        });
    });
    // Player votes to end turn
    socket.on('client:vote_end_turn', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        if (room.phase !== 'action')
            return;
        if (player.hasVotedEndTurn)
            return;
        player.hasVotedEndTurn = true;
        room.voteCount++;
        // Count eligible voters (alive + not arrested)
        const eligible = Array.from(room.players.values()).filter((p) => p.status === 'alive' && !p.isArrested);
        const needed = eligible.length;
        io.in(room.id).emit('server:vote_update', { votes: room.voteCount, needed });
        // All voted — resolve turn
        if (room.voteCount >= needed) {
            endTurn(io, room);
        }
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// Turn resolution
// ─────────────────────────────────────────────────────────────────────────────
function calcScore(hand) {
    let score = 0;
    let aces = 0;
    for (const c of hand) {
        if (['J', 'Q', 'K'].includes(c.rank))
            score += 10;
        else if (c.rank === 'A') {
            score += 11;
            aces++;
        }
        else
            score += parseInt(c.rank, 10);
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}
function endTurn(io, room) {
    (0, roomManager_1.setRoomPhase)(room, 'resolving');
    const log = [];
    (0, resolveAction_1.resolveAllActions)(room);
    (0, resolveAction_1.applyPoisonDamage)(room, log);
    room.actionLog.push(...log);
    // Reset arrested state (arrests last 1 turn)
    for (const player of room.players.values()) {
        player.isArrested = false;
        // Reset hiding status back to alive
        if (player.status === 'hiding')
            player.status = 'alive';
    }
    const winner = (0, winCondition_1.checkWinCondition)(room);
    room.winner = winner;
    (0, roomManager_1.setRoomPhase)(room, winner ? 'game_over' : 'report');
    const players = Array.from(room.players.values()).map((p) => ({
        codename: p.codename,
        displayName: p.displayName,
        image: p.image,
        status: p.status,
        hasVotedEndTurn: p.hasVotedEndTurn,
        isConnected: p.isConnected,
    }));
    io.in(room.id).emit('server:turn_report', {
        round: room.round,
        log: room.actionLog,
        players,
        winner,
    });
    if (!winner) {
        // Advance to next action phase after a delay
        setTimeout(() => {
            room.round++;
            (0, roomManager_1.setRoomPhase)(room, 'action');
            (0, roomManager_1.resetTurnState)(room);
            room.actionLog = [];
            io.in(room.id).emit('server:game_update', {
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
            });
        }, 15000); // 15 seconds to read the report
    }
}
