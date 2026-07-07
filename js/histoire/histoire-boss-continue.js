import { store } from '../etat/store-jeu.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { sauvegarderEtatHistoire } from '../io/progression.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';

function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

export function peutContinuerBossGratuit() {
    if (!modeHistoireEnCours()) return false;
    if (store.histoire.mondeActuel !== 'monde_finale') return false;
    const etatHist = obtenirEtatHistoire();
    return etatHist.continueGratuitDistorsionUtilise !== true;
}

export function utiliserContinueGratuitDistorsion() {
    const etatHist = obtenirEtatHistoire();
    etatHist.continueGratuitDistorsionUtilise = true;
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}
