import type { Room, Player, AgentClass, GameStartedPayload, TeammateInfo } from '../types';
import { buildAbilityGroups, MISSION_BRIEFINGS } from '../data/agentProfiles';
import { USERS_MAP } from '../auth/users';

// ─────────────────────────────────────────────────────────────────────────────
// Class assignment rules:
//   ≤ 8 players: 1 Assassino, 1 Policial, 1 V.I.P, resto Inocente
//   > 8 players: 2 Assassinos, 2 Policiais, 1 V.I.P, resto Inocente
// ─────────────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function assignClasses(room: Room): void {
  const players = shuffle(Array.from(room.players.values()));
  const total = players.length;

  const assassinCount = total > 8 ? 2 : 1;
  const policeCount   = total > 8 ? 2 : 1;

  let idx = 0;

  // VIP
  players[idx++].class = 'V.I.P';

  // Assassins
  const assassins: Player[] = [];
  for (let i = 0; i < assassinCount; i++) {
    players[idx].class = 'Assassino';
    assassins.push(players[idx]);
    idx++;
  }

  // Police
  const police: Player[] = [];
  for (let i = 0; i < policeCount; i++) {
    players[idx].class = 'Policial';
    police.push(players[idx]);
    idx++;
  }

  // VIP knows police (and vice versa)
  const vip = players[0];
  const policeCodenames = police.map((p) => p.codename);
  const vipCodename = vip.codename;

  vip.teammates = policeCodenames;
  for (const cop of police) {
    cop.teammates = [vipCodename, ...police.filter((p) => p.codename !== cop.codename).map((p) => p.codename)];
  }

  // Assassins know each other
  const assassinCodenames = assassins.map((p) => p.codename);
  for (const a of assassins) {
    a.teammates = assassinCodenames.filter((c) => c !== a.codename);
  }

  // Innocents — remaining players
  for (; idx < players.length; idx++) {
    players[idx].class = 'Inocente';
    players[idx].teammates = [];
  }

  // VIP gets 2 actions
  vip.maxActions = 2;
}

// ─── Build the GameStarted payload for a specific player ─────────────────────

export function buildGameStartedPayload(player: Player, room: Room): GameStartedPayload {
  const agentClass = player.class!;
  const user = USERS_MAP.get(player.codename);

  const teammates: TeammateInfo[] = player.teammates
    .map((codename) => {
      const teammate = room.players.get(codename);
      if (!teammate || !teammate.class) return null;
      return { codename, displayName: teammate.displayName, agentClass: teammate.class };
    })
    .filter((t): t is TeammateInfo => t !== null);

  return {
    yourClass: agentClass,
    teammates,
    missionBriefing: MISSION_BRIEFINGS[agentClass],
    abilityGroups: buildAbilityGroups(agentClass, player.modifiers),
    profile: {
      codename: player.codename,
      displayName: player.displayName,
      image: player.image,
      description: user?.description ?? '',
      modifiers: player.modifiers,
    },
  };
}
