import {
    DIFFICULTE_MONDES,
    PALIERS_VITESSE_MS,
    VITESSE_PLANCHER_MS,
} from '../data/difficulte-mondes.js';
import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { SEUILS_COMPLETION } from './histoire-mondes.js';
import { store } from './store-core.js';
import { logger } from './logger.js';
import { emettre, ecouter } from './bus-jeu.js';

const DUREE_VICTOIRE_OBJECTIF_MS = 2200;

function _creerEtatVide() {
    return {
        actif: false,
        mondeId: null,
        palierCourant: 5,
        lignesObjectif: 10,
        lignesEffacees: 0,
        vaguesAppliquees: /** @type {number[]} */ ([]),
        phasesBossAppliquees: /** @type {number[]} */ ([]),
        suiviEtoiles: {
            topout: false,
            comboMax: 0,
            tetris: 0,
            triples: 0,
            pieces: 0,
        },
        palierEnAttente: /** @type {number | null} */ (null),
        zen: false,
        boss: false,
        victoireDeclenchee: false,
        ecouteurSurtension: /** @type {(() => void) | null} */ (null),
        config: null,
    };
}

/** @param {string} mondeId */
function _configPourMonde(mondeId) {
    const cfg = DIFFICULTE_MONDES[mondeId];
    if (cfg) return cfg;
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    const objectif = monde ? (SEUILS_COMPLETION[monde.biomeId] ?? 10) : 10;
    return {
        objectifLignes: objectif,
        profilVitesse: [{ a: 0, palier: 5 }],
        etoile2: null,
        etoile3: null,
    };
}

/** @param {string} mondeId */
export function demarrerSuiviMonde(mondeId) {
    const config = _configPourMonde(mondeId);
    const d = _creerEtatVide();
    d.actif = true;
    d.mondeId = mondeId;
    d.config = config;
    d.zen = !!config.zen;
    d.boss = !!config.boss;
    d.lignesObjectif = config.objectifLignes ?? 10;

    if (config.boss && config.phasePaliers?.length) {
        d.palierCourant = config.phasePaliers[0];
        d.phasesBossAppliquees.push(0);
    } else if (config.profilVitesse?.length) {
        d.palierCourant = config.profilVitesse[0].palier;
        d.vaguesAppliquees.push(0);
    }

    store.histoire.difficulte = d;
    store.multGraviteMusique = 1.0;
    store.surtensionActive = false;

    logger.debug('[difficulte] demarrerSuiviMonde', mondeId, 'P', d.palierCourant);
}

export function arreterSuiviMonde() {
    if (store.histoire.difficulte?.ecouteurSurtension) {
        store.histoire.difficulte.ecouteurSurtension();
        store.histoire.difficulte.ecouteurSurtension = null;
    }
    store.histoire.difficulte = null;
}

export function suiviDifficulteActif() {
    return store.histoire.actif && (store.histoire.difficulte?.actif ?? false);
}

export function victoireObjectifDeclenchee() {
    return store.histoire.difficulte?.victoireDeclenchee ?? false;
}

export function vitesseHistoireMs() {
    const d = store.histoire.difficulte;
    if (!d?.actif) return PALIERS_VITESSE_MS[5];
    const palierMs = PALIERS_VITESSE_MS[d.palierCourant] ?? PALIERS_VITESSE_MS[5];
    const mult = store.multGraviteMusique || 1;
    const effective = Math.max(VITESSE_PLANCHER_MS, palierMs / mult);
    logger.debug('[difficulte] vitesse effective ms', effective, 'palier', d.palierCourant);
    return effective;
}

function _planifierPalier(nouveauPalier) {
    const d = store.histoire.difficulte;
    if (!d?.actif || d.palierCourant === nouveauPalier) return;

    const appliquer = () => {
        const palierAvant = d.palierCourant;
        d.palierEnAttente = nouveauPalier;
        emettre('difficulte:vague', {
            palierAvant,
            palierApres: nouveauPalier,
            montee: nouveauPalier > palierAvant,
        });
        logger.debug('[difficulte] vague planifiee', palierAvant, '→', nouveauPalier);
    };

    if (store.surtensionActive) {
        if (d.ecouteurSurtension) {
            appliquer();
            return;
        }
        d.ecouteurSurtension = ecouter('musique:section', () => {
            d.ecouteurSurtension?.();
            d.ecouteurSurtension = null;
            appliquer();
        });
        return;
    }

    appliquer();
}

export function consommerPalierEnAttentePosePiece() {
    const d = store.histoire.difficulte;
    if (!d?.actif || d.palierEnAttente === null) return;

    d.palierCourant = d.palierEnAttente;
    d.palierEnAttente = null;
}

export function enregistrerPosePiece() {
    const d = store.histoire.difficulte;
    if (!d?.actif) return;
    d.suiviEtoiles.pieces++;
    consommerPalierEnAttentePosePiece();
}

/**
 * @param {{ nbLignes?: number, estTetris?: boolean, combo?: number }} params
 */
export function enregistrerProgression(params) {
    const d = store.histoire.difficulte;
    if (!d?.actif || d.victoireDeclenchee) return;

    const nbLignes = params.nbLignes ?? 0;
    const estTetris = params.estTetris ?? false;
    const combo = params.combo ?? 0;

    if (nbLignes <= 0) return;

    d.lignesEffacees += nbLignes;
    if (combo > d.suiviEtoiles.comboMax) d.suiviEtoiles.comboMax = combo;
    if (estTetris) d.suiviEtoiles.tetris++;

    const config = d.config;
    if (!config || config.boss) return;

    const fraction = d.lignesObjectif > 0 ? d.lignesEffacees / d.lignesObjectif : 0;
    const vagues = config.profilVitesse ?? [];

    for (let i = 0; i < vagues.length; i++) {
        if (i === 0) continue;
        const vague = vagues[i];
        if (fraction >= vague.a && !d.vaguesAppliquees.includes(i)) {
            d.vaguesAppliquees.push(i);
            _planifierPalier(vague.palier);
        }
    }

    if (!d.zen && d.lignesEffacees >= d.lignesObjectif) {
        d.victoireDeclenchee = true;
        emettre('monde:objectif-atteint', { mondeId: d.mondeId });
        setTimeout(() => {
            import('./actions-jeu.js').then(({ obtenirActions }) => {
                obtenirActions().terminerPartie?.(true);
            });
        }, DUREE_VICTOIRE_OBJECTIF_MS);
    }
}

/** @param {string} bossId @param {number} phaseIndex */
export function notifierPhaseBoss(bossId, phaseIndex) {
    const d = store.histoire.difficulte;
    if (!d?.actif || !d.boss) return;

    const paliers = d.config?.phasePaliers ?? [];
    if (phaseIndex <= 0 || phaseIndex >= paliers.length) return;
    if (d.phasesBossAppliquees.includes(phaseIndex)) return;

    d.phasesBossAppliquees.push(phaseIndex);
    _planifierPalier(paliers[phaseIndex]);
    emettre('boss:phase', { bossId, phase: phaseIndex + 1 });
    logger.debug('[difficulte] boss:phase', bossId, phaseIndex + 1);
}

/** @param {string} bossId @param {number} pctRestant */
export function notifierPhaseBossParPv(bossId, pctRestant) {
    const d = store.histoire.difficulte;
    if (!d?.actif || !d.boss) return;
    if (pctRestant <= 25) notifierPhaseBoss(bossId, 2);
    else if (pctRestant <= 50) notifierPhaseBoss(bossId, 1);
}

export function enregistrerTopOut() {
    const d = store.histoire.difficulte;
    if (!d?.actif) return;
    d.suiviEtoiles.topout = true;
}

/**
 * @param {string} mondeId
 * @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} [etatHist]
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

    const etoile2 = config?.etoile2 ? _evaluerDefi(config.etoile2, suivi, hist, mondeId) : false;
    const etoile3 = config?.etoile3 ? _evaluerDefi(config.etoile3, suivi, hist, mondeId) : false;

    return [true, etoile2, etoile3];
}

/** @param {object} def @param {typeof store.histoire.difficulte.suiviEtoiles} suivi @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE | null} hist @param {string} mondeId */
function _evaluerDefi(def, suivi, hist, mondeId) {
    switch (def.type) {
        case 'sans_topout':
            return !suivi.topout;
        case 'sans_continue':
            return (hist?.continuesParBoss?.[mondeId] ?? 0) === 0;
        case 'tetris':
            return suivi.tetris >= (def.valeur ?? 1);
        case 'tetris_triple':
            return (hist?.conditionsMiroir?.tetrisTriplesCyber ?? 0) >= (def.valeur ?? 3);
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

/** @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist @param {string} mondeId @param {[boolean, boolean, boolean]} etoiles */
export function fusionnerEtoilesPersistees(etatHist, mondeId, etoiles) {
    if (!etatHist.etoilesParMonde) etatHist.etoilesParMonde = {};
    const ex = etatHist.etoilesParMonde[mondeId] ?? [false, false, false];
    etatHist.etoilesParMonde[mondeId] = [
        ex[0] || etoiles[0],
        ex[1] || etoiles[1],
        ex[2] || etoiles[2],
    ];
}

/** @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist @param {string} mondeId */
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
            return `Attendez ${def.valeur ?? 30} s sans effacer`;
        case 'tops_volontaires':
            return `Top-out volontaire ×${def.valeur ?? 3}`;
        default:
            return '';
    }
}

/** @param {ReturnType<typeof _configPourMonde>} config @param {{ nom?: string, pvMax?: number }} [bossInfo] */
export function libelleObjectifPrincipal(config, bossInfo) {
    if (config.boss && bossInfo) {
        return `Videz la jauge — ${bossInfo.pvMax ?? '?'} PV`;
    }
    return `Effacez ${config.objectifLignes ?? 0} lignes`;
}

export function estMondeZenActif() {
    return store.histoire.difficulte?.zen ?? false;
}

export function obtenirSuiviDifficulte() {
    return store.histoire.difficulte;
}
