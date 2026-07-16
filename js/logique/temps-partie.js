import { etat } from '../etat/store-jeu.js';

/** Temps de partie écoulé hors pauses (ms). */
export function obtenirTempsEcoule() {
    if (!etat.tempsDebut) return 0;
    let total = Date.now() - etat.tempsDebut - etat.tempsPauseAccumule;
    if (etat.estEnPause && etat.tempsPauseDebut) {
        total -= Date.now() - etat.tempsPauseDebut;
    }
    return Math.max(0, total);
}
