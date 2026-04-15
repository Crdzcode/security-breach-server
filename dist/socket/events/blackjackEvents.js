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
            // Emite a carta ANTES de processar o bust — o frontend deve ver o estouro acontecer
            socket.emit('server:blackjack_hit', {
                card,
                playerHand: session.playerHand,
                playerScore: score,
            });
            // Bust — salva mão estourada antes de playerBust resetar a sessão
            const savedPlayerHand = [...session.playerHand];
            const result = (0, blackjack_1.playerBust)(session);
            if (result.continuing) {
                // Modificador +1: exibe falha e aguarda interação do jogador para retry
                socket.emit('server:blackjack_result', {
                    outcome: 'failure',
                    playerScore: result.playerScore,
                    dealerScore: result.dealerScore,
                    playerHand: savedPlayerHand,
                    dealerHand: result.dealerHand,
                    description: 'Você estourou. Vantagem ativa — uma nova chance disponível.',
                    retryAvailable: true,
                });
                return;
            }
            // Sem retry — falha definitiva
            gameEvents_1.blackjackSessions.delete(player.codename);
            if (session.isSalvaguarda) {
                player.salvaguardaPlayed = true;
                socket.emit('server:blackjack_result', {
                    outcome: 'failure',
                    playerScore: result.playerScore,
                    dealerScore: result.dealerScore,
                    playerHand: session.playerHand,
                    dealerHand: result.dealerHand,
                    description: 'Você estourou. Protocolo de salvaguarda falhou.',
                });
                return;
            }
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
    // Player confirma retry após ver a falha da 1ª tentativa (vantagem +1)
    socket.on('client:blackjack_retry', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { player } = found;
        const session = gameEvents_1.blackjackSessions.get(player.codename);
        // Só válido se a retry foi ativada (lossRetryUsed = true) e sessão ainda aberta
        if (!session || !session.lossRetryUsed || session.phase !== 'player_turn')
            return;
        socket.emit('server:blackjack_start', {
            playerHand: session.playerHand,
            dealerHand: session.dealerHand,
            playerScore: (0, blackjack_1.handScore)(session.playerHand),
            modifier: session.modifier,
            winsNeeded: session.winsNeeded,
            winsAchieved: session.winsAchieved,
            abilityName: session.abilityName,
            targetCodename: session.targetCodename,
            isSalvaguarda: session.isSalvaguarda,
        });
    });
    // Player confirma continuar após ver resultado de rodada intermediária (empate ou -1)
    socket.on('client:blackjack_continue', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { player } = found;
        const session = gameEvents_1.blackjackSessions.get(player.codename);
        if (!session || session.phase !== 'player_turn')
            return;
        socket.emit('server:blackjack_start', {
            playerHand: session.playerHand,
            dealerHand: session.dealerHand,
            playerScore: (0, blackjack_1.handScore)(session.playerHand),
            modifier: session.modifier,
            winsNeeded: session.winsNeeded,
            winsAchieved: session.winsAchieved,
            abilityName: session.abilityName,
            targetCodename: session.targetCodename,
            isSalvaguarda: session.isSalvaguarda,
        });
    });
    // Player cancels before making any move — undo the action use
    socket.on('client:blackjack_cancel', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { player } = found;
        const session = gameEvents_1.blackjackSessions.get(player.codename);
        if (!session || session.phase !== 'player_turn')
            return;
        // Salvaguarda cannot be cancelled — it's a life-or-death protocol
        if (session.isSalvaguarda)
            return;
        // Only allow cancel before first interaction: initial 2-card hand, no wins/retries yet
        if (session.playerHand.length > 2 || session.lossRetryUsed || session.winsAchieved > 0)
            return;
        gameEvents_1.blackjackSessions.delete(player.codename);
        player.actionsUsed = Math.max(0, player.actionsUsed - 1);
        socket.emit('server:blackjack_cancelled');
    });
    socket.on('client:blackjack_stand', () => {
        const found = (0, roomManager_1.findPlayerBySocket)(socket.id);
        if (!found)
            return;
        const { room, player } = found;
        const session = gameEvents_1.blackjackSessions.get(player.codename);
        if (!session || session.phase !== 'player_turn')
            return;
        const savedPlayerHand = [...session.playerHand];
        const result = (0, blackjack_1.playerStand)(session);
        if (result.continuing) {
            if (result.retryAvailable) {
                // +1 modifier, primeira tentativa falhou — exibe falha e aguarda retry
                socket.emit('server:blackjack_result', {
                    outcome: 'failure',
                    playerScore: result.playerScore,
                    dealerScore: result.dealerScore,
                    playerHand: savedPlayerHand,
                    dealerHand: result.dealerHand,
                    description: 'Você perdeu. Vantagem ativa — uma nova chance disponível.',
                    retryAvailable: true,
                });
                return;
            }
            // Empate ou múltiplas vitórias necessárias — exibe resultado e aguarda "Continuar"
            socket.emit('server:blackjack_update', {
                playerHand: savedPlayerHand,
                dealerHand: result.dealerHand,
                playerScore: result.playerScore,
                dealerScore: result.dealerScore,
                roundOutcome: result.outcome,
                winsAchieved: session.winsAchieved,
                winsNeeded: session.winsNeeded,
                continuing: true,
            });
            return;
        }
        // Session complete
        const succeeded = (0, blackjack_1.sessionSucceeded)(session);
        gameEvents_1.blackjackSessions.delete(player.codename);
        if (session.isSalvaguarda) {
            if (succeeded) {
                player.status = 'alive';
                player.hasSurvivedDeath = true;
                // Jogador salvo não age neste turno — marca ações como consumidas
                player.actionsUsed = player.maxActions;
            }
            else {
                player.salvaguardaPlayed = true;
            }
            socket.emit('server:blackjack_result', {
                outcome: succeeded ? 'success' : 'failure',
                playerScore: result.playerScore,
                dealerScore: result.dealerScore,
                playerHand: session.playerHand,
                dealerHand: result.dealerHand,
                description: succeeded
                    ? 'Protocolo de sobrevivência executado. Sistema parcialmente restaurado.'
                    : 'Falha crítica. Aguardando auxílio externo.',
            });
            return;
        }
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
