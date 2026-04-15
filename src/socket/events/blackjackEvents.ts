import type { Server, Socket } from 'socket.io';
import { findPlayerBySocket } from '../../rooms/roomManager';
import { playerHit, playerStand, playerBust, handScore, isSessionComplete, sessionSucceeded } from '../../game/blackjack';
import { blackjackSessions, endTurn } from './gameEvents';
import { queueAction } from '../../game/actions/resolveAction';

// ─────────────────────────────────────────────────────────────────────────────
// Blackjack events
// ─────────────────────────────────────────────────────────────────────────────

export function registerBlackjackEvents(io: Server, socket: Socket): void {

  socket.on('client:blackjack_hit', () => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { room, player } = found;

    const session = blackjackSessions.get(player.codename);
    if (!session || session.phase !== 'player_turn') return;

    const card = playerHit(session);
    const score = handScore(session.playerHand);

    if (score > 21) {
      // Emite a carta ANTES de processar o bust — o frontend deve ver o estouro acontecer
      socket.emit('server:blackjack_hit', {
        card,
        playerHand: session.playerHand,
        playerScore: score,
      });

      // Bust — salva mão estourada antes de playerBust resetar a sessão
      const savedPlayerHand = [...session.playerHand];
      const result = playerBust(session);

      if (result.continuing) {
        // Modificador +1: exibe falha e aguarda interação do jogador para retry
        socket.emit('server:blackjack_result', {
          outcome:        'failure',
          playerScore:    result.playerScore,
          dealerScore:    result.dealerScore,
          playerHand:     savedPlayerHand,
          dealerHand:     result.dealerHand,
          description:    'Você estourou. Vantagem ativa — uma nova chance disponível.',
          retryAvailable: true,
        });
        return;
      }

      // Sem retry — falha definitiva
      blackjackSessions.delete(player.codename);

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

      queueAction(room, player.codename, session.abilityName, session.statType, session.targetCodename, false);
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
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { player } = found;

    const session = blackjackSessions.get(player.codename);
    // Só válido se a retry foi ativada (lossRetryUsed = true) e sessão ainda aberta
    if (!session || !session.lossRetryUsed || session.phase !== 'player_turn') return;

    socket.emit('server:blackjack_start', {
      playerHand:     session.playerHand,
      dealerHand:     session.dealerHand,
      playerScore:    handScore(session.playerHand),
      modifier:       session.modifier,
      winsNeeded:     session.winsNeeded,
      winsAchieved:   session.winsAchieved,
      abilityName:    session.abilityName,
      targetCodename: session.targetCodename,
      isSalvaguarda:  session.isSalvaguarda,
    });
  });

  // Player confirma continuar após ver resultado de rodada intermediária (empate ou -1)
  socket.on('client:blackjack_continue', () => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { player } = found;

    const session = blackjackSessions.get(player.codename);
    if (!session || session.phase !== 'player_turn') return;

    socket.emit('server:blackjack_start', {
      playerHand:     session.playerHand,
      dealerHand:     session.dealerHand,
      playerScore:    handScore(session.playerHand),
      modifier:       session.modifier,
      winsNeeded:     session.winsNeeded,
      winsAchieved:   session.winsAchieved,
      abilityName:    session.abilityName,
      targetCodename: session.targetCodename,
      isSalvaguarda:  session.isSalvaguarda,
    });
  });

  // Player cancels before making any move — undo the action use
  socket.on('client:blackjack_cancel', () => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { player } = found;

    const session = blackjackSessions.get(player.codename);
    if (!session || session.phase !== 'player_turn') return;

    // Salvaguarda cannot be cancelled — it's a life-or-death protocol
    if (session.isSalvaguarda) return;

    // Only allow cancel before first interaction: initial 2-card hand, no wins/retries yet
    if (session.playerHand.length > 2 || session.lossRetryUsed || session.winsAchieved > 0) return;

    blackjackSessions.delete(player.codename);
    player.actionsUsed = Math.max(0, player.actionsUsed - 1);

    socket.emit('server:blackjack_cancelled');
  });

  socket.on('client:blackjack_stand', () => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { room, player } = found;

    const session = blackjackSessions.get(player.codename);
    if (!session || session.phase !== 'player_turn') return;

    const savedPlayerHand = [...session.playerHand];
    const result = playerStand(session);

    if (result.continuing) {
      if (result.retryAvailable) {
        // +1 modifier, primeira tentativa falhou — exibe falha e aguarda retry
        socket.emit('server:blackjack_result', {
          outcome:        'failure',
          playerScore:    result.playerScore,
          dealerScore:    result.dealerScore,
          playerHand:     savedPlayerHand,
          dealerHand:     result.dealerHand,
          description:    'Você perdeu. Vantagem ativa — uma nova chance disponível.',
          retryAvailable: true,
        });
        return;
      }

      // Empate ou múltiplas vitórias necessárias — exibe resultado e aguarda "Continuar"
      socket.emit('server:blackjack_update', {
        playerHand:   savedPlayerHand,
        dealerHand:   result.dealerHand,
        playerScore:  result.playerScore,
        dealerScore:  result.dealerScore,
        roundOutcome: result.outcome,
        winsAchieved: session.winsAchieved,
        winsNeeded:   session.winsNeeded,
        continuing:   true,
      });
      return;
    }

    // Session complete
    const succeeded = sessionSucceeded(session);
    blackjackSessions.delete(player.codename);

    if (session.isSalvaguarda) {
      if (succeeded) {
        player.status = 'alive';
        player.hasSurvivedDeath = true;
        // Jogador salvo não age neste turno — marca ações como consumidas
        player.actionsUsed = player.maxActions;
      } else {
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

    queueAction(room, player.codename, session.abilityName, session.statType, session.targetCodename, succeeded);
    checkAllActionsQueued(io, room);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// After each blackjack session completes, check if all active players are done
// ─────────────────────────────────────────────────────────────────────────────

function checkAllActionsQueued(io: Server, room: import('../../types').Room): void {
  const activePlayers = Array.from(room.players.values()).filter(
    (p) => p.status === 'alive' && !p.isArrested,
  );

  // All players that have used all their actions (or have an active bj session)
  const allDone = activePlayers.every(
    (p) => p.actionsUsed >= p.maxActions && !blackjackSessions.has(p.codename),
  );

  if (allDone) {
    endTurn(io, room);
  }
}
