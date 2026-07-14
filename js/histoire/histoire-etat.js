import { store } from '../etat/store-jeu.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from '../io/progression.js';

/** @returns {typeof import('../histoire/histoire-donnees-exports.js').ETAT_HISTOIRE_VIDE} */
export function obtenirEtatHistoirePersiste() {
    if (!store.histoire.etat) {
        store.histoire.etat = chargerEtatHistoire();
    }
    return store.histoire.etat;
}

/** @param {typeof import('../histoire/histoire-donnees-exports.js').ETAT_HISTOIRE_VIDE} etatHist */
export function persisterEtatHistoire(etatHist) {
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}
