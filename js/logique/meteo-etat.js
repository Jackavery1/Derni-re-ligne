import { CONFIG } from '../config/config-jeu.js';
import { METEO_BIOMES } from '../config/contenu-jeu.js';
import { etat } from '../etat/store-jeu.js';

export const ETATS_METEO = { REPOS: 'repos', ALERTE: 'alerte', ACTIF: 'actif' };

export const meteo = {
    etat: ETATS_METEO.REPOS,
    timerProchain: 0,
    timerAlerte: 0,
    timerActif: 0,
    evenementActuel: null,
    facteurVitesse: 1,
    controleInverse: false,
    masquerPlateau: false,
    masquerPiece: false,
    decalageForce: 0,
    timeoutAlerteTexte: null,
    timeoutBanniere: null,
};

export let depsMeteo = {};

/** @param {object} dependances */
export function configurerMeteo(dependances) {
    depsMeteo = dependances;
}

/** @param {number} [niveau] */
export function intervalleProchainMeteoMs(niveau = 1) {
    let minSec = niveau <= 5 ? 120 : 90;
    let maxSec = niveau <= 5 ? 180 : 150;
    if (niveau >= 10) {
        minSec += 30;
        maxSec += 45;
    }
    return (Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec) * 1000;
}

/** @param {number} [niveau] */
export function nombreCellulesBarrageMeteo(niveau = 1) {
    return niveau <= 8 ? 3 : 6;
}

export function tirerProchainMeteo() {
    return intervalleProchainMeteoMs(etat.niveau ?? 1);
}

export function effacerTimeoutsMeteo() {
    if (meteo.timeoutAlerteTexte) {
        clearTimeout(meteo.timeoutAlerteTexte);
        meteo.timeoutAlerteTexte = null;
    }
    if (meteo.timeoutBanniere) {
        clearTimeout(meteo.timeoutBanniere);
        meteo.timeoutBanniere = null;
    }
}

export { CONFIG, METEO_BIOMES };
