/** Identifiant du biome/monde utilisé pour le fond animé du plateau. */
import { store } from '../etat/store-jeu.js';
import { obtenirBiomeActif } from '../etat/store-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';

export function obtenirIdBiomeFond() {
    if (modeHistoireEnCours() && store.histoire.mondeActuel) {
        return store.histoire.mondeActuel;
    }
    return obtenirBiomeActif() || 'monde_prologue';
}
