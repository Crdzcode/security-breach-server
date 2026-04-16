import type { AgentClass, AbilityGroup, Ability } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Habilidades base por classe
// Cada classe herda as habilidades padrão de Inocente e adiciona as suas.
// ─────────────────────────────────────────────────────────────────────────────

const baseAbilities: Record<'dexterity' | 'intelligence' | 'strength', Ability[]> = {
  dexterity: [
    {
      name: 'Labuta',
      description:
        'Realiza uma tarefa. O modificador define quantas chances extras você tem de conseguir.',
    },
    {
      name: 'Esconde-esconde',
      description:
        'Se esconde. Com sucesso, seu status aparece como DESCONHECIDO no relatório da noite.',
    },
  ],
  intelligence: [
    {
      name: 'Labuta',
      description:
        'Realiza uma tarefa. O modificador define quantas chances extras você tem de conseguir.',
    },
  ],
  strength: [
    {
      name: 'Labuta',
      description:
        'Realiza uma tarefa. O modificador define quantas chances extras você tem de conseguir.',
    },
  ],
};

// ─── Habilidades por classe ───────────────────────────────────────────────────

export const CLASS_ABILITIES: Record<AgentClass, Record<'dexterity' | 'intelligence' | 'strength', Ability[]>> = {
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
        name: 'Treinamento Especial',
        description: 'Passiva. Permite realizar duas ações por turno.',
        isPassive: true,
      },
    ],
    intelligence: [
      ...baseAbilities.intelligence,
      {
        name: 'Primeiros socorros',
        description: 'Cura um jogador, removendo efeitos de envenenamento ou morte iminente.',
      },
      {
        name: 'Autópsia',
        description: 'Examina o corpo de um agente eliminado. Revela a causa da morte e pistas sobre o assassino.',
      },
    ],
    strength: baseAbilities.strength,
  },
};

// ─── Briefings de missão ──────────────────────────────────────────────────────

export const MISSION_BRIEFINGS: Record<AgentClass, string> = {
  Inocente:
    'Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Não sabe quem é aliado e quem é ameaça. Fique atento, observe, colabore — mas nunca baixe a guarda. No fim das contas, só os vivos vencem.',

  Assassino:
    'Você é um assassino infiltrado. Sua missão é eliminar o V.I.P. O problema? Você não sabe quem ele é — ainda. Infiltre-se, sabote sutilmente e ataque no momento certo. Se o V.I.P morrer, vocês vencem. Mas se forem descobertos antes disso, serão caçados. A mentira é sua arma mais letal.',

  Policial:
    'Você é um policial infiltrado. Seu dever é proteger o V.I.P a todo custo e eliminar os assassinos. Apenas você, o(s) outro(s) policial(is) e o V.I.P sabem da existência um do outro. Mantenha a cobertura, investigue e aja no momento certo.',

  'V.I.P':
    'Você é o V.I.P — a peça mais importante da resistência. Apenas os policiais sabem quem você é. Sobreviva sem levantar suspeitas. Você tem acesso a informações privilegiadas e pode curar aliados. Um movimento em falso e tudo estará perdido.',
};

// ─── Monta AbilityGroups para um jogador dado sua classe e modificadores ──────

const SURVIVAL_ABILITY: Record<AgentClass, Ability> = {
  Inocente:  { name: 'Lute ou morra',        description: 'Salvaguarda. Tenta escapar de um ataque ou situação fatal.', isPassive: true },
  Assassino: { name: 'Lute ou morra',        description: 'Salvaguarda. Tenta escapar de um ataque ou situação fatal.', isPassive: true },
  Policial:  { name: 'Lute ou morra',        description: 'Salvaguarda. Tenta escapar de um ataque ou situação fatal.', isPassive: true },
  'V.I.P':   { name: 'Olhos sempre abertos', description: 'Uso único e passivo. Escapa automaticamente do primeiro ataque letal, sem precisar jogar.', isPassive: true },
};

export function buildAbilityGroups(
  agentClass: AgentClass,
  modifiers: { strength: string; intelligence: string; dexterity: string }
): AbilityGroup[] {
  const classAbilities = CLASS_ABILITIES[agentClass];
  return [
    {
      statType: 'Força',
      modifier: '0',
      abilities: [SURVIVAL_ABILITY[agentClass]],
      isSurvivalGroup: true,
    },
    {
      statType: 'Força',
      modifier: modifiers.strength as '+1' | '0' | '-1',
      abilities: classAbilities.strength,
    },
    {
      statType: 'Inteligência',
      modifier: modifiers.intelligence as '+1' | '0' | '-1',
      abilities: classAbilities.intelligence,
    },
    {
      statType: 'Destreza',
      modifier: modifiers.dexterity as '+1' | '0' | '-1',
      abilities: classAbilities.dexterity,
    },
  ];
}
