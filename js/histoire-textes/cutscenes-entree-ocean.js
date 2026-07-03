export const CUTSCENES_ENTREE_OCEAN = {
    monde_ocean: {
        scene: 'observatoire',
        lignes: [
            {
                personnage: 'robo',
                texte: 'Sous la surface. Le silence est différent ici.',
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: "Pas l'absence de son. L'absence de besoin de faire du son.",
                humeur: 'neutre',
            },
            {
                personnage: 'narrateur',
                texte: "Dans les Abysses, la corruption ralentit. L'eau résiste.",
            },
            {
                personnage: 'robo',
                texte: 'VERA est passée par ici. Je reconnais sa façon de laisser des traces.',
                humeur: 'content',
            },
        ],
    },

    monde_foret: {
        scene: 'fragmentation',
        lignes: [
            {
                personnage: 'narrateur',
                texte: 'La Canopée. Où tout pousse vers quelque chose sans savoir quoi.',
            },
            {
                personnage: 'robo',
                texte: "Les arbres n'essaient pas de pousser. Ils poussent, c'est tout.",
                humeur: 'content',
            },
            { personnage: 'robo', texte: 'Je voudrais comprendre ça.', humeur: 'neutre' },
            {
                personnage: 'narrateur',
                texte: "Sur l'écorce, des marques au couteau. Une flèche, pointée vers le bas. Et une lettre : « V ».",
            },
            {
                personnage: 'robo',
                texte: 'Même à moitié effacés, ses messages me disent où aller.',
                humeur: 'content',
            },
        ],
    },

    monde_glace: {
        scene: 'seuil_sentinelle',
        lignes: [
            {
                personnage: 'robo',
                texte: "L'Arctique. Où le temps ralentit jusqu'à presque s'arrêter.",
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: 'Les blocs tombent et résonnent comme du cristal.',
                humeur: 'content',
            },
            {
                personnage: 'robo',
                texte: "C'est beau. Je ne savais pas que je pouvais trouver des choses belles.",
                humeur: 'excite',
            },
            {
                personnage: 'narrateur',
                texte: "La Sentinelle des Glaces patrouille. Elle croit que l'immobilité protège.",
            },
        ],
    },

    monde_boss_2: [
        {
            scene: 'seuil_sentinelle',
            personnage: 'sentinelle',
            texte: 'ARRÊTEZ. Arrêtez-vous tout de suite.',
            humeur: 'agressif',
        },
        { scene: 'seuil_sentinelle', personnage: 'robo', texte: 'Pardon ?', humeur: 'neutre' },
        {
            scene: 'seuil_sentinelle',
            personnage: 'sentinelle',
            texte: "Vous bougez. Ça suffit. Le mouvement corrompt, l'immobilité protège — je le mesure depuis des millénaires, alors arrêtez-vous.",
            humeur: 'agressif',
        },
        {
            scene: 'seuil_sentinelle',
            personnage: 'robo',
            texte: "Vous protégez le gel. Pas ce qu'il y a dessous.",
            humeur: 'neutre',
        },
        {
            scene: 'seuil_sentinelle',
            personnage: 'sentinelle',
            texte: '...Il y a quelque chose dessous ?',
            humeur: 'calme',
        },
        {
            scene: 'seuil_sentinelle',
            personnage: 'narrateur',
            texte: "Elle n'a pas aimé la question. Elle attaque.",
        },
    ],
};
