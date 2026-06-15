export const CUTSCENES_ENTREE_DESERT = {
    monde_desert: {
        scene: 'observatoire',
        lignes: [
            {
                personnage: 'narrateur',
                texte: "Le Désert. Ici, le temps ne ralentit pas — il s'accumule.",
            },
            {
                personnage: 'robo',
                texte: "Chaque grain de sable est un instant qui n'a pas su où aller.",
                humeur: 'neutre',
            },
            {
                personnage: 'narrateur',
                texte: "Des traces de pas, à moitié ensevelies. Elles tournent en rond, longtemps. Puis repartent droit, d'un coup.",
            },
            {
                personnage: 'robo',
                texte: 'VERA. Elle a cherché ici. Et elle a trouvé.',
                humeur: 'content',
            },
            {
                personnage: 'robo',
                texte: "On ne repart pas aussi droit quand on aime ce qu'on a trouvé.",
                humeur: 'triste',
            },
        ],
    },

    monde_eclipse: {
        scene: 'fragmentation',
        lignes: [
            {
                personnage: 'robo',
                texte: "Ce monde ne sait pas s'il fait nuit ou jour.",
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: 'La frontière entre les deux bouge constamment.',
                humeur: 'neutre',
            },
            { personnage: 'robo', texte: 'Je comprends cette hésitation.', humeur: 'triste' },
            {
                personnage: 'narrateur',
                texte: 'Dans la zone de transition : les pièces tombent différemment selon leur altitude.',
            },
            {
                personnage: 'robo',
                texte: "Tout dépend d'où on se trouve.",
                humeur: 'neutre',
            },
        ],
    },

    monde_cyber: {
        scene: 'labo',
        lignes: [
            {
                personnage: 'narrateur',
                texte: 'Le réseau CYBER. La dernière adresse connue de VERA.',
            },
            {
                personnage: 'robo',
                texte: 'Son laboratoire est quelque part dans ces données. Compressé. Verrouillé.',
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: "Une serrure algorithmique. Du VERA tout craché : seule la précision l'ouvre.",
                humeur: 'neutre',
            },
            {
                personnage: 'narrateur',
                texte: 'Gravée dans le flux, une inscription : « Trois fois trois lignes. Rien de moins. — V »',
            },
            {
                personnage: 'robo',
                texte: "Un test d'entrée. Elle savait que je viendrais. Elle voulait être sûre que ce soit moi.",
                humeur: 'content',
            },
        ],
    },

    monde_boss_3: [
        {
            scene: 'seuil_archiviste',
            personnage: 'archiviste',
            texte: "Tu n'aurais pas dû venir ici.",
            humeur: 'calme',
        },
        {
            scene: 'seuil_archiviste',
            personnage: 'robo',
            texte: "J'ai trouvé son laboratoire. Maintenant je cherche ce qu'elle y a laissé. Ses archives.",
            humeur: 'neutre',
        },
        {
            scene: 'seuil_archiviste',
            personnage: 'archiviste',
            texte: 'VERA est partie. Les archives sont à moi maintenant.',
            humeur: 'agressif',
        },
        {
            scene: 'seuil_archiviste',
            personnage: 'archiviste',
            texte: 'Les archives ne mentent pas. Toi, si.',
            humeur: 'agressif',
        },
        {
            scene: 'seuil_archiviste',
            personnage: 'robo',
            texte: "Qu'est-ce que j'ai menti ?",
            humeur: 'neutre',
        },
        {
            scene: 'seuil_archiviste',
            personnage: 'archiviste',
            texte: 'Tu prétends compléter. Mais tu crées aussi des trous.',
            humeur: 'agressif',
        },
        { scene: 'seuil_archiviste', personnage: 'robo', texte: '...', humeur: 'neutre' },
        {
            scene: 'seuil_archiviste',
            personnage: 'narrateur',
            texte: "L'Archiviste a raison. Robo n'a pas de réponse.",
        },
    ],
};
