// Etat initial histoire (runtime) — donnees narratives dans data/histoire-donnees.json

/**
 * @typedef {Object} EtatHistoire
 * @property {string} chapitreActuel
 * @property {string[]} mondesCompletes
 * @property {string[]} bossVaincus
 * @property {string[]} journauxTrouves
 * @property {string[]} mondesCachesDebloques
 * @property {{ bossArchivisteVaincu: boolean, tetrisTriplesCyber: number }} conditionsMiroir
 * @property {{ miroirComplete: boolean, tousJournauxTrouves: boolean, tousBossSansContinue: boolean, actionDistorsionFaite: boolean }} conditionsTrame
 * @property {{ finSecreteObtenue: boolean, topsVolontairesPrologue: number }} conditionsParadoxe
 * @property {string | null} finObtenue
 * @property {string[]} toutesFinObtenues
 * @property {number} nbContinuesUtilises
 * @property {boolean} enModeHistoire
 * @property {string[]} mondesDejaMontres
 * @property {boolean} laboDecouvert
 * @property {string[]} fragmentsVusIds
 * @property {string[]} interludesVusIds
 * @property {boolean} outroVue
 * @property {Record<string, [boolean, boolean, boolean]>} etoilesParMonde
 * @property {boolean} continueGratuitDistorsionUtilise
 * @property {Record<string, number>} continuesParBoss
 * @property {{ blocksRouillesMax: number, lignesEclipseBasseMax: number, lignesVideMax: number, precisionMiroirMax: number, meilleurTimerBossMs: number }} prouessesHistoire
 */

/** @type {EtatHistoire} */
export const ETAT_HISTOIRE_VIDE = {
    chapitreActuel: 'prologue',
    mondesCompletes: [],
    bossVaincus: [],
    journauxTrouves: [],
    mondesCachesDebloques: [],
    conditionsMiroir: {
        bossArchivisteVaincu: false,
        tetrisTriplesCyber: 0,
    },
    conditionsTrame: {
        miroirComplete: false,
        tousJournauxTrouves: false,
        tousBossSansContinue: true,
        actionDistorsionFaite: false,
    },
    conditionsParadoxe: {
        finSecreteObtenue: false,
        topsVolontairesPrologue: 0,
    },
    finObtenue: null,
    toutesFinObtenues: [],
    nbContinuesUtilises: 0,
    enModeHistoire: false,
    mondesDejaMontres: [],
    laboDecouvert: false,
    fragmentsVusIds: [],
    interludesVusIds: [],
    outroVue: false,
    etoilesParMonde: {},
    continuesParBoss: {},
    continueGratuitDistorsionUtilise: false,
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};
