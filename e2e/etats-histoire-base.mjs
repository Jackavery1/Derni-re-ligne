/** Séquence des 16 mondes principaux avant la finale (hors secrets). */
export const MONDES_CAMPAGNE_PRINCIPALE = [
    'monde_prologue',
    'monde_lave',
    'monde_rouille',
    'monde_boss_1',
    'monde_ocean',
    'monde_foret',
    'monde_glace',
    'monde_boss_2',
    'monde_desert',
    'monde_eclipse',
    'monde_cyber',
    'monde_boss_3',
    'monde_fuochi',
    'monde_cosmos',
    'monde_vide',
    'monde_boss_4',
];

/** Mondes secrets menant à la fin secrète (après campagne principale). */
export const MONDES_SECRETS_FIN_SECRETE = ['monde_miroir', 'monde_trame', 'monde_finale'];

/** État histoire minimal pour débloquer le mode libre (Chapitre I complété). */
export const ETAT_DEBLOCAGE_MONDE_LIBRE = {
    chapitreActuel: 'chapitre_2',
    mondesCompletes: ['monde_prologue', 'monde_lave', 'monde_rouille'],
    bossVaincus: ['brasier'],
    journauxTrouves: [],
    mondesCachesDebloques: [],
    conditionsMiroir: { bossArchivisteVaincu: false, tetrisTriplesCyber: 0 },
    conditionsTrame: {
        miroirComplete: false,
        tousJournauxTrouves: false,
        tousBossSansContinue: true,
        actionDistorsionFaite: false,
    },
    conditionsParadoxe: { finSecreteObtenue: false, topsVolontairesPrologue: 0 },
    finObtenue: null,
    toutesFinObtenues: [],
    nbContinuesUtilises: 0,
    enModeHistoire: false,
    mondesDejaMontres: [],
    laboDecouvert: false,
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};

/** État E2E meta : débloque Oracle, Coop, Codex, Architecte (cohérent avec boss/journaux). */
export const ETAT_DEBLOCAGE_META_RAPIDE = {
    ...ETAT_DEBLOCAGE_MONDE_LIBRE,
    chapitreActuel: 'chapitre_5',
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'],
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_desert',
        'monde_eclipse',
        'monde_cyber',
        'monde_fuochi',
        'monde_cosmos',
        'monde_vide',
    ],
    journauxTrouves: [
        'journal_1',
        'journal_2',
        'journal_3',
        'journal_4',
        'journal_5',
        'journal_6',
        'journal_7',
        'journal_8',
        'journal_9',
    ],
    mondesCachesDebloques: ['monde_miroir', 'monde_trame'],
    laboDecouvert: true,
};

/** État histoire minimal pour jouer le boss Brasier (monde_boss_1). */
export const ETAT_HISTOIRE_BOSS_BRASIER = {
    chapitreActuel: 'chapitre_1',
    mondesCompletes: ['monde_prologue', 'monde_lave', 'monde_rouille'],
    bossVaincus: [],
    journauxTrouves: [],
    mondesCachesDebloques: [],
    conditionsMiroir: { bossArchivisteVaincu: false, tetrisTriplesCyber: 0 },
    conditionsTrame: {
        miroirComplete: false,
        tousJournauxTrouves: false,
        tousBossSansContinue: true,
        actionDistorsionFaite: false,
    },
    conditionsParadoxe: { finSecreteObtenue: false, topsVolontairesPrologue: 0 },
    finObtenue: null,
    toutesFinObtenues: [],
    nbContinuesUtilises: 0,
    enModeHistoire: false,
    mondesDejaMontres: ['monde_boss_1'],
    laboDecouvert: false,
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};

/** État minimal pour jouer le boss Sentinelle (monde_boss_2). */
export const ETAT_AVANT_BOSS_SENTINELLE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    chapitreActuel: 'chapitre_3',
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
    ],
    bossVaincus: ['brasier'],
    mondesDejaMontres: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_boss_2',
    ],
};
