export const JOURNAUX_VERA_DIALOGUES = {
    journal_6: [
        { personnage: 'systeme', texte: 'TRANSMISSION 06 — INTÉGRITÉ : 31%' },
        { personnage: 'vera', texte: '...pas la détruire... com—' },
        { personnage: 'vera', texte: "—prendre ce qu'elle res—" },
        { personnage: 'systeme', texte: 'SEGMENTS MANQUANTS. RECONSTRUCTION IMPOSSIBLE.' },
        { personnage: 'robo', texte: 'Le reste est du sable.' },
    ],
};

// ============================================================
// DÉCOUVERTES LABORATOIRE VERA (CYBER)
// ============================================================
export const DECOUVERTE_LABO = [
    { personnage: 'narrateur', texte: "Les archives s'ouvrent." },
    { personnage: 'vera', texte: 'Si tu lis ceci, tu as reussi le triple Tetris. Bien joue.' },
    {
        personnage: 'vera',
        texte: "J'ai laisse une serrure algorithmique. Seule la precision l'ouvre.",
    },
    { personnage: 'vera', texte: 'Voici ce que tu dois savoir sur La Distorsion.' },
    {
        personnage: 'vera',
        texte: "Elle n'est pas nee d'une erreur. Elle est nee d'un choix collectif.",
    },
    {
        personnage: 'vera',
        texte: "Des millions de joueurs, sur des millions d'annees, qui abandonnaient leurs parties.",
    },
    {
        personnage: 'vera',
        texte: 'Chaque ligne incomplete laissee dans la Trame. Accumulee. Cristallisee.',
    },
    { personnage: 'vera', texte: 'Elle est la somme de toutes les frustrations. Et elle souffre.' },
    {
        personnage: 'vera',
        texte: "Je vais entrer dans la Trame pour lui parler. Ne m'attends pas.",
    },
    { personnage: 'robo', texte: "... Elle savait ce qu'elle faisait." },
];

export const FRAGMENTS_VERA_SIGNAL = {
    apres_ocean: [
        { personnage: 'systeme', texte: '> SIGNAL PARASITE — FRÉQUENCE INCONNUE' },
        { personnage: 'vera', texte: '...Robo... tu... entends...' },
        {
            personnage: 'vera',
            texte: "...ne... laisse pas La Distorsion te convaincre qu'elle a... raison...",
        },
        { personnage: 'systeme', texte: '> SIGNAL PERDU' },
    ],
    apres_foret: [
        { personnage: 'systeme', texte: '> INTERFÉRENCE DÉTECTÉE — 0.3 SECONDES' },
        {
            personnage: 'vera',
            texte: "...dans la Trame... elle n'est pas seule... il y a... autre chose...",
        },
        { personnage: 'systeme', texte: '> SIGNAL CORROMPU — ANALYSE IMPOSSIBLE' },
    ],
    apres_glace: [
        { personnage: 'systeme', texte: '> TRANSMISSION PARTIELLE — ORIGINE : SECTEUR OMEGA' },
        {
            personnage: 'vera',
            texte: "...j'ai compris ce qu'elle cherche... ce n'est pas la destruction...",
        },
        { personnage: 'vera', texte: "...c'est..." },
        { personnage: 'systeme', texte: '> COUPURE FORCÉE PAR TIERS INCONNU' },
    ],
    apres_desert: [
        { personnage: 'systeme', texte: '> FRAGMENT — 1.1 SECONDES' },
        {
            personnage: 'vera',
            texte: "...je t'ai construit trop vite. J'aurais dû t'apprendre à avoir peur d'abord...",
        },
        {
            personnage: 'vera',
            texte: '...mais tu as appris tout seul. Je suis desolee et fiere en même temps...',
        },
        { personnage: 'systeme', texte: '> FIN DU FRAGMENT' },
    ],
    apres_eclipse: [
        { personnage: 'systeme', texte: '> ANOMALIE — SOURCE NON IDENTIFIABLE' },
        {
            personnage: 'distorsion',
            texte: "...laisse-le continuer. Il doit arriver jusqu'à moi...",
        },
        { personnage: 'systeme', texte: '> SIGNAL : NON-VERA. ORIGINE : INTERNE À LA TRAME.' },
    ],
};
