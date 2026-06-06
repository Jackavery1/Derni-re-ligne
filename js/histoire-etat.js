import { store } from './store-core.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './progression.js';

/** @returns {typeof import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} */
export function obtenirEtatHistoirePersiste() {
    if (!store.histoire.etat) {
        store.histoire.etat = chargerEtatHistoire();
    }
    return store.histoire.etat;
}

/** @param {typeof import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist */
export function persisterEtatHistoire(etatHist) {
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}
