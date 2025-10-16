const missionBriefings = {
    innocent: 'Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem.',
    assassin: 'Você é um assassino infiltrado, e sua missão é eliminar o V.I.P. O problema? Você não sabe quem ele é — ainda. Precisa observar, deduzir, manipular e se infiltrar entre os inocentes, fingindo ajudar nas tarefas para não levantar suspeitas. Pode até colaborar em alguns momentos, se for necessário manter as aparências. Você e seu(s) parceiro(s) devem agir com inteligência: sabotar sutilmente, sem chamar atenção, e atacar no momento certo. Se o V.I.P morrer, vocês vencem. Mas se forem descobertos antes disso, serão caçados sem piedade. Em um jogo onde todos desconfiam de todos, a mentira é sua arma mais letal. Disfarce é sobrevivência. E assassinato, libertação.',
    cop: 'Você é um policial infiltrado na base. Seu dever é proteger o V.I.P a todo custo e eliminar os assassinos antes que eles descubram sua identidade ou, pior ainda, a identidade do V.I.P. Apenas você, o outro policial e o V.I.P sabem da existência um do outro. Ninguém mais deve saber quem você é, nem mesmo os inocentes. Você deve agir com cautela, mantendo sua cobertura enquanto investiga quem entre os jogadores é uma ameaça. Se os assassinos descobrirem quem você é, sua vida estará em risco, e a queda do V.I.P será apenas questão de tempo. Use sua intuição, sua frieza, e sua estratégia. O futuro depende da sua habilidade em se esconder à vista de todos — e agir no momento certo.',
    vip: 'Você é o V.I.P. Sua identidade é secreta e você é a peça mais importante da resistência. Apenas os policiais sabem quem você é, e você sabe quem são eles. Sua missão é sobreviver sem levantar suspeitas, enquanto colabora secretamente com os policiais. Você tem acesso a uma lista com possíveis assassinos e, a cada rodada, pode eliminar um nome inocente dessa lista, se aproximando cada vez mais da verdade. Os assassinos vencerão se conseguirem te matar, mas o problema é que eles não sabem quem você é — e é exatamente assim que deve continuar. Fingir ser apenas mais um inocente será a sua melhor defesa. Um movimento em falso e tudo estará perdido. Cuidado em quem confia, mantenha-se invisível, e sobreviva.'
}

const innocentAbilities = {
    dexterity: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Esconde-esconde",
            description: "Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso."
        }
    ],
    intelligence: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Ligar os pontos",
            description: "Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso. A informação obtida será dada de forma vaga, como uma dica. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        }
    ],
    strength: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Lute ou morra",
            description: "Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso."
        }
    ]
}

const assassinAbilities = {
    dexterity: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Esconde-esconde",
            description: "Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso."
        },
        {
            name: "Presas da Serpente",
            description: "Habilidade de ataque furtivo que envenena o alvo. O modificador diz quantas chances a mais você tem de conseguir de envenenar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir atacar com sucesso. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu. O jogador atacado não saberá quem o atacou, mas saberá que algo aconteceu."
        }
    ],
    intelligence: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Ligar os pontos",
            description: "Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso. A informação obtida será dada de forma vaga, como uma dica. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        },
        {
            name: "Sabotagem",
            description: "Habilidade de sabotagem. O modificador diz quantas chances a mais você tem de conseguir sabotar uma tarefa com sucesso. Se o modificador for negativo, você tem menos chances de conseguir sabotar uma tarefa com sucesso. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        }
    ],
    strength: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Lute ou morra",
            description: "Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso."
        },
        {
            name: "Fatiar e picar",
            description: "Habilidade de ataque. O modificador diz quantas chances a mais você tem de conseguir atacar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir atacar com sucesso."
        }
    ]
}

const copAbilities = {
    dexterity: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Esconde-esconde",
            description: "Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso."
        },
        {
            name: "Atirar pra matar",
            description: "Habilidade de ataque. O modificador diz quantas chances a mais você tem de conseguir atacar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir atacar com sucesso. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        }
    ],
    intelligence: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Ligar os pontos",
            description: "Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso. A informação obtida será dada de forma vaga, como uma dica. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        },
        {
            name: "Autópsia",
            description: "Habilidade utilizada para extrair informações do corpo de alguém que foi assassinado. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso. A informação obtida será dada de forma vaga, como uma dica. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        }
    ],
    strength: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Lute ou morra",
            description: "Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso."
        },
        {
            name: "Preso em nome da lei",
            description: "Habilidade de prisão. O modificador diz quantas chances a mais você tem de conseguir prender um jogador. Se o modificador for negativo, você tem menos chances de conseguir prender um jogador. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        }
    ]
}

const vipAbilities = {
    dexterity: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Esconde-esconde",
            description: "Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso."
        },
        {
            name: "Olhos sempre abertos - Uso único e passivo",
            description: "Habilidade utilizada para fugir de um ataque letal. O modificador diz quantas chances a mais você tem de conseguir de escapar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso."
        },
        {
            name: "Treinamento Especial - Passiva",
            description: "Habilidade passiva que permite com que você possa realizar duas ações por turno."
        }
    ],
    intelligence: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Ligar os pontos",
            description: "Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso. A informação obtida será dada de forma vaga, como uma dica. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        },
        {
            name: "Primeiros socorros",
            description: "Habilidade de cura. O modificador diz quantas chances a mais você tem de conseguir curar um jogador. Se o modificador for negativo, você tem menos chances de conseguir curar um jogador. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        },
        {
            name: "Antídoto",
            description: "Habilidade de remover envenenamento. O modificador diz quantas chances a mais você tem de conseguir curar um jogador. Se o modificador for negativo, você tem menos chances de conseguir curar um jogador. O jogador que usou a habilidade não saberá exatamente o que aconteceu, mas saberá que algo aconteceu."
        },
        {
            name: "Lista Restrita",
            description: "Habilidade que remove um nome de um inocente da lista de possíveis assassinos. O modificador diz quantas chances a mais você tem de conseguir remover um nome da lista. Se o modificador for negativo, você tem menos chances de conseguir remover um nome da lista."
        }
    ],
    strength: [
        {
            name: "Labuta",
            description: "Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso."
        },
        {
            name: "Lute ou morra",
            description: "Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso."
        }
    ]
}

const agentsData = {
    pietra: {
        agentStatus: "deceased",
        agentImage: "./agents/pietra.png",
        agentName: "PIETRA",
        agentFullName: "Pietra Leal",
        agentClass: "Inocente",
        agentDescription: "Pietra é observadora, com olhos atentos que raramente deixam um detalhe escapar. Ela percebe o que passa despercebido para muitos, mas sua memória curta a obriga a agir rápido e com astúcia. Quando quer, pode ser sutilmente manipuladora, distorcendo situações a seu favor com um charme disfarçado e um sorriso indecifrável.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: assassinAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: assassinAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: assassinAbilities.dexterity
            },
        ],
        agentTeam: [
            "emelly"
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    pedro: {
        agentStatus: "deceased",
        agentImage: "./agents/pedro.png",
        agentName: "PEDRO",
        agentFullName: "Pedro Henrique",
        agentClass: "Inocente",
        agentDescription: "Pedro é o tipo de pessoa que transforma qualquer sala em um palco, usando o humor como disfarce para sua sagacidade. Suas piadas são cuidadosamente calculadas, muitas vezes escondendo perguntas maliciosas que jogam verde para colher maduro. Embora pense de forma afiada, sua execução pode ser mais lenta — e quando se trata de força física, prefere escapar com palavras do que com músculos.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um policial infiltrado na base. Seu dever é proteger o VIP a todo custo e eliminar os assassinos antes que eles descubram sua identidade ou, pior ainda, a identidade do VIP. Apenas você e o VIP sabem da existência um do outro. Ninguém mais deve saber quem você é, nem mesmo os inocentes. Você deve agir com cautela, mantendo sua cobertura enquanto investiga quem entre os jogadores é uma ameaça. Se os assassinos descobrirem quem você é, sua vida estará em risco, e a queda do VIP será apenas questão de tempo. Use sua intuição, sua frieza, e sua estratégia. O futuro depende da sua habilidade em se esconder à vista de todos — e agir no momento certo."
    },
    luiza: {
        agentStatus: "alive",
        agentImage: "./agents/luiza.png",
        agentName: "LUIZA",
        agentFullName: "Luiza Tavares",
        agentClass: "Inocente",
        agentDescription: "Luiza é pequena e ágil, movendo-se com a leveza de quem já nasceu para não ser notada. Sua aparência doce e inofensiva é sua arma mais afiada — o tipo de pessoa que todos subestimam, até ser tarde demais. Afinal, são sempre as facas menores que causam os cortes mais profundos.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é o VIP. Sua identidade é secreta e você é a peça mais importante da resistência. Apenas os policiais sabem quem você é, e você sabe quem são eles. Sua missão é sobreviver sem levantar suspeitas, enquanto colabora secretamente com os policiais. Você tem acesso a uma lista com possíveis assassinos e, a cada rodada, pode eliminar um nome inocente dessa lista, se aproximando cada vez mais da verdade. Os assassinos vencerão se conseguirem te matar, mas o problema é que eles não sabem quem você é — e é exatamente assim que deve continuar. Fingir ser apenas mais um inocente será a sua melhor defesa. Um movimento em falso e tudo estará perdido. Cuidado em quem confia, mantenha-se invisível, e sobreviva."
    },
    amanda: {
        agentStatus: "alive",
        agentImage: "./agents/amanda.png",
        agentName: "AMANDA",
        agentFullName: "Amanda Verri",
        agentClass: "Inocente",
        agentDescription: "Amanda é inteligente e espirituosa, com uma mente afiada para detalhes e uma língua afiada para piadas. No entanto, sua furtividade nem sempre acompanha sua esperteza — tropeços e barulhos indesejados podem denunciar sua presença. Mas quando se trata de enxergar o que ninguém mais viu, ela está sempre um passo à frente.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "+1",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "0",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    maria: {
        agentStatus: "alive",
        agentImage: "./agents/maria.png",
        agentName: "MARIA",
        agentFullName: "Maria Eduarda",
        agentClass: "Inocente",
        agentDescription: "Maria é uma combinação rara de inteligência, agilidade e dissimulação. Ela se move com leveza e fala com convicção, capaz de mentir com naturalidade quando necessário. Seu amplo conhecimento lhe dá vantagem em praticamente qualquer situação, e sua furtividade a torna quase invisível quando precisa desaparecer.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um assassino infiltrado, e sua missão é eliminar o VIP. O problema? Você não sabe quem ele é — ainda. Precisa observar, deduzir, manipular e se infiltrar entre os inocentes, fingindo ajudar nas tarefas para não levantar suspeitas. Pode até colaborar em alguns momentos, se for necessário manter as aparências. Você e seu(s) parceiro(s) devem agir com inteligência: sabotar sutilmente, sem chamar atenção, e atacar no momento certo. Se o VIP morrer, vocês vencem. Mas se forem descobertos antes disso, serão caçados sem piedade. Em um jogo onde todos desconfiam de todos, a mentira é sua arma mais letal. Disfarce é sobrevivência. E assassinato, libertação."
    },
    caio: {
        agentStatus: "alive",
        agentImage: "./agents/caio.png",
        agentName: "CAIO",
        agentFullName: "Caio Quelhas",
        agentClass: "V.I.P",
        agentDescription: "Caio é aquele que sempre tem uma piada na ponta da língua e uma saída pronta para qualquer situação. Ágil e sociável, consegue escapar de enrascadas com um sorriso e uma frase bem colocada. Seu físico leve e atlético o ajuda a fugir, escalar ou enfrentar o que for preciso — e se não der pra fugir com o corpo, ele escapa com lábia.",
        agentAbilities: [
            {
                type: "Força",
                buff: "0",
                habilities: vipAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "-1",
                habilities: vipAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: vipAbilities.dexterity
            },
        ],
        agentTeam: [
            "luis",
            "gustavo"
        ],
        missionBriefing: "Você é um policial infiltrado na base. Seu dever é proteger o VIP a todo custo e eliminar os assassinos antes que eles descubram sua identidade ou, pior ainda, a identidade do VIP. Apenas você e o VIP sabem da existência um do outro. Ninguém mais deve saber quem você é, nem mesmo os inocentes. Você deve agir com cautela, mantendo sua cobertura enquanto investiga quem entre os jogadores é uma ameaça. Se os assassinos descobrirem quem você é, sua vida estará em risco, e a queda do VIP será apenas questão de tempo. Use sua intuição, sua frieza, e sua estratégia. O futuro depende da sua habilidade em se esconder à vista de todos — e agir no momento certo."
    },
    luis: {
        agentStatus: "alive",
        agentImage: "./agents/luis.png",
        agentName: "LUIS",
        agentFullName: "Luis Felipe",
        agentClass: "Policial",
        agentDescription: "Luis tem o dom da conversa e o charme de quem sabe exatamente o que dizer. Ele se mistura facilmente com qualquer grupo e evita conflitos com habilidade. Sua agilidade e preparo físico o ajudam a escapar de situações perigosas, mas é sua sociabilidade que o mantém quase sempre longe de encrenca.",
        agentAbilities: [
            {
                type: "Força",
                buff: "0",
                habilities: copAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "-1",
                habilities: copAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: copAbilities.dexterity
            },
        ],
        agentTeam: [
            "caio",
            "gustavo"
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    richard: {
        agentStatus: "alive",
        agentImage: "./agents/richard.png",
        agentName: "RICHARD",
        agentFullName: "Richard Duarte",
        agentClass: "Inocente",
        agentDescription: "Richard é forte, inteligente e focado. Ele fala pouco, mas cada palavra carrega peso. Seu corpo atlético o torna capaz de lidar com qualquer situação física com facilidade, mas sua tendência a ser chamativo e direto pode comprometer sua discrição. Quando age, é com força e precisão — mas raramente sem ser notado.",
        agentAbilities: [
            {
                type: "Força",
                buff: "+1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "-1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    gustavo: {
        agentStatus: "alive",
        agentImage: "./agents/gustavo.png",
        agentName: "GUSTAVO",
        agentFullName: "Gustavo Leal",
        agentClass: "Policial",
        agentDescription: "Gustavo é pura força e velocidade. Seu físico o torna uma ameaça em qualquer confronto físico, e ele domina desafios que exigem movimento e resistência. No entanto, sua mente nem sempre acompanha sua força — situações que exigem raciocínio rápido podem deixá-lo para trás. Furtividade não é seu ponto forte, e seu jeito atrapalhado costuma denunciá-lo antes mesmo de agir.",
        agentAbilities: [
            {
                type: "Força",
                buff: "+1",
                habilities: copAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "-1",
                habilities: copAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "0",
                habilities: copAbilities.dexterity
            },
        ],
        agentTeam: [
            "caio",
            "luis"
        ],
        missionBriefing: "Você é um assassino infiltrado, e sua missão é eliminar o VIP. O problema? Você não sabe quem ele é — ainda. Precisa observar, deduzir, manipular e se infiltrar entre os inocentes, fingindo ajudar nas tarefas para não levantar suspeitas. Pode até colaborar em alguns momentos, se for necessário manter as aparências. Você e seu(s) parceiro(s) devem agir com inteligência: sabotar sutilmente, sem chamar atenção, e atacar no momento certo. Se o VIP morrer, vocês vencem. Mas se forem descobertos antes disso, serão caçados sem piedade. Em um jogo onde todos desconfiam de todos, a mentira é sua arma mais letal. Disfarce é sobrevivência. E assassinato, libertação."
    },
    emelly: {
        agentStatus: "deceased",
        agentImage: "./agents/emelly.png",
        agentName: "EMELLY",
        agentFullName: "Emelly Rosa",
        agentClass: "Assassino",
        agentDescription: "Emelly é uma sombra silenciosa. Inteligente, reservada e extremamente atenta, ela observa tudo e todos com um olhar afiado. Sua habilidade de se manter discreta e sua natureza introspectiva fazem dela quase invisível quando deseja. Cada passo é calculado, cada silêncio é estratégico — e quando ela fala, é porque vale a pena ouvir.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: assassinAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: assassinAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: assassinAbilities.dexterity
            },
        ],
        agentTeam: [
            "pietra"
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    caetano: {
        agentStatus: "deceased",
        agentImage: "./agents/caetano.png",
        agentName: "CAETANO",
        agentFullName: "Caetano",
        agentClass: "Inocente",
        agentDescription: "Caetano é o tipo de pessoa que some antes mesmo do problema chegar. Ágil e escorregadio, ele transforma qualquer situação numa chance de improviso cômico. Suas mentiras beiram o absurdo, mas ditas com tanta confiança que é difícil duvidar. Frágil e sem força física, evita confrontos diretos com o mesmo talento que usa para escapar: lábia afiada e um senso de humor que distrai até o perigo.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    vitoria: {
        agentStatus: "hiding",
        agentImage: "./agents/vitoria.png",
        agentName: "VITÓRIA",
        agentFullName: "Vitória Carone",
        agentClass: "Inocente",
        agentDescription: "Vitória é o tipo de pessoa que entra em cena com energia contagiante, resolvendo problemas no impulso e no braço. Carismática e direta, se destaca tanto na ação quanto nas conversas. Mas quando a situação exige silêncio e precisão, sua presença vira ruído — desastrada demais para a furtividade, barulhenta demais para passar despercebida.",
        agentAbilities: [
            {
                type: "Força",
                buff: "+1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "-1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    hallan: {
        agentStatus: "alive",
        agentImage: "./agents/unknown.png",
        agentName: "HALLAN",
        agentFullName: "Hallan Gabriel",
        agentClass: "Inocente",
        agentDescription: "Nenhuma informação encontrada sobre o agente.",
        agentAbilities: [
            {
                type: "Força",
                buff: "+1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "-1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    sabrina: {
        agentStatus: "alive",
        agentImage: "./agents/unknown.png",
        agentName: "SABRINA",
        agentFullName: "Sabrina Machado",
        agentClass: "Inocente",
        agentDescription: "Nenhuma informação encontrada sobre o agente.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    kaiky: {
        agentStatus: "hiding",
        agentImage: "./agents/unknown.png",
        agentName: "KAIKY",
        agentFullName: "Kaiky Motisuki",
        agentClass: "Inocente",
        agentDescription: "Nenhuma informação encontrada sobre o agente.",
        agentAbilities: [
            {
                type: "Força",
                buff: "-1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "+1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    yasmim: {
        agentStatus: "hiding",
        agentImage: "./agents/unknown.png",
        agentName: "YASMIM",
        agentFullName: "Yasmim Nascimento",
        agentClass: "Inocente",
        agentDescription: "Nenhuma informação encontrada sobre o agente.",
        agentAbilities: [
            {
                type: "Força",
                buff: "0",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "+1",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "-1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
    fellipe: {
        agentStatus: "hiding",
        agentImage: "./agents/unknown.png",
        agentName: "FELLIPE",
        agentFullName: "Fellipe Oliveira",
        agentClass: "Inocente",
        agentDescription: "Nenhuma informação encontrada sobre o agente.",
        agentAbilities: [
            {
                type: "Força",
                buff: "+1",
                habilities: innocentAbilities.strength
            },
            {
                type: "Inteligência",
                buff: "0",
                habilities: innocentAbilities.intelligence
            },
            {
                type: "Dextreza",
                buff: "-1",
                habilities: innocentAbilities.dexterity
            },
        ],
        agentTeam: [
        ],
        missionBriefing: "Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem."
    },
};

const agentsPlaying = [
    'pietra',
    'pedro',
    'luiza',
    'amanda',
    'caio',
    'luis',
    'gustavo',
    'emelly',
    'caetano',
    'fellipe'
]

const lastNightReport = "23:00 — Nenhuma movimentação detectada. \n00:00 - Atividade detectada. 8 Tarefas feitas \n02:00 - Atividade incomum detectada. 0 pessoas foram presas. \n04:00 - Atividade incomum detectada. 3 intenções assassinas.\n07:00 — Despertadores acionados. Dia amanheceu. \n\nResumo da noite: Nenhuma atividade incomum detectada."

module.exports = {
  missionBriefings,
  innocentAbilities,
  assassinAbilities,
  copAbilities,
  vipAbilities,
  agentsData,
  agentsPlaying,
  lastNightReport
}