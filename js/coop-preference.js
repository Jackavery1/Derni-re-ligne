import { obtenirBouton, obtenirElement } from './dom-utils.js';

/** Preference sur l'ecran selection (avant lancement). */
export let modeCoopActif = false;

export function appliquerUiPreferenceCoop(actif) {
    if (typeof document === 'undefined') return;

    const btn = obtenirBouton('toggle-coop');
    const label = obtenirElement('coop-toggle-label');
    const oracleBtn = obtenirBouton('toggle-oracle');

    if (actif) {
        btn?.classList.add('actif');
        if (label) label.textContent = 'COOP : ON';
        if (oracleBtn) oracleBtn.disabled = true;
    } else {
        btn?.classList.remove('actif');
        if (label) label.textContent = 'COOP : OFF';
        if (oracleBtn) oracleBtn.disabled = false;
    }
}

export function desactiverPreferenceCoop() {
    if (!modeCoopActif) return;
    modeCoopActif = false;
    appliquerUiPreferenceCoop(false);
}

export function basculerPreferenceCoop() {
    modeCoopActif = !modeCoopActif;
    appliquerUiPreferenceCoop(modeCoopActif);
    return modeCoopActif;
}

/** Préférence coop sur l'écran sélection (avant lancement). */
export function coopEstPrefere() {
    return modeCoopActif;
}
