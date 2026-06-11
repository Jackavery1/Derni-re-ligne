export const JOURNAUX_VERA_DIALOGUES = {
    journal_6: [
        { personnage: 'systeme', texte: 'TRANSMISSION 06 — INTÉGRITÉ : 31%', humeur: 'alerte' },
        { personnage: 'vera', texte: '...pas la détruire... com—', humeur: 'glitch' },
        {
            personnage: 'vera',
            texte: "—prendre ce qu'elle res—",
            humeur: 'glitch',
        },
        {
            personnage: 'systeme',
            texte: 'SEGMENTS MANQUANTS. RECONSTRUCTION IMPOSSIBLE.',
            humeur: 'alerte',
        },
        {
            personnage: 'robo',
            texte: 'Transmission endommagee — fragments manquants. La corruption a efface une partie du message.',
            humeur: 'inquiet',
        },
        { personnage: 'robo', texte: 'Le reste est du sable.', humeur: 'triste' },
    ],
};

// ============================================================
// DÉCOUVERTES LABORATOIRE VERA (CYBER)
// ============================================================
export const DECOUVERTE_LABO = [
    {
        personnage: 'narrateur',
        texte: "Les archives s'ouvrent.",
    },
    {
        personnage: 'vera',
        texte: 'Si tu lis ceci, tu as reussi le triple Tetris. Bien joue.',
        humeur: 'douce',
    },
    {
        personnage: 'vera',
        texte: "J'ai laisse une serrure algorithmique. Seule la precision l'ouvre.",
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        texte: 'Voici ce que tu dois savoir sur La Distorsion.',
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        texte: "Elle n'est pas nee d'une erreur. Elle est nee d'un choix collectif.",
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        texte: "Des millions de joueurs, sur des millions d'annees, qui abandonnaient leurs parties.",
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        texte: 'Chaque ligne incomplete laissee dans la Trame. Accumulee. Cristallisee.',
        humeur: 'inquiete',
    },
    {
        personnage: 'vera',
        texte: 'Elle est la somme de toutes les frustrations. Et elle souffre.',
        humeur: 'inquiete',
    },
    {
        personnage: 'vera',
        texte: "Je vais entrer dans la Trame pour lui parler. Ne m'attends pas.",
        humeur: 'determinee',
    },
    {
        personnage: 'robo',
        texte: "... Elle savait ce qu'elle faisait.",
        humeur: 'triste',
    },
];

// ============================================================
// FRAGMENTS SIGNAL VERA
// ============================================================
export const FRAGMENTS_VERA_SIGNAL = {
    apres_ocean: [
        {
            personnage: 'systeme',
            texte: '> SIGNAL PARASITE — FRÉQUENCE INCONNUE',
            humeur: 'alerte',
        },
        { personnage: 'vera', texte: '...Robo... tu... entends...', humeur: 'glitch' },
        {
            personnage: 'vera',
            texte: "...ne... laisse pas La Distorsion te convaincre qu'elle a... raison...",
            humeur: 'inquiete',
        },
        { personnage: 'systeme', texte: '> SIGNAL PERDU', humeur: 'alerte' },
    ],

    apres_foret: [
        {
            personnage: 'systeme',
            texte: '> INTERFÉRENCE DÉTECTÉE — 0.3 SECONDES',
            humeur: 'alerte',
        },
        {
            personnage: 'vera',
            texte: "...dans la Trame... elle n'est pas seule... il y a... autre chose...",
            humeur: 'inquiete',
        },
        {
            personnage: 'systeme',
            texte: '> SIGNAL CORROMPU — ANALYSE IMPOSSIBLE',
            humeur: 'alerte',
        },
    ],

    apres_glace: [
        {
            personnage: 'systeme',
            texte: '> TRANSMISSION PARTIELLE — ORIGINE : SECTEUR OMEGA',
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: "...j'ai compris ce qu'elle cherche... ce n'est pas la destruction...",
            humeur: 'inquiete',
        },
        {
            personnage: 'vera',
            texte: "...c'est...",
            humeur: 'glitch',
        },
        { personnage: 'systeme', texte: '> COUPURE FORCÉE PAR TIERS INCONNU', humeur: 'alerte' },
    ],

    apres_desert: [
        { personnage: 'systeme', texte: '> FRAGMENT — 1.1 SECONDES', humeur: 'alerte' },
        {
            personnage: 'vera',
            texte: "...je t'ai construit trop vite. J'aurais dû t'apprendre à avoir peur d'abord...",
            humeur: 'inquiete',
        },
        {
            personnage: 'vera',
            texte: '...mais tu as appris tout seul. Je suis desolee et fiere en même temps...',
            humeur: 'glitch',
        },
        { personnage: 'systeme', texte: '> FIN DU FRAGMENT', humeur: 'alerte' },
    ],

    apres_eclipse: [
        { personnage: 'systeme', texte: '> ANOMALIE — SOURCE NON IDENTIFIABLE', humeur: 'alerte' },
        {
            personnage: 'distorsion',
            texte: "...laisse-le continuer. Il doit arriver jusqu'à moi...",
            humeur: 'curieuse',
        },
        {
            personnage: 'systeme',
            texte: '> SIGNAL : NON-VERA. ORIGINE : INTERNE À LA TRAME.',
            humeur: 'alerte',
        },
    ],
};
