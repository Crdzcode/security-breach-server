"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueAction = queueAction;
exports.resolveAllActions = resolveAllActions;
exports.applyPoisonDamage = applyPoisonDamage;
// ─────────────────────────────────────────────────────────────────────────────
// Priority constants (lower = resolves first)
// ─────────────────────────────────────────────────────────────────────────────
const PRIORITY = {
    'Esconde-esconde': 1,
    'Preso em nome da lei': 2,
    'Presas da Serpente': 3,
    'Fatiar e picar': 3,
    'Atirar pra matar': 3,
    'Primeiros socorros': 4,
    'Antídoto': 4,
    'Labuta': 5,
    'Sabotagem': 5,
    'Autópsia': 5,
    'Ligar os pontos': 5,
    'Lista Restrita': 5,
    'Lute ou morra': 5,
    'Olhos sempre abertos': 1, // passive — resolved first so it can intercept attacks
    'Treinamento Especial': 99, // passive — no resolve step needed
};
function getPriority(abilityName) {
    return PRIORITY[abilityName] ?? 5;
}
// ─────────────────────────────────────────────────────────────────────────────
// Queuing
// ─────────────────────────────────────────────────────────────────────────────
function queueAction(room, actorCodename, abilityName, statType, targetCodename, wasSuccessful) {
    room.pendingActions.push({
        actorCodename,
        abilityName,
        statType,
        targetCodename,
        wasSuccessful,
        priority: getPriority(abilityName),
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// Resolution
// ─────────────────────────────────────────────────────────────────────────────
function resolveAllActions(room) {
    const log = [];
    const sorted = [...room.pendingActions].sort((a, b) => a.priority - b.priority);
    // Track who is hiding (resolved before attacks)
    const hidingSet = new Set();
    for (const action of sorted) {
        if (action.abilityName === 'Esconde-esconde' && action.wasSuccessful) {
            hidingSet.add(action.actorCodename);
        }
    }
    for (const action of sorted) {
        const actor = room.players.get(action.actorCodename);
        const target = action.targetCodename ? room.players.get(action.targetCodename) : undefined;
        if (!actor)
            continue;
        if (!action.wasSuccessful) {
            log.push(`[FALHA] ${actor.displayName} tentou usar ${action.abilityName} mas falhou.`);
            continue;
        }
        applyAbility(action, actor, target, hidingSet, room, log);
    }
    room.actionLog.push(...log);
    return log;
}
function applyAbility(action, actor, target, hidingSet, room, log) {
    switch (action.abilityName) {
        case 'Labuta':
            log.push(`[OK] ${actor.displayName} completou uma tarefa.`);
            break;
        case 'Esconde-esconde':
            actor.status = 'hiding';
            log.push(`[OK] ${actor.displayName} está se escondendo.`);
            break;
        case 'Presas da Serpente':
        case 'Fatiar e picar':
        case 'Atirar pra matar': {
            if (!target)
                break;
            if (hidingSet.has(target.codename)) {
                log.push(`[MISS] ${actor.displayName} atacou ${target.displayName}, mas o alvo estava escondido.`);
                break;
            }
            if (action.abilityName === 'Presas da Serpente') {
                target.isPoisoned = true;
                log.push(`[ENVENENADO] ${actor.displayName} envenenou ${target.displayName}.`);
            }
            else {
                target.status = 'deceased';
                log.push(`[MORTE] ${actor.displayName} eliminou ${target.displayName}.`);
            }
            break;
        }
        case 'Preso em nome da lei': {
            if (!target)
                break;
            target.isArrested = true;
            log.push(`[PRESO] ${actor.displayName} prendeu ${target.displayName}.`);
            break;
        }
        case 'Primeiros socorros': {
            if (!target)
                break;
            target.isPoisoned = false;
            if (target.status === 'deceased') {
                target.status = 'alive';
                log.push(`[CURA] ${actor.displayName} ressuscitou ${target.displayName}.`);
            }
            else {
                log.push(`[CURA] ${actor.displayName} curou ${target.displayName}.`);
            }
            break;
        }
        case 'Antídoto': {
            if (!target)
                break;
            if (target.isPoisoned) {
                target.isPoisoned = false;
                log.push(`[ANTÍDOTO] ${actor.displayName} removeu o veneno de ${target.displayName}.`);
            }
            else {
                log.push(`[ANTÍDOTO] ${target.displayName} não estava envenenado.`);
            }
            break;
        }
        case 'Sabotagem': {
            if (!target)
                break;
            // Remove a queued Labuta from the target
            const idx = room.pendingActions.findIndex((a) => a.actorCodename === target.codename && a.abilityName === 'Labuta');
            if (idx !== -1) {
                room.pendingActions.splice(idx, 1);
                log.push(`[SABOTAGEM] ${actor.displayName} sabotou a tarefa de ${target.displayName}.`);
            }
            else {
                log.push(`[SABOTAGEM] ${actor.displayName} tentou sabotar ${target.displayName}, mas não havia tarefa para sabotar.`);
            }
            break;
        }
        case 'Autópsia':
            log.push(`[AUTÓPSIA] ${actor.displayName} examinou o corpo de ${target?.displayName ?? '?'}.`);
            break;
        case 'Ligar os pontos':
            log.push(`[ANÁLISE] ${actor.displayName} analisou a situação.`);
            break;
        case 'Lute ou morra':
            log.push(`[SALVAGUARDA] ${actor.displayName} tentou escapar de um ataque.`);
            break;
        case 'Lista Restrita':
            log.push(`[LISTA] ${actor.displayName} removeu um inocente das suspeitas.`);
            break;
        default:
            log.push(`[?] ${actor.displayName} usou ${action.abilityName}.`);
    }
}
// ─── Apply end-of-turn poison damage ─────────────────────────────────────────
function applyPoisonDamage(room, log) {
    for (const player of room.players.values()) {
        if (player.isPoisoned && player.status === 'alive') {
            player.status = 'deceased';
            player.isPoisoned = false;
            log.push(`[VENENO] ${player.displayName} sucumbiu ao veneno.`);
        }
    }
}
