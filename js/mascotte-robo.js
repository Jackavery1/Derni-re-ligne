import { CONFIG } from './config-jeu.js';
import { etat } from './store-jeu.js';
import { majStatsReactionRobo } from './achievements.js';
import { definirHumeurRobo, convertirHumeurVersCanvas } from './rendu-robo.js';

const DUREES_HUMEUR = {
    content: 2200,
    heureux: 2800,
    excite: 3200,
    'excite-plus': 3800,
    grimace: 700,
    emerveille: 2600,
    inquiet: 1800,
    determine: 2000,
    triomphal: 2000,
    stresse: 2400,
    euphorique: 3500,
    alerte: 2200,
};

const SEUIL_LIGNES_CRITIQUE = 5;
let _timerRetourNeutre = null;
let _humeurPersistante = false;
let _dernierStress = 0;

/**
 * @param {number} nbLignes
 * @param {number} [combo]
 */
export function determinerHumeurLignes(nbLignes, combo = 0) {
    if (nbLignes <= 0) return null;
    if (combo >= 3) return 'excite-plus';
    if (nbLignes >= 4) return 'excite';
    if (nbLignes >= 2) return 'heureux';
    return 'content';
}

/** @param {number} nbLignes @param {number} [combo] */
export function reagirRoboAuxLignes(nbLignes, combo = 0) {
    const humeur = determinerHumeurLignes(nbLignes, combo);
    if (humeur) appliquerHumeurMascotte(humeur);
}

/** @param {{ dureeRetour?: number, persistant?: boolean }} [options] */
export function appliquerHumeurMascotte(humeur, options = {}) {
    majStatsReactionRobo(humeur);
    etat.humeur = humeur;
    _humeurPersistante = options.persistant === true;

    definirHumeurRobo(convertirHumeurVersCanvas(humeur));

    if (_timerRetourNeutre !== null) {
        clearTimeout(_timerRetourNeutre);
        _timerRetourNeutre = null;
    }

    if (!_humeurPersistante && humeur !== 'neutre' && humeur !== 'triste') {
        const duree = options.dureeRetour ?? DUREES_HUMEUR[humeur] ?? 2500;
        _timerRetourNeutre = setTimeout(() => appliquerHumeurMascotte('neutre'), duree);
    }
}

/** @param {string} humeur @param {{ dureeRetour?: number, persistant?: boolean }} [options] */
export function changerHumeur(humeur, options) {
    appliquerHumeurMascotte(humeur, options);
}

export function flashGrimaceRobo() {
    appliquerHumeurMascotte('grimace', { dureeRetour: DUREES_HUMEUR.grimace });
}

export function reagirRoboLevelUp() {
    appliquerHumeurMascotte('excite', { dureeRetour: 800 });
}

export function reagirRoboRelique() {
    appliquerHumeurMascotte('emerveille');
}

export function reagirRoboBossAttaque() {
    appliquerHumeurMascotte('inquiet');
}

export function reagirRoboBossDegats() {
    appliquerHumeurMascotte('determine');
}

export function reagirRoboBossVaincu() {
    appliquerHumeurMascotte('triomphal', { dureeRetour: 2000 });
}

export function reagirRoboMeteoActive() {
    appliquerHumeurMascotte('alerte');
}

export function reagirRoboNouveauRecord() {
    appliquerHumeurMascotte('euphorique');
}

export function reagirRoboGameOver() {
    appliquerHumeurMascotte('triste', { persistant: true });
}

/** @returns {number|null} */
function _obtenirLigneHautTas() {
    if (!etat.plateau?.length) return null;
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (etat.plateau[l].some((c) => c !== 0)) return l;
    }
    return CONFIG.lignes;
}

export function verifierPlateauCritiqueRobo() {
    const haut = _obtenirLigneHautTas();
    if (haut === null || haut > SEUIL_LIGNES_CRITIQUE) return;
    const now = Date.now();
    if (now - _dernierStress < 4000) return;
    _dernierStress = now;
    appliquerHumeurMascotte('stresse');
}

export function reinitialiserTimerMascotte() {
    if (_timerRetourNeutre !== null) {
        clearTimeout(_timerRetourNeutre);
        _timerRetourNeutre = null;
    }
    _humeurPersistante = false;
}

export function reinitialiserMascottePartie() {
    reinitialiserTimerMascotte();
    appliquerHumeurMascotte('neutre');
}
