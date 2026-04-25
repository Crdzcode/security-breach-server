import type { Server, Socket } from 'socket.io';
import type { PlayerActionPayload } from '../../types';
import { getRoom, findPlayerBySocket, setRoomPhase, resetTurnState, toRoomPublic } from '../../rooms/roomManager';
import { createBlackjackSession, createSalvaguardaSession } from '../../game/blackjack';
import { resolveAllActions, applyPoisonDamage, applyDownedDecay } from '../../game/actions/resolveAction';
import { checkWinCondition } from '../../game/winCondition';

// Active blackjack sessions keyed by codename
export const blackjackSessions = new Map<string, import('../../types').BlackjackSession>();

// Habilidades ofensivas — não podem acertar aliados
const OFFENSIVE_ABILITIES = new Set([
  'Presas da Serpente',
  'Fatiar e picar',
  'Atirar pra matar',
  'Sabotagem',
  'Preso em nome da lei',
]);

// Habilidades que só podem ter alvos mortos
const DEAD_TARGET_ABILITIES = new Set(['Autópsia']);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildPlayers(room: import('../../types').Room) {
  return Array.from(room.players.values()).map((p) => ({
    codename:        p.codename,
    displayName:     p.displayName,
    image:           p.image,
    status:          p.displayStatus ?? p.status,  // status mascarado quando VIP usa passiva
    hasVotedEndTurn: p.hasVotedEndTurn,
    isConnected:     p.isConnected,
    wasAutopsied:    p.wasAutopsied,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Game events
// ─────────────────────────────────────────────────────────────────────────────

export function registerGameEvents(io: Server, socket: Socket): void {

  // Player submits an action — triggers blackjack
  socket.on('client:use_ability', (payload: PlayerActionPayload) => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
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

    // Validação de alvo
    if (targetCodename) {
      const target = room.players.get(targetCodename);
      if (!target) {
        socket.emit('server:error', { message: 'Alvo não encontrado.' });
        return;
      }
      if (OFFENSIVE_ABILITIES.has(abilityName)) {
        if (target.status !== 'alive') {
          socket.emit('server:error', { message: 'Alvo inválido: precisa estar vivo.' });
          return;
        }
        if (player.teammates.includes(targetCodename)) {
          socket.emit('server:error', { message: 'Você não pode usar esta habilidade em um aliado.' });
          return;
        }
      }
      if (DEAD_TARGET_ABILITIES.has(abilityName) && target.status !== 'deceased') {
        socket.emit('server:error', { message: 'Esta habilidade só pode ser usada em agentes eliminados.' });
        return;
      }
      // Bloqueia alvos abatidos para qualquer habilidade exceto Primeiros socorros
      if (target.status === 'downed' && abilityName !== 'Primeiros socorros') {
        socket.emit('server:error', { message: 'Agente abatido: só pode receber primeiros socorros.' });
        return;
      }
      // Primeiros socorros não pode ser usado em agentes já eliminados
      if (abilityName === 'Primeiros socorros' && target.status === 'deceased') {
        socket.emit('server:error', { message: 'Agente já eliminado: primeiros socorros não têm efeito.' });
        return;
      }
      // Autópsia não pode ser repetida no mesmo corpo
      if (abilityName === 'Autópsia' && target.wasAutopsied) {
        socket.emit('server:error', { message: 'Este corpo já foi analisado.' });
        return;
      }
      // Marca corpo como autopsiado imediatamente (qualquer tentativa consome o slot)
      if (abilityName === 'Autópsia') {
        target.wasAutopsied = true;
      }
    }

    const modifier = statType === 'Força'
      ? player.modifiers.strength
      : statType === 'Inteligência'
        ? player.modifiers.intelligence
        : player.modifiers.dexterity;

    player.actionsUsed++;

    // Verifica se o alvo já foi afetado por outra ação neste turno (condição de corrida)
    if (targetCodename && room.targetedThisRound.includes(targetCodename)) {
      player.actionsUsed = Math.max(0, player.actionsUsed - 1);
      socket.emit('server:action_refund', { message: 'Alvo já afetado nesta rodada. Ação devolvida.' });
      return;
    }
    if (targetCodename) {
      room.targetedThisRound.push(targetCodename);
    }

    const session = createBlackjackSession(
      player.codename,
      room.id,
      abilityName,
      statType,
      targetCodename,
      modifier,
    );
    blackjackSessions.set(player.codename, session);

    socket.emit('server:blackjack_start', {
      playerHand:    session.playerHand,
      dealerHand:    session.dealerHand,
      playerScore:   calcScore(session.playerHand),
      modifier:      session.modifier,
      winsNeeded:    session.winsNeeded,
      winsAchieved:  session.winsAchieved,
      abilityName:   session.abilityName,
      targetCodename: session.targetCodename,
    });
  });

  // Player votes to end turn
  socket.on('client:vote_end_turn', () => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { room, player } = found;

    if (room.phase !== 'action') return;
    if (player.hasVotedEndTurn) return;

    player.hasVotedEndTurn = true;
    room.voteCount++;

    const eligible = Array.from(room.players.values()).filter(
      (p) => p.status === 'alive' && !p.isArrested && !blackjackSessions.has(p.codename),
    );
    io.in(room.id).emit('server:vote_update', { votes: room.voteCount, needed: eligible.length });

    if (room.voteCount >= eligible.length) {
      endTurn(io, room);
    }
  });

  // Player votes to start the next round (from report screen)
  socket.on('client:vote_next_round', () => {
    const found = findPlayerBySocket(socket.id);
    if (!found) return;
    const { room, player } = found;

    if (room.phase !== 'report') return;

    // Só jogadores vivos e conectados podem votar
    if (player.status !== 'alive' || !player.isConnected) return;

    // Prevent double-vote
    if (player.hasVotedEndTurn) return;
    player.hasVotedEndTurn = true;
    room.nextRoundVoteCount++;

    // Usa o snapshot fixo calculado ao entrar na fase report
    const needed = room.nextRoundVotesNeeded;

    io.in(room.id).emit('server:next_round_vote', {
      votes:  room.nextRoundVoteCount,
      needed,
    });

    if (needed > 0 && room.nextRoundVoteCount >= needed) {
      startNextRound(io, room);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Turn resolution
// ─────────────────────────────────────────────────────────────────────────────

function calcScore(hand: import('../../types').Card[]): number {
  let score = 0;
  let aces = 0;
  for (const c of hand) {
    if (['J', 'Q', 'K'].includes(c.rank)) score += 10;
    else if (c.rank === 'A') { score += 11; aces++; }
    else score += parseInt(c.rank, 10);
  }
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-timer: ends the turn automatically when turnDuration expires
// ─────────────────────────────────────────────────────────────────────────────

export function startTurnTimer(io: Server, room: import('../../types').Room): void {
  if (room.turnTimer) clearTimeout(room.turnTimer);
  room.turnTimer = setTimeout(() => {
    room.turnTimer = undefined;
    if (room.phase === 'action') {
      endTurn(io, room);
    }
  }, room.turnDuration * 1000);
}

function autopsyDescription(killerStatType: import('../../types').StatType): string {
  if (killerStatType === 'Inteligência') return 'A morte parece calculada, fria. Há sinais claros de planejamento — o assassino age com a cabeça, não com as mãos.';
  if (killerStatType === 'Destreza') return 'A ferida é precisa, limpa. Parece ter sido feita por alguém extremamente habilidoso — sem desperdício de movimento.';
  return 'A morte foi brutal, violenta. Há destruição acentuada no corpo — força excessiva foi empregada.';
}

export function endTurn(io: Server, room: import('../../types').Room): void {
  // Cancel auto-timer so it doesn't double-fire if players voted manually
  if (room.turnTimer) { clearTimeout(room.turnTimer); room.turnTimer = undefined; }
  setRoomPhase(room, 'resolving');

  // Force-fail any salvaguarda sessions still active (turn timer ran out)
  for (const [codename, session] of blackjackSessions) {
    if (session.isSalvaguarda && session.roomId === room.id) {
      const p = room.players.get(codename);
      if (p) {
        p.salvaguardaPlayed = true;
        if (p.isConnected) {
          io.to(p.socketId).emit('server:blackjack_result', {
            outcome: 'failure',
            playerScore: 0,
            dealerScore: 0,
            playerHand: session.playerHand,
            dealerHand: session.dealerHand.map((c) => ({ ...c, hidden: false })),
            description: 'Tempo esgotado. Protocolo de salvaguarda falhou.',
          });
        }
      }
      blackjackSessions.delete(codename);
    }
  }

  // Expira efeitos da rodada anterior (prisão e esconder duram 1 turno)
  // Deve rodar ANTES de resolveAllActions para que o turn report reflita
  // os novos efeitos da rodada atual, não o reset dos anteriores.
  for (const player of room.players.values()) {
    if (player.isArrested) {
      player.isArrested = false;
      if (player.status === 'arrested') player.status = 'alive';
    }
    if (player.status === 'hiding') player.status = 'alive';
  }

  const log: string[] = [];
  resolveAllActions(room);
  applyPoisonDamage(room, log);
  applyDownedDecay(room, log);
  room.actionLog.push(...log);

  // Emite resultados de autópsia para cada jogador que a realizou
  for (const autopsy of room.pendingAutopsyResults) {
    const actor = room.players.get(autopsy.actorCodename);
    if (!actor || !actor.isConnected) continue;
    io.to(actor.socketId).emit('server:autopsy_result', {
      targetCodename:    autopsy.targetCodename,
      targetDisplayName: autopsy.targetDisplayName,
      causeOfDeath:      autopsy.causeOfDeath,
      killerStatType:    autopsy.killerStatType,
      description:       autopsyDescription(autopsy.killerStatType),
    });
  }
  room.pendingAutopsyResults = [];

  // Emite notificação ao VIP se a passiva foi usada neste turno
  if (room.pendingVipAutoEscape) {
    const vip = room.players.get(room.pendingVipAutoEscape);
    if (vip && vip.isConnected) {
      io.to(vip.socketId).emit('server:vip_auto_escaped');
    }
    room.pendingVipAutoEscape = undefined;
  }

  const winner = checkWinCondition(room);
  room.winner = winner;

  setRoomPhase(room, winner ? 'game_over' : 'report');

  // Reset e snapshot de votos — calculado UMA VEZ aqui para não variar com desconexões
  for (const player of room.players.values()) {
    player.hasVotedEndTurn = false;
  }
  room.nextRoundVoteCount = 0;
  room.nextRoundVotesNeeded = Array.from(room.players.values()).filter(
    (p) => p.status === 'alive' && !p.displayStatus && p.isConnected,
  ).length;

  const classReveal: Record<string, import('../../types').AgentClass> | undefined = winner
    ? Object.fromEntries(
        Array.from(room.players.entries())
          .filter(([, p]) => p.class !== null)
          .map(([codename, p]) => [codename, p.class as import('../../types').AgentClass]),
      )
    : undefined;

  io.in(room.id).emit('server:turn_report', {
    round:          room.round,
    log:            room.actionLog,
    players:        buildPlayers(room),
    winner,
    classReveal,
    tasksRemaining: room.tasksRemaining,
  });

  io.to('admins').emit('admin:room_update', toRoomPublic(room));

  // No automatic next-round advance — players vote via client:vote_next_round
}

// ─────────────────────────────────────────────────────────────────────────────
// Start next round
// ─────────────────────────────────────────────────────────────────────────────

export function startNextRound(io: Server, room: import('../../types').Room): void {
  room.round++;
  setRoomPhase(room, 'action');
  resetTurnState(room);
  room.actionLog  = [];
  room.roundStartAt = Date.now();

  io.in(room.id).emit('server:game_update', {
    phase:        room.phase,
    round:        room.round,
    players:      buildPlayers(room),
    turnDuration: room.turnDuration,
    roundStartAt: room.roundStartAt,
  });

  io.to('admins').emit('admin:room_update', toRoomPublic(room));

  // Emit salvaguarda session to each downed player who hasn't played one yet
  // Jogadores presos neste turno (isArrested = true) não recebem salvaguarda
  for (const player of room.players.values()) {
    if (player.status === 'downed' && !player.salvaguardaPlayed && player.isConnected && !player.isArrested) {
      const session = createSalvaguardaSession(player.codename, room.id);
      blackjackSessions.set(player.codename, session);
      io.to(player.socketId).emit('server:blackjack_start', {
        playerHand:     session.playerHand,
        dealerHand:     session.dealerHand,
        playerScore:    calcScore(session.playerHand),
        modifier:       session.modifier,
        winsNeeded:     session.winsNeeded,
        winsAchieved:   session.winsAchieved,
        abilityName:    session.abilityName,
        targetCodename: session.targetCodename,
        isSalvaguarda:  true,
      });
    }
  }

  startTurnTimer(io, room);

  console.log(`[game] rodada ${room.round} iniciada na sala ${room.id}`);
}
