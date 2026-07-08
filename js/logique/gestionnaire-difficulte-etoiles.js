import { DIFFICULTE_MONDES } from '../io/difficulte-mondes-chargement.js';
import { store } from '../etat/store-jeu.js';

/**
 * @param {string} mondeId
 * @param {import('../histoire-donnees.js').ETAT_HISTOIRE_VIDE} [etatHist]
 * @returns {[boolean, boolean, boolean]}
 */
export function calculerEtoiles(mondeId, etatHist) {
    const d = store.histoire.difficulte;
    const config = DIFFICULTE_MONDES[mondeId] ?? d?.config;
    const suivi = d?.suiviEtoiles ?? {
        topout: true,
        comboMax: 0,
        tetris: 0,
        pieces: 999,
        triples: 0,
    };
    const hist = etatHist ?? store.histoire.etat;

    const etoile2 = config?.etoile2
        ? evaluerDefiEtoile(config.etoile2, suivi, hist, mondeId)
        : false;
    const etoile3 = config?.etoile3
        ? evaluerDefiEtoile(config.etoile3, suivi, hist, mondeId)
        : false;

    return [true, etoile2, etoile3];
}

/** @param {object} def @param {typeof store.histoire.difficulte.suiviEtoiles} suivi @param {import('../histoire-donnees.js').ETAT_HISTOIRE_VIDE | null} hist @param {string} mondeId */
function evaluerDefiEtoile(def, suivi, hist, mondeId) {
    switch (def.type) {
        case 'sans_topout':
            return !suivi.topout;
        case 'sans_continue':
            return (hist?.continuesParBoss?.[mondeId] ?? 0) === 0;
        case 'tetris':
            return suivi.tetris >= (def.valeur ?? 1);
        case 'tetris_triple':
            return suivi.triples >= (def.valeur ?? 3);
        case 'combo':
            return suivi.comboMax >= (def.valeur ?? 2);
        case 'pieces_max':
            return suivi.pieces <= (def.valeur ?? 999);
        case 'tops_volontaires':
            return (hist?.conditionsParadoxe?.topsVolontairesPrologue ?? 0) >= (def.valeur ?? 3);
        case 'attente_sans_effacer':
            return hist?.conditionsTrame?.actionDistorsionFaite === true;
        default:
            return false;
    }
}

/** @param {import('../histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist @param {string} mondeId @param {[boolean, boolean, boolean]} etoiles */
export function fusionnerEtoilesPersistees(etatHist, mondeId, etoiles) {
    if (!etatHist.etoilesParMonde) etatHist.etoilesParMonde = {};
    const ex = etatHist.etoilesParMonde[mondeId] ?? [false, false, false];
    etatHist.etoilesParMonde[mondeId] = [
        ex[0] || etoiles[0],
        ex[1] || etoiles[1],
        ex[2] || etoiles[2],
    ];
}

/** @param {import('../histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist @param {string} mondeId */
export function obtenirEtoilesPersistees(etatHist, mondeId) {
    return etatHist?.etoilesParMonde?.[mondeId] ?? [false, false, false];
}

/** @param {object | null | undefined} def */
export function libelleEtoile(def) {
    if (!def) return '';
    switch (def.type) {
        case 'sans_topout':
            return 'Terminez sans top-out';
        case 'sans_continue':
            return 'Vainquez sans échec';
        case 'tetris':
            return `Réussissez ${def.valeur ?? 1} Tetris`;
        case 'tetris_triple':
            return `Réussissez ${def.valeur ?? 3} Tetris triples`;
        case 'combo':
            return `Réussissez un combo ×${def.valeur ?? 2}`;
        case 'pieces_max':
            return `Terminez en ≤ ${def.valeur ?? 0} pièces`;
        case 'attente_sans_effacer':
            return `Remplissez ≥50 % du plateau puis attendez ${def.valeur ?? 30} s sans effacer`;
        case 'tops_volontaires':
            return `Top-out volontaire ×${def.valeur ?? 3}`;
        default:
            return '';
    }
}

/** @param {object} config @param {{ nom?: string, pvMax?: number }} [bossInfo] */
export function libelleObjectifPrincipal(config, bossInfo) {
    if (config.boss && bossInfo) {
        return `Videz la jauge — ${bossInfo.pvMax ?? '?'} PV`;
    }
    return `Effacez ${config.objectifLignes ?? 0} lignes`;
}
