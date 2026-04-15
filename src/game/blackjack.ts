import type { Card, CardRank, CardSuit, BlackjackSession, Modifier, StatType } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Deck helpers
// ─────────────────────────────────────────────────────────────────────────────

const RANKS: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cardValue(card: Card): number {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank, 10);
}

export function handScore(hand: Card[]): number {
  let score = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter((c) => c.rank === 'A').length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function dealOne(deck: Card[]): Card {
  const card = deck.pop();
  if (!card) throw new Error('Deck is empty');
  return card;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session factory
// ─────────────────────────────────────────────────────────────────────────────

export function createBlackjackSession(
  codename: string,
  roomId: string,
  abilityName: string,
  statType: StatType,
  targetCodename: string | null,
  modifier: Modifier,
): BlackjackSession {
  const deck = buildDeck();
  const playerHand: Card[] = [dealOne(deck), dealOne(deck)];
  const dealerHand: Card[] = [dealOne(deck), { ...dealOne(deck), hidden: true }];

  return {
    codename,
    roomId,
    abilityName,
    statType,
    targetCodename,
    deck,
    playerHand,
    dealerHand,
    modifier,
    winsNeeded: modifier === '-1' ? 2 : 1,
    winsAchieved: 0,
    hasRetryOnLoss: modifier === '+1',
    lossRetryUsed: false,
    phase: 'player_turn',
  };
}

/** Creates a survival-check session for downed players (no modifiers, no retry). */
export function createSalvaguardaSession(
  codename: string,
  roomId: string,
): BlackjackSession {
  const deck = buildDeck();
  const playerHand: Card[] = [dealOne(deck), dealOne(deck)];
  const dealerHand: Card[] = [dealOne(deck), { ...dealOne(deck), hidden: true }];

  return {
    codename,
    roomId,
    abilityName: 'Salvaguarda',
    statType: 'Força',
    targetCodename: null,
    deck,
    playerHand,
    dealerHand,
    modifier: '0',
    winsNeeded: 1,
    winsAchieved: 0,
    hasRetryOnLoss: false,
    lossRetryUsed: false,
    phase: 'player_turn',
    isSalvaguarda: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Player actions
// ─────────────────────────────────────────────────────────────────────────────

export type BlackjackRoundResult = {
  outcome: 'win' | 'draw' | 'lose';
  playerScore: number;
  dealerScore: number;
  dealerHand: Card[];
  continuing: boolean;       // true if session stays open for another round
  retryAvailable?: boolean;  // true quando +1 ativa a segunda chance (requer ação do jogador)
};

/** Player hits — returns null if still under 21, or resolves the round. */
export function playerHit(session: BlackjackSession): Card {
  const card = dealOne(session.deck);
  session.playerHand.push(card);
  return card;
}

/** Player stands — dealer plays out, round is evaluated. */
export function playerStand(session: BlackjackSession): BlackjackRoundResult {
  // Reveal dealer hidden card
  session.dealerHand = session.dealerHand.map((c) => ({ ...c, hidden: false }));

  // Dealer hits until ≥17
  while (handScore(session.dealerHand) < 17) {
    session.dealerHand.push(dealOne(session.deck));
  }

  const playerScore = handScore(session.playerHand);
  const dealerScore = handScore(session.dealerHand);

  let outcome: 'win' | 'draw' | 'lose';
  if (playerScore > 21) {
    outcome = 'lose';
  } else if (dealerScore > 21 || playerScore > dealerScore) {
    outcome = 'win';
  } else if (playerScore === dealerScore) {
    outcome = 'draw';
  } else {
    outcome = 'lose';
  }

  return resolveRound(session, outcome, playerScore, dealerScore);
}

/** Called when player busts (score > 21). */
export function playerBust(session: BlackjackSession): BlackjackRoundResult {
  session.dealerHand = session.dealerHand.map((c) => ({ ...c, hidden: false }));
  const playerScore = handScore(session.playerHand);
  const dealerScore = handScore(session.dealerHand);
  return resolveRound(session, 'lose', playerScore, dealerScore);
}

function resolveRound(
  session: BlackjackSession,
  outcome: 'win' | 'draw' | 'lose',
  playerScore: number,
  dealerScore: number,
): BlackjackRoundResult {
  if (outcome === 'win') {
    session.winsAchieved++;
  } else if (outcome === 'lose') {
    // +1 modifier gets one free retry on loss
    if (session.hasRetryOnLoss && !session.lossRetryUsed) {
      session.lossRetryUsed = true;

      // Salva mão revelada do dealer ANTES de resetar (para exibição da falha)
      const oldDealerHand = [...session.dealerHand];

      // Reset para nova rodada — novo baralho
      const deck = buildDeck();
      session.deck = deck;
      session.playerHand = [dealOne(deck), dealOne(deck)];
      session.dealerHand = [dealOne(deck), { ...dealOne(deck), hidden: true }];
      session.phase = 'player_turn';

      return {
        outcome: 'lose',
        playerScore,
        dealerScore,
        dealerHand: oldDealerHand,  // mão antiga para exibição
        continuing: true,
        retryAvailable: true,
      };
    }
    // No retry available — failure
    session.phase = 'complete';
    return { outcome: 'lose', playerScore, dealerScore, dealerHand: session.dealerHand, continuing: false };
  }

  // outcome === 'draw' ou vitórias ainda insuficientes: re-deal para próxima rodada
  if (outcome === 'draw' || session.winsAchieved < session.winsNeeded) {
    // Salva mão revelada do dealer ANTES de resetar (para exibição do resultado)
    const oldDealerHand = [...session.dealerHand];

    const deck = buildDeck();
    session.deck = deck;
    session.playerHand = [dealOne(deck), dealOne(deck)];
    session.dealerHand = [dealOne(deck), { ...dealOne(deck), hidden: true }];
    session.phase = 'player_turn';

    return {
      outcome,
      playerScore,
      dealerScore,
      dealerHand: oldDealerHand, // mão revelada do dealer para exibição
      continuing: session.winsAchieved < session.winsNeeded,
    };
  }

  // All wins achieved
  session.phase = 'complete';
  return { outcome: 'win', playerScore, dealerScore, dealerHand: session.dealerHand, continuing: false };
}

export function isSessionComplete(session: BlackjackSession): boolean {
  return session.phase === 'complete';
}

export function sessionSucceeded(session: BlackjackSession): boolean {
  return session.winsAchieved >= session.winsNeeded;
}
