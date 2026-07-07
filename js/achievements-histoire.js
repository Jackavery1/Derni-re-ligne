import { store } from './etat/store-jeu.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './io/progression.js';
import { modeHistoireEnCours } from './etat/mode-histoire.js';
import { ETAT_HISTOIRE_VIDE } from './histoire-donnees.js';
import { ACHIEVEMENTS_HISTOIRE_CONDITIONS } from './achievements-conditions-histoire.js';

function etatH() {
    if (!store.histoire.etat) {
        store.histoire.etat = chargerEtatHistoire();
    }
    return store.histoire.etat;
}

let _timerFlushProuesses = 0;

function _planifierFlushProuesses() {
    if (_timerFlushProuesses) return;
    _timerFlushProuesses = setTimeout(() => {
        _timerFlushProuesses = 0;
        if (store.histoire.etat) sauvegarderEtatHistoire(store.histoire.etat);
    }, 1500);
}

export function flushProuessesHistoire() {
    if (_timerFlushProuesses) {
        clearTimeout(_timerFlushProuesses);
        _timerFlushProuesses = 0;
    }
    if (store.histoire.etat) sauvegarderEtatHistoire(store.histoire.etat);
}

/** @param {keyof typeof ETAT_HISTOIRE_VIDE.prouessesHistoire} champ @param {number} valeur */
function _majProuesse(champ, valeur) {
    const e = etatH();
    if (!e.prouessesHistoire) {
        e.prouessesHistoire = { ...ETAT_HISTOIRE_VIDE.prouessesHistoire };
    }
    if (champ === 'meilleurTimerBossMs') {
        e.prouessesHistoire.meilleurTimerBossMs = Math.min(
            e.prouessesHistoire.meilleurTimerBossMs ?? Infinity,
            valeur
        );
    } else {
        e.prouessesHistoire[champ] = Math.max(e.prouessesHistoire[champ] ?? 0, valeur);
    }
    store.histoire.etat = e;
    _planifierFlushProuesses();
}

export const ACHIEVEMENTS_HISTOIRE = {};

/** @type {Promise<void> | null} */
let _chargeHistoirePromise = null;

/** @returns {Promise<void>} */
export async function chargerAchievementsHistoire() {
    if (Object.keys(ACHIEVEMENTS_HISTOIRE).length > 0) return;
    if (_chargeHistoirePromise) return _chargeHistoirePromise;
    _chargeHistoirePromise = fetch('./data/achievements-histoire.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`achievements-histoire.json : ${reponse.status}`);
            return reponse.json();
        })
        .then((meta) => {
            for (const [id, ach] of Object.entries(meta)) {
                ACHIEVEMENTS_HISTOIRE[id] = {
                    ...ach,
                    condition: ACHIEVEMENTS_HISTOIRE_CONDITIONS[id],
                };
            }
        });
    return _chargeHistoirePromise;
}

export function reinitialiserStatsAchievementsHistoire() {
    store.histoire.boss.timerDebut = 0;
    store.timerBossBattus = Infinity;
    store.blocksRouillesEffaces = 0;
    store.lignesEclipseBasse = 0;
    store.lignesVide = 0;
    store.precisionMiroir = 0;
}

export function enregistrerVictoireBossTimer(timestampDebut) {
    const duree = performance.now() - timestampDebut;
    store.timerBossBattus = Math.min(store.timerBossBattus ?? Infinity, duree);
    _majProuesse('meilleurTimerBossMs', duree);
}

export function ajouterBlocksRouillesEffaces(nb) {
    if (!modeHistoireEnCours()) return;
    store.blocksRouillesEffaces = (store.blocksRouillesEffaces ?? 0) + nb;
    _majProuesse('blocksRouillesMax', store.blocksRouillesEffaces);
}

export function ajouterLignesEclipseBasse(nb) {
    if (!modeHistoireEnCours()) return;
    store.lignesEclipseBasse = (store.lignesEclipseBasse ?? 0) + nb;
    _majProuesse('lignesEclipseBasseMax', store.lignesEclipseBasse);
}

export function ajouterLignesVide(nb) {
    if (!modeHistoireEnCours()) return;
    store.lignesVide = (store.lignesVide ?? 0) + nb;
    _majProuesse('lignesVideMax', store.lignesVide);
}

export function enregistrerPrecisionMiroir(precision) {
    if (!modeHistoireEnCours()) return;
    store.precisionMiroir = precision;
    _majProuesse('precisionMiroirMax', precision);
}
