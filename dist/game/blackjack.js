"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeck = buildDeck;
exports.cardValue = cardValue;
exports.handScore = handScore;
exports.createBlackjackSession = createBlackjackSession;
exports.playerHit = playerHit;
exports.playerStand = playerStand;
exports.playerBust = playerBust;
exports.isSessionComplete = isSessionComplete;
exports.sessionSucceeded = sessionSucceeded;
// ─────────────────────────────────────────────────────────────────────────────
// Deck helpers
// ─────────────────────────────────────────────────────────────────────────────
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];
function buildDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ rank, suit });
        }
    }
    return shuffle(deck);
}
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function cardValue(card) {
    if (['J', 'Q', 'K'].includes(card.rank))
        return 10;
    if (card.rank === 'A')
        return 11;
    return parseInt(card.rank, 10);
}
function handScore(hand) {
    let score = hand.reduce((s, c) => s + cardValue(c), 0);
    let aces = hand.filter((c) => c.rank === 'A').length;
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}
function dealOne(deck) {
    const card = deck.pop();
    if (!card)
        throw new Error('Deck is empty');
    return card;
}
// ─────────────────────────────────────────────────────────────────────────────
// Session factory
// ─────────────────────────────────────────────────────────────────────────────
function createBlackjackSession(codename, roomId, abilityName, statType, targetCodename, modifier) {
    const deck = buildDeck();
    const playerHand = [dealOne(deck), dealOne(deck)];
    const dealerHand = [dealOne(deck), { ...dealOne(deck), hidden: true }];
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
/** Player hits — returns null if still under 21, or resolves the round. */
function playerHit(session) {
    const card = dealOne(session.deck);
    session.playerHand.push(card);
    return card;
}
/** Player stands — dealer plays out, round is evaluated. */
function playerStand(session) {
    // Reveal dealer hidden card
    session.dealerHand = session.dealerHand.map((c) => ({ ...c, hidden: false }));
    // Dealer hits until ≥17
    while (handScore(session.dealerHand) < 17) {
        session.dealerHand.push(dealOne(session.deck));
    }
    const playerScore = handScore(session.playerHand);
    const dealerScore = handScore(session.dealerHand);
    let outcome;
    if (playerScore > 21) {
        outcome = 'lose';
    }
    else if (dealerScore > 21 || playerScore > dealerScore) {
        outcome = 'win';
    }
    else if (playerScore === dealerScore) {
        outcome = 'draw';
    }
    else {
        outcome = 'lose';
    }
    return resolveRound(session, outcome, playerScore, dealerScore);
}
/** Called when player busts (score > 21). */
function playerBust(session) {
    session.dealerHand = session.dealerHand.map((c) => ({ ...c, hidden: false }));
    const playerScore = handScore(session.playerHand);
    const dealerScore = handScore(session.dealerHand);
    return resolveRound(session, 'lose', playerScore, dealerScore);
}
function resolveRound(session, outcome, playerScore, dealerScore) {
    if (outcome === 'win') {
        session.winsAchieved++;
    }
    else if (outcome === 'lose') {
        // +1 modifier gets one free retry on loss
        if (session.hasRetryOnLoss && !session.lossRetryUsed) {
            session.lossRetryUsed = true;
            // Reset for a new round — fresh deal
            const deck = buildDeck();
            session.deck = deck;
            session.playerHand = [dealOne(deck), dealOne(deck)];
            session.dealerHand = [dealOne(deck), { ...dealOne(deck), hidden: true }];
            session.phase = 'player_turn';
            return {
                outcome: 'lose',
                playerScore,
                dealerScore,
                dealerHand: session.dealerHand,
                continuing: true,
            };
        }
        // No retry available — failure
        session.phase = 'complete';
        return { outcome: 'lose', playerScore, dealerScore, dealerHand: session.dealerHand, continuing: false };
    }
    // outcome === 'draw': doesn't count as win, re-deal
    if (outcome === 'draw' || session.winsAchieved < session.winsNeeded) {
        // Need more wins — start a fresh round
        const deck = buildDeck();
        session.deck = deck;
        session.playerHand = [dealOne(deck), dealOne(deck)];
        session.dealerHand = [dealOne(deck), { ...dealOne(deck), hidden: true }];
        session.phase = 'player_turn';
        return {
            outcome,
            playerScore,
            dealerScore,
            dealerHand: session.dealerHand,
            continuing: session.winsAchieved < session.winsNeeded,
        };
    }
    // All wins achieved
    session.phase = 'complete';
    return { outcome: 'win', playerScore, dealerScore, dealerHand: session.dealerHand, continuing: false };
}
function isSessionComplete(session) {
    return session.phase === 'complete';
}
function sessionSucceeded(session) {
    return session.winsAchieved >= session.winsNeeded;
}
