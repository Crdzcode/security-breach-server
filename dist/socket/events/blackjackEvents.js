"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBlackjackEvents = registerBlackjackEvents;
const roomManager_1 = require("../../rooms/roomManager");
const blackjack_1 = require("../../game/blackjack");
const gameEvents_1 = require("./gameEvents");
const resolveAction_1 = require("../../game/actions/resolveAction");
// ─────────────────────────────────────────────────────────────────────────────
// Blackjack events
// ─────────────────────────────────────────────────────────────────────────────
function registerBlackjackEvents(io, socket) {
    socket.on('client:blackjack_hit', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        const session = gameEvents_1.blackjackSessions.get(player.codename);
        if (!session || session.phase !== 'player_turn')
            return;
        const card = (0, blackjack_1.playerHit)(session);
        const score = (0, blackjack_1.handScore)(session.playerHand);
        if (score > 21) {
            // Bust
            const result = (0, blackjack_1.playerBust)(session);
            gameEvents_1.blackjackSessions.delete(player.codename);
            socket.emit('server:blackjack_result', {
                outcome: 'failure',
                playerScore: result.playerScore,
                dealerScore: result.dealerScore,
                playerHand: session.playerHand,
                dealerHand: result.dealerHand,
                description: 'Você estourou. A ação falhou.',
            });
            (0, resolveAction_1.queueAction)(room, player.codename, session.abilityName, session.statType, session.targetCodename, false);
            checkAllActionsQueued(io, room);
            return;
        }
        // Still in play — send update
        socket.emit('server:blackjack_hit', {
            card,
            playerHand: session.playerHand,
            playerScore: score,
        });
    });
    socket.on('client:blackjack_stand', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        const session = gameEvents_1.blackjackSessions.get(player.codename);
        if (!session || session.phase !== 'player_turn')
            return;
        const result = (0, blackjack_1.playerStand)(session);
        if (result.continuing) {
            // Another round needed (draw or +1 modifier retry)
            const dealerVisible = session.dealerHand.find((c) => !c.hidden);
            socket.emit('server:blackjack_update', {
                playerHand: session.playerHand,
                dealerHand: result.dealerHand,
                playerScore: result.playerScore,
                dealerScore: result.dealerScore,
                roundOutcome: result.outcome,
                winsAchieved: session.winsAchieved,
                winsNeeded: session.winsNeeded,
                continuing: true,
            });
            // Reset for next round — new hands already set by playerStand
            socket.emit('server:blackjack_start', {
                playerHand: session.playerHand,
                dealerVisibleCard: dealerVisible,
                playerScore: (0, blackjack_1.handScore)(session.playerHand),
                modifier: session.modifier,
                winsNeeded: session.winsNeeded,
                winsAchieved: session.winsAchieved,
                abilityName: session.abilityName,
                targetCodename: session.targetCodename,
            });
            return;
        }
        // Session complete
        const succeeded = (0, blackjack_1.sessionSucceeded)(session);
        gameEvents_1.blackjackSessions.delete(player.codename);
        socket.emit('server:blackjack_result', {
            outcome: succeeded ? 'success' : 'failure',
            playerScore: result.playerScore,
            dealerScore: result.dealerScore,
            playerHand: session.playerHand,
            dealerHand: result.dealerHand,
            description: succeeded
                ? 'Você venceu. A ação foi executada com sucesso.'
                : 'O dealer venceu. A ação falhou.',
        });
        (0, resolveAction_1.queueAction)(room, player.codename, session.abilityName, session.statType, session.targetCodename, succeeded);
        checkAllActionsQueued(io, room);
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// After each blackjack session completes, check if all active players are done
// ─────────────────────────────────────────────────────────────────────────────
function checkAllActionsQueued(io, room) {
    const activePlayers = Array.from(room.players.values()).filter((p) => p.status === 'alive' && !p.isArrested);
    // All players that have used all their actions (or have an active bj session)
    const allDone = activePlayers.every((p) => p.actionsUsed >= p.maxActions && !gameEvents_1.blackjackSessions.has(p.codename));
    if (allDone) {
        (0, gameEvents_1.endTurn)(io, room);
    }
}
