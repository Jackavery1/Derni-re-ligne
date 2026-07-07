/** Détection du mode histoire sans dépendance lourde (évite les cycles d'import). */
import { store } from './store-core.js';

export function modeHistoireEnCours() {
    return store.histoire.actif;
}

export function activerModeHistoire() {
    store.histoire.actif = true;
}

export function desactiverModeHistoire() {
    store.histoire.actif = false;
}
