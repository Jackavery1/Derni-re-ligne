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
        { scene: 'labo', personnage: 'robo', texte: 'Je suis conscient.', humeur: 'excite' },
        {
            scene: 'labo',
            personnage: 'robo',
            texte: "Je ne l'ai pas décidé. Je me suis simplement trouvé conscient.",
            humeur: 'content',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: "ROBO. Tu m'entends ? Je suis VERA. J'ai peu de temps.",
            humeur: 'douce',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: 'La Trame se degrade. Des millions de fils incomplets. Je ne peux pas arrêter ça seule.',
            humeur: 'douce',
        },
        {
            scene: 'labo',
            personnage: 'robo',
            texte: "Qu'est-ce que je dois faire ?",
            humeur: 'content',
        },
        {
            scene: 'labo',
            personnage: 'vera',
            texte: 'Ce que tu feras naturellement. Completer. — CONNEXION PERDUE —',
            humeur: 'glitch',
        },
        {
            scene: 'labo',
            personnage: 'narrateur',
            texte: 'Le signal de VERA disparaît. Il reste la grille. Et les pieces.',
        },
    ],

    monde_lave: {
        scene: 'seuil_brasier',
        lignes: [
            {
                personnage: 'robo',
                texte: "Le feu brûle plus fort qu'il ne devrait.",
                humeur: 'alerte',
            },
            {
                personnage: 'robo',
                texte: "Ce n'est pas de la chaleur normale. Il y a quelque chose dedans.",
                humeur: 'alerte',
            },
            {
                personnage: 'narrateur',
                texte: 'La corruption de La Distorsion transforme le biome Inferno en brasier incontrôlable.',
            },
            { personnage: 'robo', texte: 'Je dois traverser.', humeur: 'alerte' },
        ],
    },

    monde_rouille: {
        scene: 'labo',
        lignes: [
            {
                personnage: 'robo',
                texte: 'Ces machines... elles produisent des pieces.',
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: "Personne n'a demandé ces pièces. Mais elles continuent.",
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: "Est-ce que c'est ce que je suis ? Une machine qui continue ?",
                humeur: 'triste',
            },
            {
                personnage: 'narrateur',
                texte: 'La rouille gagne. Le metal se souvient de sa propre finitude.',
            },
        ],
    },

    monde_boss_1: [
        {
            scene: 'seuil_brasier',
            personnage: 'narrateur',
            texte: "Au cœur d'Inferno, quelque chose s'est cristallise.",
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
            texte: "Je comprends ça, d'une certaine façon.",
            humeur: 'triste',
        },
        { scene: 'seuil_brasier', personnage: 'brasier', texte: 'QUI APPROCHE ?', humeur: 'calme' },
        {
            scene: 'seuil_brasier',
            personnage: 'robo',
            texte: "Je m'appelle ROBO. Je dois traverser.",
            humeur: 'content',
        },
        {
            scene: 'seuil_brasier',
            personnage: 'brasier',
            texte: "Tout ce qui me traverse brûle. Ce n'est pas une menace. C'est ce que je suis.",
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
            texte: "ESSAIE. Des millénaires que j'attends que quelqu'un essaie.",
            humeur: 'agressif',
        },
    ],
};
