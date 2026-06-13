import { CONFIG } from './config-jeu.js';
import { etat } from './store-jeu.js';
import { majStatsReactionRobo } from './achievements.js';
import {
    definirHumeurRobo,
    definirClignementInactifMascotte,
    demarrerBoucleRobo,
} from './rendu-robo.js';
import { logger } from './logger.js';

/** @param {string} humeur */
export function convertirHumeurVersCanvas(humeur) {
    if (humeur === 'triste') return 'triste';
    if (
        humeur === 'excite' ||
        humeur === 'excite-plus' ||
        humeur === 'triomphal' ||
        humeur === 'euphorique' ||
        humeur === 'emerveille'
    ) {
        return 'excite';
    }
    if (humeur === 'content' || humeur === 'heureux') return 'content';
    if (
        humeur === 'alerte' ||
        humeur === 'stresse' ||
        humeur === 'inquiet' ||
        humeur === 'determine' ||
        humeur === 'grimace'
    ) {
        return 'alerte';
    }
    return 'neutre';
}

const COOLDOWN_MS = 800;
const SEUIL_PILE_HAUTE = 0.75;
const SEUIL_PILE_BASSE = 0.6;
const INACTIVITE_MS = 20000;

const DUREES_HUMEUR = {
    content: 1200,
    heureux: 1200,
    excite: 2500,
    'excite-plus': 2500,
    grimace: 700,
    emerveille: 2600,
    inquiet: 1800,
    determine: 2000,
    triomphal: 2000,
    stresse: 2400,
    euphorique: 3500,
    alerte: 2200,
};

let _timerRetourNeutre = null;
let _humeurPersistante = false;
let _prioriteCourante = 0;
let _dernierChangementMs = 0;
let _pileHaute = false;
let _dernierVerrouMs = Date.now();
let _humeurLogiqueCourante = 'neutre';
let _inactiviteInitialisee = false;

/**
 * @param {number} nbLignes
 * @param {number} [combo]
 * @returns {{ humeur: string, priorite: number, duree: number } | null}
 */
export function determinerHumeurLignes(nbLignes, combo = 0) {
    if (nbLignes <= 0) return null;
    if (nbLignes >= 4) return { humeur: 'excite', priorite: 3, duree: 2500 };
    if (combo >= 3) return { humeur: 'content', priorite: 2, duree: 2000 };
    return { humeur: 'content', priorite: 1, duree: 1200 };
}

/** @returns {number} */
function _ratioHauteurPile() {
    if (!etat.plateau?.length) return 0;
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (etat.plateau[l].some((c) => c !== 0)) {
            return (CONFIG.lignes - l) / CONFIG.lignes;
        }
    }
    return 0;
}

/**
 * @param {string} humeur
 * @param {number} priorite
 * @param {{ dureeRetour?: number, persistant?: boolean, etatContinu?: boolean, compterStats?: boolean }} [options]
 */
function _appliquerReaction(humeur, priorite, options = {}) {
    const etatContinu = options.etatContinu === true;
    const persistant = options.persistant === true || etatContinu;

    if (
        !persistant &&
        priorite < _prioriteCourante &&
        (_humeurPersistante || _timerRetourNeutre !== null)
    ) {
        return false;
    }
    if (
        !persistant &&
        priorite === _prioriteCourante &&
        _humeurPersistante &&
        etatContinu !== true
    ) {
        _humeurPersistante = false;
    }
    const now = Date.now();
    if (!persistant && priorite < 4 && now - _dernierChangementMs < COOLDOWN_MS) {
        return false;
    }

    if (options.compterStats !== false && humeur !== 'neutre') {
        majStatsReactionRobo(humeur);
    }
    if (humeur !== _humeurLogiqueCourante) {
        logger.debug('[reactions] mascotte →', humeur, `(p${priorite})`);
    }

    _humeurLogiqueCourante = humeur;
    _prioriteCourante = persistant ? priorite : priorite;
    _dernierChangementMs = now;
    etat.humeur = humeur;
    _humeurPersistante = persistant;

    definirHumeurRobo(convertirHumeurVersCanvas(humeur));
    definirClignementInactifMascotte(humeur === 'neutre' && priorite === 0);

    if (_timerRetourNeutre !== null) {
        clearTimeout(_timerRetourNeutre);
        _timerRetourNeutre = null;
    }

    if (!persistant && humeur !== 'neutre' && humeur !== 'triste') {
        const duree = options.dureeRetour ?? DUREES_HUMEUR[humeur] ?? 2500;
        _timerRetourNeutre = setTimeout(() => {
            _prioriteCourante = 0;
            _appliquerReaction('neutre', 0, { compterStats: false });
            _reevaluerPileHaute();
        }, duree);
    }
    return true;
}

function _reevaluerPileHaute() {
    const ratio = _ratioHauteurPile();
    const etaitHaute = _pileHaute;
    if (ratio > SEUIL_PILE_HAUTE) {
        if (!etaitHaute) {
            _pileHaute = true;
            _appliquerReaction('alerte', 4, { etatContinu: true });
        }
    } else if (etaitHaute && ratio < SEUIL_PILE_BASSE) {
        _pileHaute = false;
        if (_humeurLogiqueCourante === 'alerte') {
            _humeurPersistante = false;
            _prioriteCourante = 0;
            _appliquerReaction('neutre', 0, { compterStats: false });
        }
    }
}

export function evaluerPileMascotte() {
    _reevaluerPileHaute();
}

export function evaluerInactiviteMascotte() {
    if (Date.now() - _dernierVerrouMs < INACTIVITE_MS) return;
    if (_prioriteCourante >= 4 && _humeurPersistante) return;
    if (_prioriteCourante > 0 && _timerRetourNeutre !== null) return;
    if (_pileHaute) return;
    definirClignementInactifMascotte(true);
    if (_humeurLogiqueCourante !== 'neutre') {
        _appliquerReaction('neutre', 0, { compterStats: false });
    }
}

export function signalerActiviteMascotte() {
    _dernierVerrouMs = Date.now();
    definirClignementInactifMascotte(false);
}

/** @param {import('./bus-jeu.js').ecouter} ecouterFn */
export function brancherBusReactionsMascotte(ecouterFn) {
    if (_inactiviteInitialisee) return;
    _inactiviteInitialisee = true;
    ecouterFn('partie:nouvelle-piece', () => signalerActiviteMascotte());
    ecouterFn('piece:son', ({ type }) => {
        if (type === 'verrou' || type === 'deplacement' || type === 'rotation') {
            signalerActiviteMascotte();
        }
    });
    ecouterFn('monde:objectif-atteint', () => reagirRoboVictoireMonde());
}

/** @param {number} nbLignes @param {number} [combo] */
export function reagirRoboAuxLignes(nbLignes, combo = 0) {
    const reaction = determinerHumeurLignes(nbLignes, combo);
    if (!reaction) return;
    _appliquerReaction(reaction.humeur, reaction.priorite, { dureeRetour: reaction.duree });
}

/** @param {{ dureeRetour?: number, persistant?: boolean }} [options] */
export function appliquerHumeurMascotte(humeur, options = {}) {
    const priorite = options.persistant ? 5 : 2;
    _appliquerReaction(humeur, priorite, options);
}

/** @param {string} humeur @param {{ dureeRetour?: number, persistant?: boolean }} [options] */
export function changerHumeur(humeur, options) {
    appliquerHumeurMascotte(humeur, options);
}

export function flashGrimaceRobo() {
    _appliquerReaction('grimace', 1, { dureeRetour: DUREES_HUMEUR.grimace });
}

export function reagirRoboLevelUp() {
    _appliquerReaction('excite', 3, { dureeRetour: 800 });
}

export function reagirRoboRelique() {
    _appliquerReaction('emerveille', 3, { dureeRetour: DUREES_HUMEUR.emerveille });
}

export function reagirRoboBossAttaque() {
    _appliquerReaction('inquiet', 4, { dureeRetour: DUREES_HUMEUR.inquiet });
}

export function reagirRoboBossDegats() {
    _appliquerReaction('determine', 3, { dureeRetour: DUREES_HUMEUR.determine });
}

export function reagirRoboBossVaincu() {
    _appliquerReaction('triomphal', 5, { dureeRetour: 2000 });
}

export function reagirRoboMeteoActive() {
    _appliquerReaction('alerte', 4, { dureeRetour: DUREES_HUMEUR.alerte });
}

export function reagirRoboNouveauRecord() {
    _appliquerReaction('euphorique', 5, { dureeRetour: DUREES_HUMEUR.euphorique });
}

export function reagirRoboGameOver() {
    _appliquerReaction('triste', 5, { persistant: true });
}

export function reagirRoboVictoireMonde() {
    _appliquerReaction('excite', 5, { persistant: true });
}

export function reagirRoboContinueBoss() {
    _appliquerReaction('triste', 4, { dureeRetour: 2000 });
}

export function verifierPlateauCritiqueRobo() {
    evaluerPileMascotte();
    evaluerInactiviteMascotte();
}

export function reinitialiserTimerMascotte() {
    if (_timerRetourNeutre !== null) {
        clearTimeout(_timerRetourNeutre);
        _timerRetourNeutre = null;
    }
    _humeurPersistante = false;
    _prioriteCourante = 0;
}

export function reinitialiserMascottePartie() {
    reinitialiserTimerMascotte();
    _pileHaute = false;
    _dernierVerrouMs = Date.now();
    _humeurLogiqueCourante = 'neutre';
    definirClignementInactifMascotte(false);
    _appliquerReaction('neutre', 0, { compterStats: false });
    demarrerBoucleRobo();
}
