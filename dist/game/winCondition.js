"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWinCondition = checkWinCondition;
// ─────────────────────────────────────────────────────────────────────────────
// Win conditions
//
//  Assassins win: VIP is deceased
//  Innocents win: all assassins are deceased OR arrested
// ─────────────────────────────────────────────────────────────────────────────
function checkWinCondition(room) {
    const players = Array.from(room.players.values());
    const vip = players.find((p) => p.class === 'V.I.P');
    if (vip && vip.status === 'deceased') {
        return 'assassins';
    }
    const assassins = players.filter((p) => p.class === 'Assassino');
    const allAssassinsNeutralised = assassins.length > 0 &&
        assassins.every((p) => p.status === 'deceased' || p.isArrested);
    if (allAssassinsNeutralised) {
        return 'innocents';
    }
    return null;
}
