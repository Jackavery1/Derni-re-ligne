import { CONFIG } from './config.js';
import { etat } from './store-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { modeArchiEnCours, modeCoopEnCours } from './registre-modes.js';
import { emettre } from './bus-jeu.js';

let _derniereSecondeRestante = -1;
let _levelUpTempsEnCours = false;

export function timerNiveauActif() {
    return (
        etat.estEnCours &&
        etat.modeJeu === 'marathon' &&
        !modeHistoireEnCours() &&
        !modeArchiEnCours() &&
        !modeCoopEnCours()
    );
}

/** @param {number} niveau */
export function budgetNiveauMs(niveau) {
    const sec = Math.min(
        CONFIG.tempsNiveauMaxSec,
        CONFIG.tempsNiveauBaseSec + Math.max(0, niveau - 1) * CONFIG.tempsNiveauBonusSec
    );
    return sec * 1000;
}

export function reinitialiserTimerNiveau() {
    etat.tempsNiveauDebut = Date.now();
    etat.tempsNiveauBudgetMs = budgetNiveauMs(etat.niveau);
    _derniereSecondeRestante = -1;
    _mettreAJourVisibiliteHud();
}

function _obtenirMsEcoulesNiveau() {
    if (!etat.tempsNiveauDebut) return 0;
    let total = Date.now() - etat.tempsNiveauDebut - etat.tempsPauseAccumule;
    if (etat.estEnPause && etat.tempsPauseDebut) {
        total -= Date.now() - etat.tempsPauseDebut;
    }
    return Math.max(0, total);
}

export function obtenirTempsRestantNiveauMs() {
    const budget = etat.tempsNiveauBudgetMs || budgetNiveauMs(etat.niveau);
    return Math.max(0, budget - _obtenirMsEcoulesNiveau());
}

function _mettreAJourVisibiliteHud() {
    const section = document.getElementById('section-timer-niveau');
    if (!section) return;
    section.classList.toggle('element-masque', !timerNiveauActif());
}

export function mettreAJourAffichageTimerNiveau() {
    if (!timerNiveauActif()) {
        _mettreAJourVisibiliteHud();
        return false;
    }

    _mettreAJourVisibiliteHud();
    const restantMs = obtenirTempsRestantNiveauMs();
    const sec = Math.ceil(restantMs / 1000);
    if (sec === _derniereSecondeRestante) return restantMs <= 0;
    _derniereSecondeRestante = sec;

    const el = document.getElementById('affichage-temps-niveau');
    const section = document.getElementById('section-timer-niveau');
    if (el) {
        const mm = Math.floor(sec / 60);
        const ss = sec % 60;
        el.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }
    if (section) {
        section.classList.toggle('timer-niveau-alerte', sec <= CONFIG.tempsAlerteFinSec);
    }

    return restantMs <= 0;
}

export function declencherLevelUpTemps() {
    if (_levelUpTempsEnCours || !timerNiveauActif()) return;
    _levelUpTempsEnCours = true;
    etat.niveau++;
    reinitialiserTimerNiveau();
    emettre('partie:level-up-temps', { niveau: etat.niveau });
    _levelUpTempsEnCours = false;
}

export function tickTimerNiveau() {
    if (!timerNiveauActif() || etat.estEnPause) return;
    if (mettreAJourAffichageTimerNiveau()) {
        declencherLevelUpTemps();
    }
}
