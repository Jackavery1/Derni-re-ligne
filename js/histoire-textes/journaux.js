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
            texte: "Encore un trou. Je n'aurai jamais la phrase complète.",
            humeur: 'alerte',
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
        scene: 'labo',
        texte: "Les archives s'ouvrent.",
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: 'Si tu lis ceci, tu as réussi le triple Tetris. Bien joué.',
        humeur: 'douce',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: "J'ai laissé une serrure algorithmique. Seule la précision l'ouvre.",
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: 'Bon. Voici ce que tu dois savoir sur La Distorsion — accroche-toi.',
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: "Elle n'est pas née d'une erreur. Elle est née d'un choix collectif.",
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: "Des millions de joueurs, sur des millions d'années, qui abandonnaient leurs parties.",
        humeur: 'determinee',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: 'Chaque ligne incomplète laissée dans la Trame. Accumulée. Cristallisée.',
        humeur: 'inquiete',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: 'Elle est la somme de toutes les frustrations. Et elle souffre.',
        humeur: 'inquiete',
    },
    {
        personnage: 'vera',
        scene: 'labo',
        texte: "Je vais entrer dans la Trame pour lui parler. Ne m'attends pas. Je reviendrai, d'accord ? Je reviendrai.",
        humeur: 'determinee',
    },
    {
        personnage: 'robo',
        scene: 'labo',
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
            texte: '...mais tu as appris tout seul. Je suis désolée et fière en même temps...',
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

    apres_lave: [
        { personnage: 'systeme', texte: '> BRUIT THERMIQUE — CANAL 7', humeur: 'alerte' },
        {
            personnage: 'vera',
            texte: "...la chaleur ici... ce n'est pas du feu normal... c'est de la colère solidifiée...",
            humeur: 'inquiete',
        },
        { personnage: 'systeme', texte: '> SATURATION DU CAPTEUR', humeur: 'alerte' },
    ],

    apres_prologue: [
        { personnage: 'systeme', texte: '> PREMIER CONTACT — CANAL VERA', humeur: 'neutre' },
        {
            personnage: 'vera',
            texte: "...Robo... si tu m'entends... ne t'arrête pas après la première grille...",
            humeur: 'douce',
        },
        { personnage: 'systeme', texte: '> SIGNAL FAIBLE', humeur: 'alerte' },
    ],

    apres_rouille: [
        { personnage: 'systeme', texte: '> INTERFERENCE METALLIQUE', humeur: 'alerte' },
        {
            personnage: 'vera',
            texte: '...ces machines rouillées... elles gardent la mémoire de ce qui a été abandonné...',
            humeur: 'inquiete',
        },
        { personnage: 'systeme', texte: '> FIN DU FRAGMENT', humeur: 'alerte' },
    ],

    apres_cyber: [
        { personnage: 'systeme', texte: '> PAQUET CHIFFRÉ — CLÉ VERA', humeur: 'neutre' },
        {
            personnage: 'vera',
            texte: '...si tu lis ceci dans le réseau : ne fais pas confiance aux scores parfaits. Ils mentent par omission.',
            humeur: 'determinee',
        },
        { personnage: 'systeme', texte: '> DÉCHIFFREMENT INTERROMPU', humeur: 'alerte' },
    ],

    apres_fuochi: [
        { personnage: 'systeme', texte: '> ÉCHO SONORE — 0.7 SECONDES', humeur: 'alerte' },
        {
            personnage: 'vera',
            texte: '...ces feux... je les ai allumés pour toi... pour que tu saches que la joie existe encore...',
            humeur: 'douce',
        },
        { personnage: 'systeme', texte: "> FIN DE L'ÉCHO", humeur: 'alerte' },
    ],

    apres_cosmos: [
        { personnage: 'systeme', texte: '> SIGNAL FAIBLE — DISTANCE : INCONNUE', humeur: 'neutre' },
        {
            personnage: 'vera',
            texte: '...de si loin... je vois encore ta grille... ne lâche pas quand tout devient silence...',
            humeur: 'inquiete',
        },
        { personnage: 'systeme', texte: '> DÉRIVE ORBITALE DU MESSAGE', humeur: 'alerte' },
    ],

    apres_vide: [
        { personnage: 'systeme', texte: '> SILENCE ABSOLU — 2.0 SECONDES', humeur: 'alerte' },
        {
            personnage: 'vera',
            texte: "...ici il n'y a rien... c'est le pire endroit... et pourtant tu avances...",
            humeur: 'glitch',
        },
        { personnage: 'systeme', texte: '> REPRISE DU BRUIT DE FOND', humeur: 'alerte' },
    ],

    apres_miroir: [
        { personnage: 'systeme', texte: '> REFLET INSTABLE — CANAL 9', humeur: 'alerte' },
        {
            personnage: 'vera',
            texte: "...de l'autre côté du miroir... tu as vu ce qu'elle voit... n'oublie pas que ce n'est pas toi...",
            humeur: 'inquiete',
        },
        { personnage: 'systeme', texte: '> IMAGE INVERSEE', humeur: 'alerte' },
    ],

    apres_trame: [
        { personnage: 'systeme', texte: '> DEPOT DANS LA TRAME — 1.4 SECONDES', humeur: 'neutre' },
        {
            personnage: 'vera',
            texte: "...tu as tout gardé jusqu'au bout... la phrase que j'ai laissée... tu l'as lue...",
            humeur: 'douce',
        },
        {
            personnage: 'vera',
            texte: '...maintenant tu peux choisir... partir ou rester... les deux comptent...',
            humeur: 'determinee',
        },
        { personnage: 'systeme', texte: '> FIN DU DEPOT', humeur: 'alerte' },
    ],

    apres_paradoxe: [
        {
            personnage: 'systeme',
            texte: '> ANOMALIE VOLONTAIRE — TOP NON DEMANDE',
            humeur: 'alerte',
        },
        {
            personnage: 'vera',
            texte: "...tu es revenu ici sans qu'on te le demande... trois fois... c'est comme ça qu'on trouve les portes secrètes...",
            humeur: 'douce',
        },
        { personnage: 'systeme', texte: '> BOUCLE PARADOXALE FERMEE', humeur: 'alerte' },
    ],
};
