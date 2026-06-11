import { CONFIG } from './config-jeu.js';
import { etat } from './store-jeu.js';
import { obtenirBouton, obtenirElement } from './dom-utils.js';

export let modeSprintActif = false;

function coopSelectionActif() {
    return document.getElementById('toggle-coop')?.classList.contains('actif') ?? false;
}

export function basculerModeSprint() {
    if (coopSelectionActif()) return;
    modeSprintActif = !modeSprintActif;
    etat.modeJeu = modeSprintActif ? 'sprint' : 'marathon';
    mettreAJourToggleSprint();
}

export function desactiverModeSprint() {
    if (!modeSprintActif) return;
    modeSprintActif = false;
    etat.modeJeu = 'marathon';
    mettreAJourToggleSprint();
}

export function mettreAJourToggleSprint() {
    if (typeof document === 'undefined') return;

    const coopActif = coopSelectionActif();
    const wrap = document.getElementById('toggle-sprint-wrap');
    const btn = obtenirBouton('toggle-sprint');
    const label = obtenirElement('sprint-toggle-label');
    const coopBtn = obtenirBouton('toggle-coop');

    if (wrap) {
        wrap.classList.toggle('element-masque', coopActif);
        wrap.setAttribute('aria-hidden', coopActif ? 'true' : 'false');
    }

    if (modeSprintActif) {
        btn?.classList.add('actif');
        if (label) label.textContent = `SPRINT ${CONFIG.sprintLignes}L : ON`;
        if (coopBtn) coopBtn.disabled = true;
    } else {
        btn?.classList.remove('actif');
        if (label) label.textContent = `SPRINT ${CONFIG.sprintLignes}L : OFF`;
        if (coopBtn && !coopActif) coopBtn.disabled = false;
    }
}

export function reinitialiserModeSprint() {
    modeSprintActif = false;
    etat.modeJeu = 'marathon';
}
