"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueAction = queueAction;
exports.resolveAllActions = resolveAllActions;
exports.applyPoisonDamage = applyPoisonDamage;
exports.applyDownedDecay = applyDownedDecay;
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
    'Labuta': 5,
    'Sabotagem': 5,
    'Autópsia': 5,
    'Lute ou morra': 5,
    'Olhos sempre abertos': 1,
    'Treinamento Especial': 99,
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
            log.push('Tentativa de ação registrada — sem efeito detectado.');
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
            if (room.tasksTotal > 0) {
                room.tasksRemaining = Math.max(0, room.tasksRemaining - 1);
            }
            log.push('Tarefa concluída com sucesso.');
            break;
        case 'Esconde-esconde':
            actor.status = 'hiding';
            log.push('Movimento furtivo detectado em setor não monitorado.');
            break;
        case 'Presas da Serpente':
        case 'Fatiar e picar':
        case 'Atirar pra matar': {
            if (!target)
                break;
            if (hidingSet.has(target.codename)) {
                log.push('Movimento detectado. Alvo não localizado — sem confirmação.');
                break;
            }
            if (action.abilityName === 'Presas da Serpente') {
                if (target.class === 'V.I.P' && !target.hasSurvivedDeath) {
                    // VIP passive — ocultar identidade: log genérico + displayStatus mascarado
                    target.hasSurvivedDeath = true;
                    target.salvaguardaPlayed = true;
                    target.displayStatus = 'downed';
                    room.pendingVipAutoEscape = target.codename;
                    log.push('Agente comprometido. Contaminação biológica detectada.');
                }
                else {
                    target.isPoisoned = true;
                    target.causeOfDeath = 'envenenamento';
                    target.killerStatType = action.statType;
                    log.push('Agente comprometido. Contaminação biológica detectada.');
                }
            }
            else if (target.class === 'V.I.P' && !target.hasSurvivedDeath) {
                // VIP passive "Olhos sempre abertos" — ocultar identidade: log genérico + displayStatus mascarado
                target.hasSurvivedDeath = true;
                target.salvaguardaPlayed = true;
                target.displayStatus = 'downed';
                room.pendingVipAutoEscape = target.codename;
                log.push('Agente abatido. Status crítico — protocolo de emergência ativado.');
            }
            else if (target.hasSurvivedDeath) {
                // Second lethal hit — no more chances
                target.status = 'deceased';
                target.causeOfDeath = 'ataque_físico';
                target.killerStatType = action.statType;
                log.push('Eliminação confirmada. Ameaça neutralizada.');
            }
            else {
                // First hit — downed (salvaguarda chance next round)
                target.status = 'downed';
                target.causeOfDeath = 'ataque_físico';
                target.killerStatType = action.statType;
                log.push('Agente abatido. Status crítico — protocolo de emergência ativado.');
            }
            break;
        }
        case 'Preso em nome da lei': {
            if (!target)
                break;
            target.isArrested = true;
            target.status = 'arrested';
            log.push('Agente detido. Atividade interrompida por autoridade.');
            break;
        }
        case 'Primeiros socorros': {
            if (!target)
                break;
            target.isPoisoned = false;
            if (target.status === 'downed') {
                target.status = 'alive';
                target.hasSurvivedDeath = true;
                target.salvaguardaPlayed = false;
                actor.firstAidConsumed = true;
                log.push('Protocolo de reanimação executado. Sistema estabilizado.');
            }
            else {
                log.push('Sistema restaurado. Agente estável.');
            }
            break;
        }
        case 'Sabotagem': {
            if (!target)
                break;
            const idx = room.pendingActions.findIndex((a) => a.actorCodename === target.codename && a.abilityName === 'Labuta');
            if (idx !== -1) {
                room.pendingActions.splice(idx, 1);
                log.push('Interferência nos sistemas de segurança registrada.');
            }
            else {
                log.push('Tentativa de interferência — nenhum alvo de sabotagem identificado.');
            }
            break;
        }
        case 'Autópsia': {
            if (!target || target.status !== 'deceased')
                break;
            if (!target.causeOfDeath || !target.killerStatType) {
                log.push('Análise forense inconclusiva. Dados insuficientes.');
                break;
            }
            // wasAutopsied was already set in gameEvents when the ability was used (any attempt removes target)
            room.pendingAutopsyResults.push({
                actorCodename: actor.codename,
                targetCodename: target.codename,
                targetDisplayName: target.displayName,
                causeOfDeath: target.causeOfDeath,
                killerStatType: target.killerStatType,
            });
            log.push('Análise forense concluída. Relatório enviado ao operador.');
            break;
        }
        case 'Lute ou morra':
            log.push('Protocolo de segurança pessoal ativado.');
            break;
        default:
            log.push('Atividade não identificada registrada no sistema.');
    }
}
// ─── Apply end-of-turn poison damage ─────────────────────────────────────────
function applyPoisonDamage(room, log) {
    for (const player of room.players.values()) {
        if (player.isPoisoned && player.status === 'alive') {
            player.isPoisoned = false;
            if (player.hasSurvivedDeath) {
                player.status = 'deceased';
                log.push('Falha sistêmica crítica. Agente perdido por contaminação.');
            }
            else {
                player.status = 'downed';
                log.push('Contaminação crítica. Protocolo de emergência ativado.');
            }
        }
    }
}
// ─── Apply downed decay (players who failed salvaguarda die at end of next turn) ─
function applyDownedDecay(room, log) {
    for (const player of room.players.values()) {
        if (player.status === 'downed' && player.salvaguardaPlayed) {
            player.status = 'deceased';
            log.push('Protocolo de emergência expirado. Agente perdido.');
        }
    }
}
