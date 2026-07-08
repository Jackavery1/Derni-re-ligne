/** @typedef {typeof ECRANS[keyof typeof ECRANS]} IdEcran */

export const ECRANS = {
    TITRE: 'ecran-titre',
    SELECTION: 'ecran-selection',
    OPTIONS: 'ecran-options',
    PAUSE: 'ecran-pause',
    GAME_OVER: 'ecran-game-over',
    ACHIEVEMENTS: 'ecran-achievements',
    PROFIL: 'ecran-profil',
    CODEX: 'ecran-codex',
    PAUSE_COOP: 'ecran-pause-coop',
    GAME_OVER_COOP: 'ecran-game-over-coop',
    ARCHI_SELECTION: 'ecran-archi-selection',
    ARCHI_RESULTAT: 'ecran-archi-resultat',
    HISTOIRE_MAP: 'ecran-histoire-map',
    HISTOIRE_CUTSCENE: 'ecran-histoire-cutscene',
    HISTOIRE_JOURNAL: 'ecran-histoire-journal',
    HISTOIRE_FIN: 'ecran-histoire-fin',
};

/** Fragments chargés au boot (écran titre et navigation menu). */
export const ECRANS_CHARGEMENT_IMMEDIAT = [
    ECRANS.TITRE,
    ECRANS.SELECTION,
    ECRANS.OPTIONS,
    'overlays',
];

/** Fragments requis avant le premier lancement de partie solo. */
export const FRAGMENTS_PARTIE = ['interface-jeu', ECRANS.PAUSE, ECRANS.GAME_OVER, 'controles'];

/** Fragments chargés à la première ouverture du mode ou écran associé. */
export const ECRANS_CHARGEMENT_DIFFERE = [
    ...FRAGMENTS_PARTIE,
    ECRANS.ACHIEVEMENTS,
    ECRANS.PROFIL,
    ECRANS.CODEX,
    'interface-jeu-coop',
    ECRANS.PAUSE_COOP,
    ECRANS.GAME_OVER_COOP,
    ECRANS.ARCHI_SELECTION,
    ECRANS.ARCHI_RESULTAT,
    'interface-jeu-archi',
    ECRANS.HISTOIRE_MAP,
];

/** Ordre de chargement des fragments HTML (source unique pour charger-ecrans et SW). */
export const LISTE_ECRANS_CHARGEMENT = [
    ...ECRANS_CHARGEMENT_IMMEDIAT,
    ...ECRANS_CHARGEMENT_DIFFERE,
];

/** @type {Partial<Record<IdEcran, string[]>>} */
export const FRAGMENTS_REQUIS_PAR_ECRAN = {
    [ECRANS.ACHIEVEMENTS]: [ECRANS.ACHIEVEMENTS],
    [ECRANS.PROFIL]: [ECRANS.PROFIL],
    [ECRANS.CODEX]: [ECRANS.CODEX],
    [ECRANS.PAUSE_COOP]: ['interface-jeu-coop', ECRANS.PAUSE_COOP],
    [ECRANS.GAME_OVER_COOP]: ['interface-jeu-coop', ECRANS.GAME_OVER_COOP],
    [ECRANS.ARCHI_SELECTION]: [ECRANS.ARCHI_SELECTION, 'interface-jeu-archi'],
    [ECRANS.ARCHI_RESULTAT]: [ECRANS.ARCHI_RESULTAT, 'interface-jeu-archi'],
    [ECRANS.HISTOIRE_MAP]: [ECRANS.HISTOIRE_MAP],
    [ECRANS.HISTOIRE_CUTSCENE]: [ECRANS.HISTOIRE_MAP],
    [ECRANS.HISTOIRE_JOURNAL]: [ECRANS.HISTOIRE_MAP],
    [ECRANS.HISTOIRE_FIN]: [ECRANS.HISTOIRE_MAP],
};

export const FRAGMENTS_COOP = ['interface-jeu-coop', ECRANS.PAUSE_COOP, ECRANS.GAME_OVER_COOP];
export const FRAGMENTS_ARCHI = [
    ECRANS.ARCHI_SELECTION,
    ECRANS.ARCHI_RESULTAT,
    'interface-jeu-archi',
];
