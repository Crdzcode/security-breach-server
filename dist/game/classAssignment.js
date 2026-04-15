"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignClasses = assignClasses;
exports.buildGameStartedPayload = buildGameStartedPayload;
const agentProfiles_1 = require("../data/agentProfiles");
const users_1 = require("../auth/users");
// ─────────────────────────────────────────────────────────────────────────────
// Class assignment rules:
//   1 VIP always
//   ~20% of remaining players become Assassins (min 1)
//   ~15% become Police (min 1, only if ≥ 4 players)
//   rest are Innocent
// ─────────────────────────────────────────────────────────────────────────────
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function countForRole(total, pct, min, max) {
    return Math.min(max, Math.max(min, Math.round(total * pct)));
}
function assignClasses(room) {
    const players = shuffle(Array.from(room.players.values()));
    const total = players.length;
    const assassinCount = countForRole(total - 1, 0.2, 1, 3);
    const policeCount = total >= 4 ? countForRole(total - 1 - assassinCount, 0.15, 1, 2) : 0;
    let idx = 0;
    // VIP
    players[idx++].class = 'V.I.P';
    // Assassins
    const assassins = [];
    for (let i = 0; i < assassinCount; i++) {
        players[idx].class = 'Assassino';
        assassins.push(players[idx]);
        idx++;
    }
    // Police
    const police = [];
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
function buildGameStartedPayload(player) {
    const agentClass = player.class;
    const user = users_1.USERS_MAP.get(player.codename);
    return {
        yourClass: agentClass,
        teammates: player.teammates,
        missionBriefing: agentProfiles_1.MISSION_BRIEFINGS[agentClass],
        abilityGroups: (0, agentProfiles_1.buildAbilityGroups)(agentClass, player.modifiers),
        profile: {
            codename: player.codename,
            displayName: player.displayName,
            image: player.image,
            description: user?.description ?? '',
            modifiers: player.modifiers,
        },
    };
}
