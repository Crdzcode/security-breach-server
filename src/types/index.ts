// ─────────────────────────────────────────────────────────────────────────────
// Tipos centrais do jogo "Falha de Segurança"
// ─────────────────────────────────────────────────────────────────────────────

// ─── Primitivos ───────────────────────────────────────────────────────────────

export type Modifier    = '+1' | '0' | '-1';
export type AgentClass  = 'Inocente' | 'Assassino' | 'Policial' | 'V.I.P';
export type PlayerStatus = 'alive' | 'hiding' | 'deceased' | 'arrested' | 'downed';
export type StatType    = 'Força' | 'Inteligência' | 'Destreza';
export type UserRole    = 'player' | 'admin';

export type GamePhase =
  | 'lobby'      // aguardando jogadores
  | 'action'     // fase de ações (cada jogador escolhe)
  | 'resolving'  // servidor processa ações enfileiradas
  | 'report'     // relatório da rodada sendo exibido
  | 'game_over'; // jogo encerrado

export type WinnerSide = 'assassins' | 'innocents' | null;

// ─── Baralho ──────────────────────────────────────────────────────────────────

export type CardSuit = '♠' | '♥' | '♦' | '♣';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  rank: CardRank;
  suit: CardSuit;
  hidden?: boolean; // carta virada (dealer)
}

// ─── Habilidades ─────────────────────────────────────────────────────────────

export interface Ability {
  name: string;
  description: string;
  isPassive?: boolean;
}

export interface AbilityGroup {
  statType: StatType;
  modifier: Modifier;
  abilities: Ability[];
  isSurvivalGroup?: boolean;
}

// ─── Usuário (banco de autenticação — SEM classe) ─────────────────────────────

export interface User {
  codename: string;
  password: string;
  fullName: string;
  image: string;       // caminho relativo a /public (frontend)
  description: string;
  modifiers: {
    strength: Modifier;
    intelligence: Modifier;
    dexterity: Modifier;
  };
  role: UserRole;
}

// ─── Jogador dentro de uma sala ───────────────────────────────────────────────

export interface Player {
  codename: string;
  socketId: string;
  displayName: string;
  image: string;
  class: AgentClass | null;  // null antes do jogo começar
  status: PlayerStatus;
  isArrested: boolean;
  isPoisoned: boolean;
  teammates: string[];       // codinomes dos aliados conhecidos
  actionsUsed: number;
  maxActions: number;        // 1 padrão, 2 para V.I.P
  hasVotedEndTurn: boolean;
  isConnected: boolean;
  modifiers: {
    strength: Modifier;
    intelligence: Modifier;
    dexterity: Modifier;
  };
  hasSurvivedDeath: boolean;   // true após sobreviver por salvaguarda ou primeiros socorros
  firstAidConsumed: boolean;   // VIP — primeiros socorros só pode ser usado uma vez
  salvaguardaPlayed: boolean;  // true após falha no protocolo de salvaguarda
  causeOfDeath?: 'envenenamento' | 'ataque_físico';  // definido quando downed/deceased
  killerStatType?: StatType;   // stat do ataque letal
  wasAutopsied: boolean;       // impede segunda autópsia no mesmo corpo
  displayStatus?: PlayerStatus; // status público mascarado (≠ status real) — usado para ocultar passiva VIP
}

// O que outros jogadores podem ver (sem classe oculta)
export interface PlayerPublic {
  codename: string;
  displayName: string;
  image: string;
  status: PlayerStatus;
  hasVotedEndTurn: boolean;
  isConnected: boolean;
  wasAutopsied?: boolean;
}

// ─── Ações enfileiradas no turno ──────────────────────────────────────────────

export interface QueuedAction {
  actorCodename: string;
  abilityName: string;
  statType: StatType;
  targetCodename: string | null;
  wasSuccessful: boolean;
  priority: number; // menor = resolve primeiro
}

// ─── Sessão de Blackjack ──────────────────────────────────────────────────────

export type BlackjackPhase = 'player_turn' | 'complete';

export interface BlackjackSession {
  codename: string;
  roomId: string;
  abilityName: string;
  statType: StatType;
  targetCodename: string | null;
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  modifier: Modifier;
  winsNeeded: number;    // 1 padrão, 2 para modificador -1
  winsAchieved: number;
  hasRetryOnLoss: boolean;  // true para modificador +1
  lossRetryUsed: boolean;
  phase: BlackjackPhase;
  isSalvaguarda?: boolean;  // true para sessões de protocolo de sobrevivência
}

// ─── Sala ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  fromCodename: string;
  fromDisplayName: string;
  toCodename: string;
  content: string;
  timestamp: number;
}

export interface AutopsyPending {
  actorCodename: string;
  targetCodename: string;
  targetDisplayName: string;
  causeOfDeath: 'envenenamento' | 'ataque_físico';
  killerStatType: StatType;
}

export interface Room {
  id: string;
  hostSocketId: string;
  players: Map<string, Player>;   // chave = codename
  phase: GamePhase;
  round: number;
  pendingActions: QueuedAction[];
  actionLog: string[];
  voteCount: number;
  nextRoundVoteCount: number;
  nextRoundVotesNeeded: number;  // snapshot calculado ao entrar na fase report
  winner: WinnerSide;
  turnDuration: number;    // seconds
  roundStartAt: number;    // Date.now() when action phase began
  turnTimer?: ReturnType<typeof setTimeout>; // auto-advance timer handle
  targetedThisRound: string[];  // codinomes de alvos já afetados neste turno
  pendingAutopsyResults: AutopsyPending[];
  pendingVipAutoEscape?: string;  // codename do VIP que usou a passiva neste turno
  tasksTotal: number;             // total de tarefas definido pelo admin
  tasksRemaining: number;         // tarefas ainda não concluídas
  chatMessages: Map<string, ChatMessage[]>; // key = "codenameA:codenameB" (sorted)
}

// ─── Payloads: Cliente → Servidor ────────────────────────────────────────────

export interface LoginPayload {
  codename: string;
  password: string;
  roomId?: string;
}

export interface PlayerActionPayload {
  abilityName: string;
  statType: StatType;
  targetCodename: string | null;
}

// ─── Payloads: Servidor → Cliente ────────────────────────────────────────────

export interface LoginSuccessPayload {
  player: PlayerPublic;
  roomId: string;
  players: PlayerPublic[];
  phase: GamePhase;
  round: number;
}

export interface AdminLoginSuccessPayload {
  codename: string;
  rooms: RoomPublic[];
}

export interface RoomPublic {
  id: string;
  playerCount: number;
  phase: GamePhase;
  round: number;
  players: PlayerPublic[];
}

export interface TeammateInfo {
  codename: string;
  displayName: string;
  agentClass: AgentClass;
}

export interface GameStartedPayload {
  yourClass: AgentClass;
  teammates: TeammateInfo[];  // aliados com nome e classe
  missionBriefing: string;
  abilityGroups: AbilityGroup[];
  profile: {
    codename: string;
    displayName: string;
    image: string;
    description: string;
    modifiers: { strength: Modifier; intelligence: Modifier; dexterity: Modifier };
  };
}

export interface BlackjackStartPayload {
  playerHand: Card[];
  dealerHand: Card[];         // mão completa: [carta_visível, {hidden:true}]
  playerScore: number;
  modifier: Modifier;
  winsNeeded: number;
  winsAchieved: number;
  abilityName: string;
  targetCodename: string | null;
  isSalvaguarda?: boolean;
}

export interface BlackjackUpdatePayload {
  playerHand: Card[];
  dealerHand: Card[];         // mão completa após dealer jogar
  playerScore: number;
  dealerScore: number;
  roundOutcome: 'win' | 'draw' | 'lose';
  winsAchieved: number;
  winsNeeded: number;
  continuing: boolean;        // true = mais rodadas necessárias
}

export interface BlackjackResultPayload {
  outcome: 'success' | 'failure';
  playerScore: number;
  dealerScore: number;
  playerHand: Card[];
  dealerHand: Card[];
  description: string;
  retryAvailable?: boolean;  // true quando vantagem +1 ativa segunda chance
}

export interface AutopsyResultPayload {
  targetCodename: string;
  targetDisplayName: string;
  causeOfDeath: 'envenenamento' | 'ataque_físico';
  killerStatType: StatType;
  description: string;
}

export interface TurnReportPayload {
  round: number;
  log: string[];
  players: PlayerPublic[];
  winner: WinnerSide;
  classReveal?: Record<string, AgentClass>;
  tasksRemaining: number;
}

export interface VoteUpdatePayload {
  votes: number;
  needed: number;
}

export interface GameUpdatePayload {
  phase: GamePhase;
  round: number;
  players: PlayerPublic[];
  turnDuration?: number;
  roundStartAt?: number;
}
