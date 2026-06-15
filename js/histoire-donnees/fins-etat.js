// Fins et etat initial histoire
export const FINS = {
    fin_normale: {
        id: 'fin_normale',
        titre: 'FIN : LE CYCLE',
        texte: [
            'La Distorsion est vaisseau.',
            'La Trame tient. VERA est libre.',
            "Dans mille ans, peut-être, quelqu'un d'autre devra refaire le chemin.",
            'Robo pose la derniere piece. Le plateau est vide.',
            "Pour la premiere fois, il comprend que c'etait ça, le but.",
        ],
    },
    fin_vraie: {
        id: 'fin_vraie',
        titre: "FIN : L'HARMONIE",
        condition: { mondeCache: 'miroir' },
        texte: [
            "Robo n'a pas detruit La Distorsion.",
            'Il lui a tendu la main.',
            "La completion et l'incompletude forment un nouveau type de Trame.",
            'Plus fragile. Plus honnête.',
            'VERA sourit pour la premiere fois depuis longtemps.',
        ],
    },
    fin_secrete: {
        id: 'fin_secrete',
        titre: 'FIN : LA LIGNE PARFAITE',
        condition: { mondeCache: 'trame' },
        texte: [
            'La ligne incomplete de VERA.',
            'Robo la complete. Doucement. Sans hâte.',
            "La Distorsion ressent quelque chose qu'elle n'a jamais ressenti :",
            "la satisfaction d'une ligne effacee.",
            'Elle pleure. En binaire. 0 et 1.',
        ],
    },
};

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
