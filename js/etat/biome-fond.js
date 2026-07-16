/** Identifiant du biome/monde utilisé pour le fond animé du plateau. */
import { store } from './store-jeu.js';
import { obtenirBiomeActif } from './store-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';

export function obtenirIdBiomeFond() {
    if (modeHistoireEnCours() && store.histoire.mondeActuel) {
        return store.histoire.mondeActuel;
    }
    return obtenirBiomeActif() || 'monde_prologue';
}
