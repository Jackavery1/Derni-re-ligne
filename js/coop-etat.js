import { coop, modeCoopActif } from './coop-logique.js';

/** Preference coop activee sur l'ecran selection (avant lancement). */
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
