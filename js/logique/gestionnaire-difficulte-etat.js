import { DIFFICULTE_MONDES } from '../io/difficulte-mondes-chargement.js';
import { SEQUENCE_HISTOIRE } from '../histoire-donnees.js';
import { SEUILS_COMPLETION } from '../histoire/histoire-mondes.js';
import { store } from '../etat/store-jeu.js';
import { logger } from '../io/logger.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';

export function creerEtatDifficulteVide() {
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
export function configDifficultePourMonde(mondeId) {
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
    const config = configDifficultePourMonde(mondeId);
    const d = creerEtatDifficulteVide();
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
    return modeHistoireEnCours() && (store.histoire.difficulte?.actif ?? false);
}

export function victoireObjectifDeclenchee() {
    return store.histoire.difficulte?.victoireDeclenchee ?? false;
}

export function estMondeZenActif() {
    return store.histoire.difficulte?.zen ?? false;
}

export function obtenirSuiviDifficulte() {
    return store.histoire.difficulte;
}
