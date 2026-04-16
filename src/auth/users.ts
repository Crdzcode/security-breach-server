import type { User } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// "Banco de dados" de usuários
//
// IMPORTANTE: classes NÃO ficam aqui — são atribuídas dinamicamente
// pelo servidor quando o jogo começa (src/game/classAssignment.ts).
//
// Para adicionar um novo usuário copie um dos blocos abaixo e preencha.
// Modificadores: '+1' | '0' | '-1'
//   strength     → Força
//   intelligence → Inteligência
//   dexterity    → Destreza
// ─────────────────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    codename: 'admin',
    password: 'admin2024',
    fullName: 'Administrador',
    image: '/agents/unknown.png',
    description: 'Acesso administrativo ao sistema de segurança.',
    modifiers: { strength: '0', intelligence: '0', dexterity: '0' },
    role: 'admin',
  },

  // ── Jogadores ─────────────────────────────────────────────────────────────
  {
    codename: 'pietra',
    password: 'Ts1Exgr9',
    fullName: 'Pietra Leal',
    image: '/agents/pietra.png',
    description:
      'Pietra é observadora, com olhos atentos que raramente deixam um detalhe escapar. Ela percebe o que passa despercebido para muitos, mas sua memória curta a obriga a agir rápido e com astúcia. Quando quer, pode ser sutilmente manipuladora, distorcendo situações a seu favor com um charme disfarçado e um sorriso indecifrável.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'caetano',
    password: 'K0fTDuLv',
    fullName: 'Caetano',
    image: '/agents/caetano.png',
    description:
      'Caetano é o tipo de pessoa que some antes mesmo do problema chegar. Ágil e escorregadio, ele transforma qualquer situação numa chance de improviso cômico. Suas mentiras beiram o absurdo, mas ditas com tanta confiança que é difícil duvidar.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'pedro',
    password: 'cU6FAXAy',
    fullName: 'Pedro Henrique',
    image: '/agents/pedro.png',
    description:
      'Pedro é o tipo de pessoa que transforma qualquer sala em um palco, usando o humor como disfarce para sua sagacidade. Suas piadas são cuidadosamente calculadas, muitas vezes escondendo perguntas maliciosas.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'luiza',
    password: 'AHTbzy81',
    fullName: 'Luiza Tavares',
    image: '/agents/luiza.png',
    description:
      'Luiza é pequena e ágil, movendo-se com a leveza de quem já nasceu para não ser notada. Sua aparência doce e inofensiva é sua arma mais afiada — o tipo de pessoa que todos subestimam, até ser tarde demais.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'amanda',
    password: 'b3hYFIGY',
    fullName: 'Amanda Verri',
    image: '/agents/amanda.png',
    description:
      'Amanda é inteligente e espirituosa, com uma mente afiada para detalhes e uma língua afiada para piadas. Quando se trata de enxergar o que ninguém mais viu, ela está sempre um passo à frente.',
    modifiers: { strength: '-1', intelligence: '+1', dexterity: '0' },
    role: 'player',
  },
  {
    codename: 'maria',
    password: 'fpOOJplG',
    fullName: 'Maria Eduarda',
    image: '/agents/maria.png',
    description:
      'Maria é uma combinação rara de inteligência, agilidade e dissimulação. Ela se move com leveza e fala com convicção, capaz de mentir com naturalidade quando necessário.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'caio',
    password: 'wKUsdsUZ',
    fullName: 'Caio Quelhas',
    image: '/agents/caio.png',
    description:
      'Caio é aquele que sempre tem uma piada na ponta da língua e uma saída pronta para qualquer situação. Ágil e sociável, consegue escapar de enrascadas com um sorriso e uma frase bem colocada.',
    modifiers: { strength: '0', intelligence: '-1', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'luis',
    password: 'RtZo9ZhV',
    fullName: 'Luis Felipe',
    image: '/agents/luis.png',
    description:
      'Luis tem o dom da conversa e o charme de quem sabe exatamente o que dizer. Ele se mistura facilmente com qualquer grupo e evita conflitos com habilidade.',
    modifiers: { strength: '0', intelligence: '-1', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'gustavo',
    password: 'hFqBDG0v',
    fullName: 'Gustavo Leal',
    image: '/agents/gustavo.png',
    description:
      'Gustavo é pura força e velocidade. Seu físico o torna uma ameaça em qualquer confronto físico, mas sua mente nem sempre acompanha sua força.',
    modifiers: { strength: '+1', intelligence: '-1', dexterity: '0' },
    role: 'player',
  },
  {
    codename: 'emelly',
    password: '1yfEw4Vy',
    fullName: 'Emelly Rosa',
    image: '/agents/emelly.png',
    description:
      'Emelly é uma sombra silenciosa. Inteligente, reservada e extremamente atenta, ela observa tudo e todos com um olhar afiado. Cada passo é calculado, cada silêncio é estratégico.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'richard',
    password: 'pIO3pkvc',
    fullName: 'Richard Duarte',
    image: '/agents/richard.png',
    description:
      'Richard é forte, inteligente e focado. Ele fala pouco, mas cada palavra carrega peso. Quando age, é com força e precisão — mas raramente sem ser notado.',
    modifiers: { strength: '+1', intelligence: '0', dexterity: '-1' },
    role: 'player',
  },
  {
    codename: 'vitoria',
    password: 'UUVPluSZ',
    fullName: 'Vitória Carone',
    image: '/agents/vitoria.png',
    description:
      'Vitória entra em cena com energia contagiante, resolvendo problemas no impulso e no braço. Quando a situação exige silêncio e precisão, porém, sua presença vira ruído.',
    modifiers: { strength: '+1', intelligence: '0', dexterity: '-1' },
    role: 'player',
  },
  {
    codename: 'hallan',
    password: '1QAbt3F8',
    fullName: 'Hallan Gabriel',
    image: '/agents/unknown.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '+1', intelligence: '0', dexterity: '-1' },
    role: 'player',
  },
  {
    codename: 'sabrina',
    password: '2IjkO4sa',
    fullName: 'Sabrina Machado',
    image: '/agents/unknown.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'kaiky',
    password: '3JHgz69l',
    fullName: 'Kaiky Motisuki',
    image: '/agents/unknown.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '-1', intelligence: '0', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'yasmim',
    password: '4Jabg89z',
    fullName: 'Yasmim Nascimento',
    image: '/agents/unknown.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '0', intelligence: '+1', dexterity: '-1' },
    role: 'player',
  },
  {
    codename: 'fellipe',
    password: 'nW5TpR2q',
    fullName: 'Fellipe Oliveira',
    image: '/agents/unknown.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '+1', intelligence: '0', dexterity: '-1' },
    role: 'player',
  },
  {
    codename: 'igor',
    password: 'rocketleague2412',
    fullName: 'Igor Brigido',
    image: '/agents/igor.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '+1', intelligence: '-1', dexterity: '0' },
    role: 'player',
  },
  {
    codename: 'jc',
    password: 'joao24715199',
    fullName: 'João Carlos',
    image: '/agents/jc.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '-1', intelligence: '+1', dexterity: '0' },
    role: 'player',
  },
  {
    codename: 'vg',
    password: 'dP6NrYs1',
    fullName: 'Guilherme Galdino',
    image: '/agents/vg.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '0', intelligence: '-1', dexterity: '+1' },
    role: 'player',
  },
  {
    codename: 'leticia',
    password: 'let1809',
    fullName: 'Leticia Lucas',
    image: '/agents/leticia.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '0', intelligence: '+1', dexterity: '-1' },
    role: 'player',
  },
  {
    codename: 'crdz',
    password: '290403',
    fullName: 'Matheus Cardoso',
    image: '/agents/crdz.png',
    description: 'Nenhuma informação encontrada sobre o agente.',
    modifiers: { strength: '+1', intelligence: '0', dexterity: '-1' },
    role: 'player',
  },
];

// Map para lookup O(1) por codename
export const USERS_MAP = new Map<string, User>(USERS.map((u) => [u.codename, u]));
