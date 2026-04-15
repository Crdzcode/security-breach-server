"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISSION_BRIEFINGS = exports.CLASS_ABILITIES = void 0;
exports.buildAbilityGroups = buildAbilityGroups;
// ─────────────────────────────────────────────────────────────────────────────
// Habilidades base por classe
// Cada classe herda as habilidades padrão de Inocente e adiciona as suas.
// ─────────────────────────────────────────────────────────────────────────────
const baseAbilities = {
    dexterity: [
        {
            name: 'Labuta',
            description: 'Realiza uma tarefa. O modificador define quantas chances extras você tem de conseguir.',
        },
        {
            name: 'Esconde-esconde',
            description: 'Se esconde. Com sucesso, seu status aparece como DESCONHECIDO no relatório da noite.',
        },
    ],
    intelligence: [
        {
            name: 'Labuta',
            description: 'Realiza uma tarefa. O modificador define quantas chances extras você tem de conseguir.',
        },
        {
            name: 'Ligar os pontos',
            description: 'Tenta deduzir informações sobre uma situação ou jogador. A informação é vaga.',
        },
    ],
    strength: [
        {
            name: 'Labuta',
            description: 'Realiza uma tarefa. O modificador define quantas chances extras você tem de conseguir.',
        },
        {
            name: 'Lute ou morra',
            description: 'Salvaguarda. Tenta escapar de um ataque ou situação fatal.',
        },
    ],
};
// ─── Habilidades por classe ───────────────────────────────────────────────────
exports.CLASS_ABILITIES = {
    Inocente: baseAbilities,
    Assassino: {
        dexterity: [
            ...baseAbilities.dexterity,
            {
                name: 'Presas da Serpente',
                description: 'Ataque furtivo que envenena o alvo. O alvo não saberá quem o atacou.',
            },
        ],
        intelligence: [
            ...baseAbilities.intelligence,
            {
                name: 'Sabotagem',
                description: 'Sabota uma tarefa de outro jogador, impedindo sua conclusão.',
            },
        ],
        strength: [
            ...baseAbilities.strength,
            {
                name: 'Fatiar e picar',
                description: 'Ataque direto e letal. Alto risco de exposição.',
            },
        ],
    },
    Policial: {
        dexterity: [
            ...baseAbilities.dexterity,
            {
                name: 'Atirar pra matar',
                description: 'Ataque à distância. Elimina o alvo sem contato físico.',
            },
        ],
        intelligence: [
            ...baseAbilities.intelligence,
            {
                name: 'Autópsia',
                description: 'Extrai informações do corpo de um agente morto. Revela pistas sobre o assassino.',
            },
        ],
        strength: [
            ...baseAbilities.strength,
            {
                name: 'Preso em nome da lei',
                description: 'Prende um jogador. O alvo não pode agir no próximo turno.',
            },
        ],
    },
    'V.I.P': {
        dexterity: [
            ...baseAbilities.dexterity,
            {
                name: 'Olhos sempre abertos',
                description: 'Uso único e passivo. Permite escapar de um ataque letal automaticamente.',
            },
            {
                name: 'Treinamento Especial',
                description: 'Passiva. Permite realizar duas ações por turno.',
            },
        ],
        intelligence: [
            ...baseAbilities.intelligence,
            {
                name: 'Primeiros socorros',
                description: 'Cura um jogador, removendo efeitos de envenenamento ou morte iminente.',
            },
            {
                name: 'Antídoto',
                description: 'Remove envenenamento de um jogador antes que cause dano.',
            },
            {
                name: 'Lista Restrita',
                description: 'Remove um inocente da lista de possíveis assassinos, refinando as suspeitas.',
            },
        ],
        strength: baseAbilities.strength,
    },
};
// ─── Briefings de missão ──────────────────────────────────────────────────────
exports.MISSION_BRIEFINGS = {
    Inocente: 'Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Não sabe quem é aliado e quem é ameaça. Fique atento, observe, colabore — mas nunca baixe a guarda. No fim das contas, só os vivos vencem.',
    Assassino: 'Você é um assassino infiltrado. Sua missão é eliminar o V.I.P. O problema? Você não sabe quem ele é — ainda. Infiltre-se, sabote sutilmente e ataque no momento certo. Se o V.I.P morrer, vocês vencem. Mas se forem descobertos antes disso, serão caçados. A mentira é sua arma mais letal.',
    Policial: 'Você é um policial infiltrado. Seu dever é proteger o V.I.P a todo custo e eliminar os assassinos. Apenas você, o(s) outro(s) policial(is) e o V.I.P sabem da existência um do outro. Mantenha a cobertura, investigue e aja no momento certo.',
    'V.I.P': 'Você é o V.I.P — a peça mais importante da resistência. Apenas os policiais sabem quem você é. Sobreviva sem levantar suspeitas. Você tem acesso a informações privilegiadas e pode curar aliados. Um movimento em falso e tudo estará perdido.',
};
// ─── Monta AbilityGroups para um jogador dado sua classe e modificadores ──────
function buildAbilityGroups(agentClass, modifiers) {
    const classAbilities = exports.CLASS_ABILITIES[agentClass];
    return [
        {
            statType: 'Força',
            modifier: modifiers.strength,
            abilities: classAbilities.strength,
        },
        {
            statType: 'Inteligência',
            modifier: modifiers.intelligence,
            abilities: classAbilities.intelligence,
        },
        {
            statType: 'Dextreza',
            modifier: modifiers.dexterity,
            abilities: classAbilities.dexterity,
        },
    ];
}
