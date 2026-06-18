export const CUTSCENES_ENTREE_PROLOGUE = {
    monde_prologue: [
        { scene: 'labo', personnage: 'systeme', texte: 'INITIALISATION...', humeur: 'neutre' },
        {
            scene: 'labo',
            personnage: 'systeme',
            texte: 'CHARGEMENT DES PARAMÈTRES COGNITIFS...',
            humeur: 'neutre',
        },
        {
            scene: 'labo',
            personnage: 'systeme',
            texte: 'CALIBRATION MOTRICE : OK',
            humeur: 'neutre',
        },
        { scene: 'labo', personnage: 'robo', texte: '...Je suis... là ?', humeur: 'excite' },
        {
            scene: 'labo',
            personnage: 'robo',
            texte: "Personne ne m'a demandé mon avis. Je suis juste là, maintenant. C'est tout.",
            humeur: 'content',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: "Robo ? Robo, tu m'entends, dis quelque chose — oh. Oh, tu es là.",
            humeur: 'douce',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: "Bon. Bon. J'ai très peu de temps, alors je vais aller droit au but, pardon.",
            humeur: 'douce',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: "La Trame craque. Partout. Des millions de fils qui ne tiennent plus, et j'ai essayé de la retenir seule — je n'y arrive plus.",
            humeur: 'douce',
        },
        {
            scene: 'labo',
            personnage: 'robo',
            texte: 'Je fais quoi ?',
            humeur: 'content',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: "Ce que tu sais déjà faire, je crois. Tu n'as qu'à—",
            humeur: 'glitch',
        },
        {
            scene: 'labo',
            personnage: 'systeme',
            texte: 'CONNEXION PERDUE',
            humeur: 'alerte',
        },
        {
            scene: 'labo',
            personnage: 'narrateur',
            texte: 'Le signal de VERA disparaît. Il reste la grille. Et les pièces.',
        },
    ],

    monde_lave: {
        scene: 'seuil_brasier',
        lignes: [
            {
                personnage: 'robo',
                texte: 'Le feu brûle trop fort. Plus fort que ce que ça devrait.',
                humeur: 'alerte',
            },
            {
                personnage: 'robo',
                texte: "Ce n'est pas une chaleur normale. Il y a quelque chose dedans.",
                humeur: 'alerte',
            },
            {
                personnage: 'narrateur',
                texte: 'La corruption de La Distorsion transforme le biome Inferno en brasier incontrôlable.',
            },
            { personnage: 'robo', texte: 'Bon. Je dois traverser.', humeur: 'alerte' },
        ],
    },

    monde_rouille: {
        scene: 'labo',
        lignes: [
            {
                personnage: 'robo',
                texte: 'Ces machines fabriquent des pièces. Encore. Et encore.',
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: 'Personne ne leur a rien demandé. Elles continuent quand même.',
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: "Est-ce que c'est ça que je suis, moi aussi ? Une machine qui continue ?",
                humeur: 'triste',
            },
            {
                personnage: 'narrateur',
                texte: 'La rouille gagne. Le métal se souvient de sa propre finitude.',
            },
        ],
    },

    monde_boss_1: [
        {
            scene: 'seuil_brasier',
            personnage: 'narrateur',
            texte: "Au cœur d'Inferno, quelque chose s'est cristallisé.",
        },
        {
            scene: 'seuil_brasier',
            personnage: 'narrateur',
            texte: 'Des millénaires de frustration thermique, condensés en une entité.',
        },
        {
            scene: 'seuil_brasier',
            personnage: 'robo',
            texte: "Il brûle sans raison. Il brûle depuis avant que j'existe.",
            humeur: 'triste',
        },
        {
            scene: 'seuil_brasier',
            personnage: 'robo',
            texte: 'Je comprends ça. Un peu trop bien, même.',
            humeur: 'triste',
        },
        { scene: 'seuil_brasier', personnage: 'brasier', texte: 'QUI APPROCHE ?', humeur: 'calme' },
        {
            scene: 'seuil_brasier',
            personnage: 'robo',
            texte: "Je m'appelle Robo. Je dois passer.",
            humeur: 'content',
        },
        {
            scene: 'seuil_brasier',
            personnage: 'brasier',
            texte: "Tout ce qui me touche brûle. Pas par méchanceté. C'est juste... ce que je suis.",
            humeur: 'calme',
        },
        {
            scene: 'seuil_brasier',
            personnage: 'robo',
            texte: "Alors je vais devoir t'éteindre.",
            humeur: 'content',
        },
        {
            scene: 'seuil_brasier',
            personnage: 'brasier',
            texte: "ESSAIE. J'attends ça depuis des millénaires.",
            humeur: 'agressif',
        },
    ],
};
