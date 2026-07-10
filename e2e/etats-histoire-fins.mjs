import { ETAT_HISTOIRE_BOSS_BRASIER } from './etats-histoire-base.mjs';

/** État prêt pour déclencher la fin secrète (Trame complétée + conditions). */
export const ETAT_FIN_SECRETE_PRET = {
    chapitreActuel: 'chapitre_2',
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
        'monde_miroir',
        'monde_trame',
        'monde_finale',
    ],
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'],
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
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
    conditionsTrame: {
        miroirComplete: true,
        tousJournauxTrouves: true,
        tousBossSansContinue: true,
        actionDistorsionFaite: true,
    },
    conditionsParadoxe: { finSecreteObtenue: false, topsVolontairesPrologue: 0 },
    finObtenue: null,
    toutesFinObtenues: [],
    nbContinuesUtilises: 0,
    enModeHistoire: false,
    mondesDejaMontres: ['monde_boss_1', 'monde_trame'],
    laboDecouvert: true,
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};

/** État à une victoire de la fin secrète (Trame OK, finale non battue). */
export const ETAT_AVANT_FIN_SECRETE = {
    ...ETAT_FIN_SECRETE_PRET,
    mondesCompletes: ETAT_FIN_SECRETE_PRET.mondesCompletes.filter((id) => id !== 'monde_finale'),
    bossVaincus: ETAT_FIN_SECRETE_PRET.bossVaincus.filter((id) => id !== 'distorsion'),
};

/** État prologue complété, Inferno jouable (enchaînement campagne). */
export const ETAT_INFERNO_PRET = {
    chapitreActuel: 'prologue',
    mondesCompletes: ['monde_prologue'],
    bossVaincus: [],
    journauxTrouves: [],
    mondesCachesDebloques: [],
    conditionsMiroir: { bossArchivisteVaincu: false, tetrisTriplesCyber: 0 },
    conditionsTrame: {
        miroirComplete: false,
        tousJournauxTrouves: false,
        tousBossSansContinue: false,
        actionDistorsionFaite: false,
    },
    conditionsParadoxe: { finSecreteObtenue: false, topsVolontairesPrologue: 0 },
    finObtenue: null,
    toutesFinObtenues: [],
    nbContinuesUtilises: 0,
    enModeHistoire: false,
    mondesDejaMontres: ['monde_prologue', 'monde_lave'],
    laboDecouvert: false,
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};

/** État prêt pour déclencher la fin vraie (Miroir complété, sans Trame). */
export const ETAT_FIN_VRAIE_PRET = {
    chapitreActuel: 'chapitre_2',
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
        'monde_miroir',
        'monde_finale',
    ],
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'],
    journauxTrouves: ['journal_1', 'journal_2', 'journal_3', 'journal_4', 'journal_5', 'journal_6'],
    mondesCachesDebloques: ['monde_miroir'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
    conditionsTrame: {
        miroirComplete: true,
        tousJournauxTrouves: false,
        tousBossSansContinue: true,
        actionDistorsionFaite: false,
    },
    conditionsParadoxe: { finSecreteObtenue: false, topsVolontairesPrologue: 0 },
    finObtenue: null,
    toutesFinObtenues: [],
    nbContinuesUtilises: 0,
    enModeHistoire: false,
    mondesDejaMontres: ['monde_boss_1', 'monde_miroir'],
    laboDecouvert: true,
    fragmentsVusIds: [],
    interludesVusIds: [],
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};

/** État pour tester fragment VERA océan (première complétion). */
export const ETAT_OCEAN_FRAGMENT_PRET = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCompletes: ['monde_prologue', 'monde_lave', 'monde_rouille'],
    fragmentsVusIds: [],
};

/** État pour tester fragment VERA forêt (première complétion). */
export const ETAT_FORET_FRAGMENT_PRET = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_boss_1',
        'monde_ocean',
    ],
    bossVaincus: ['brasier'],
    fragmentsVusIds: ['apres_prologue', 'apres_lave', 'apres_rouille', 'apres_ocean'],
};

/** État pour tester fragment VERA glace (première complétion). */
export const ETAT_GLACE_FRAGMENT_PRET = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_boss_1',
        'monde_ocean',
        'monde_foret',
        'monde_boss_2',
    ],
    bossVaincus: ['brasier', 'sentinelle'],
    fragmentsVusIds: [
        'apres_prologue',
        'apres_lave',
        'apres_rouille',
        'apres_ocean',
        'apres_foret',
    ],
};

/** État juste avant victoire du monde désert (enchaînement vers éclipse). */
export const ETAT_AVANT_DESERT = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    chapitreActuel: 'chapitre_3',
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_boss_2',
    ],
    bossVaincus: ['brasier', 'sentinelle'],
    fragmentsVusIds: ['apres_prologue', 'apres_ocean', 'apres_foret', 'apres_glace'],
    interludesVusIds: [],
    mondesDejaMontres: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_boss_2',
        'monde_desert',
    ],
};

/** État pour tester découverte labo cyber + journal 7. */
export const ETAT_CYBER_LABO_PRET = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_desert',
        'monde_eclipse',
    ],
    conditionsMiroir: { bossArchivisteVaincu: false, tetrisTriplesCyber: 3 },
    laboDecouvert: false,
    journauxTrouves: ['journal_1', 'journal_2', 'journal_3', 'journal_4', 'journal_5', 'journal_6'],
    fragmentsVusIds: ['apres_ocean', 'apres_foret', 'apres_glace', 'apres_desert', 'apres_eclipse'],
    interludesVusIds: ['interlude_gardiens', 'interlude_elle'],
};

/** État minimal pour jouer le boss Archiviste (monde_boss_3). */
export const ETAT_AVANT_BOSS_ARCHIVISTE = {
    ...ETAT_CYBER_LABO_PRET,
    chapitreActuel: 'chapitre_4',
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
    ],
    bossVaincus: ['brasier', 'sentinelle'],
    laboDecouvert: true,
    journauxTrouves: [
        'journal_1',
        'journal_2',
        'journal_3',
        'journal_4',
        'journal_5',
        'journal_6',
        'journal_7',
    ],
    mondesDejaMontres: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_desert',
        'monde_eclipse',
        'monde_cyber',
        'monde_boss_3',
    ],
};

/** État minimal pour jouer le boss Avant-Garde (monde_boss_4). */
export const ETAT_AVANT_BOSS_AVANTGARDE = {
    ...ETAT_AVANT_BOSS_ARCHIVISTE,
    chapitreActuel: 'chapitre_5',
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
        'monde_boss_3',
        'monde_fuochi',
        'monde_cosmos',
        'monde_vide',
    ],
    bossVaincus: ['brasier', 'sentinelle', 'archiviste'],
    mondesDejaMontres: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_desert',
        'monde_eclipse',
        'monde_cyber',
        'monde_boss_3',
        'monde_fuochi',
        'monde_cosmos',
        'monde_vide',
        'monde_boss_4',
    ],
};

/** État avec le monde Paradoxe débloqué (fin secrète + tops volontaires prologue). */
export const ETAT_PARADOXE_DEBLOQUE = {
    ...ETAT_FIN_SECRETE_PRET,
    mondesCachesDebloques: [...ETAT_FIN_SECRETE_PRET.mondesCachesDebloques, 'monde_paradoxe'],
    mondesDejaMontres: [...ETAT_FIN_SECRETE_PRET.mondesDejaMontres, 'monde_paradoxe'],
    conditionsParadoxe: { finSecreteObtenue: true, topsVolontairesPrologue: 3 },
    finObtenue: 'fin_secrete',
    toutesFinObtenues: ['fin_secrete'],
};

/** État prêt pour victoire finale → fin vraie (Miroir OK, sans Trame). */
export const ETAT_AVANT_FIN_VRAIE = {
    ...ETAT_FIN_VRAIE_PRET,
    mondesCompletes: ETAT_FIN_VRAIE_PRET.mondesCompletes.filter((id) => id !== 'monde_finale'),
    bossVaincus: ETAT_FIN_VRAIE_PRET.bossVaincus.filter((id) => id !== 'distorsion'),
};

/** État avant victoire Distorsion → fin normale (Miroir non complété). */
export const ETAT_AVANT_FIN_NORMALE = {
    ...ETAT_AVANT_BOSS_AVANTGARDE,
    mondesCompletes: [...ETAT_AVANT_BOSS_AVANTGARDE.mondesCompletes, 'monde_boss_4'],
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde'],
    mondesCachesDebloques: ['monde_miroir'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 0 },
    conditionsTrame: {
        miroirComplete: false,
        tousJournauxTrouves: false,
        tousBossSansContinue: true,
        actionDistorsionFaite: false,
    },
    mondesDejaMontres: [...ETAT_AVANT_BOSS_AVANTGARDE.mondesDejaMontres, 'monde_finale'],
};

/** État prêt pour déclencher la fin normale (Distorsion vaincue, sans Miroir). */
export const ETAT_FIN_NORMALE_PRET = {
    ...ETAT_AVANT_FIN_NORMALE,
    mondesCompletes: [...ETAT_AVANT_FIN_NORMALE.mondesCompletes, 'monde_finale'],
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'],
};

/** Première visite Cosmos — cutscene d'entrée observatoire. */
export const ETAT_ENTREE_COSMOS = {
    ...ETAT_FIN_VRAIE_PRET,
    mondesCompletes: ETAT_FIN_VRAIE_PRET.mondesCompletes.filter(
        (id) => !['monde_cosmos', 'monde_vide', 'monde_miroir', 'monde_finale'].includes(id)
    ),
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde'],
    mondesDejaMontres: ['monde_prologue', 'monde_lave', 'monde_fuochi'],
};

/** Première visite Vide — cutscene d'entrée vide_errance. */
export const ETAT_ENTREE_VIDE = {
    ...ETAT_ENTREE_COSMOS,
    mondesCompletes: [...ETAT_ENTREE_COSMOS.mondesCompletes, 'monde_cosmos'],
    mondesDejaMontres: [...ETAT_ENTREE_COSMOS.mondesDejaMontres, 'monde_cosmos'],
};

/** Première visite Miroir — cutscene d'entrée miroir. */
export const ETAT_ENTREE_MIROIR = {
    ...ETAT_AVANT_BOSS_ARCHIVISTE,
    mondesCompletes: [...ETAT_AVANT_BOSS_ARCHIVISTE.mondesCompletes, 'monde_boss_3'],
    bossVaincus: ['brasier', 'sentinelle', 'archiviste'],
    laboDecouvert: true,
    journauxTrouves: [
        'journal_1',
        'journal_2',
        'journal_3',
        'journal_4',
        'journal_5',
        'journal_6',
        'journal_7',
    ],
    mondesCachesDebloques: ['monde_miroir'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
    mondesDejaMontres: [...ETAT_AVANT_BOSS_ARCHIVISTE.mondesCompletes, 'monde_boss_3'],
};

/** Première visite Trame — cutscene d'entrée trame. */
export const ETAT_ENTREE_TRAME = {
    ...ETAT_FIN_SECRETE_PRET,
    mondesCompletes: ETAT_FIN_SECRETE_PRET.mondesCompletes.filter(
        (id) => !['monde_trame', 'monde_finale'].includes(id)
    ),
    mondesCachesDebloques: ['monde_miroir', 'monde_trame'],
    mondesDejaMontres: ['monde_boss_1', 'monde_miroir'],
};
