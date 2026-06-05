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
    HISTOIRE_BOSS_DEFAITE: 'ecran-histoire-boss-defaite',
    HISTOIRE_FIN: 'ecran-histoire-fin',
};

/** Ordre de chargement des fragments HTML (source unique pour charger-ecrans et SW). */
export const LISTE_ECRANS_CHARGEMENT = [
    ECRANS.TITRE,
    ECRANS.ACHIEVEMENTS,
    ECRANS.PROFIL,
    ECRANS.CODEX,
    ECRANS.SELECTION,
    ECRANS.OPTIONS,
    ECRANS.PAUSE,
    ECRANS.GAME_OVER,
    'overlays',
    'interface-jeu',
    'controles',
    'interface-jeu-coop',
    ECRANS.PAUSE_COOP,
    ECRANS.GAME_OVER_COOP,
    ECRANS.ARCHI_SELECTION,
    ECRANS.ARCHI_RESULTAT,
    'interface-jeu-archi',
    ECRANS.HISTOIRE_MAP,
];
