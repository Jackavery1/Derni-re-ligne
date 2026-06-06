import { coop, modeCoopActif } from './coop-logique.js';

/** Préférence coop activée sur l'écran sélection (avant lancement). */
export function coopEstPrefere() {
    return modeCoopActif;
}

/** Partie coop en cours (runtime). */
export function coopPartieEnCours() {
    return coop.actif;
}

/** @param {boolean} actif */
export function definirCoopPartieEnCours(actif) {
    coop.actif = actif;
}
