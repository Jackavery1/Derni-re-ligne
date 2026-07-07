import { vivant_enregistrerLignesScore } from './vivant.js';
import { majStatsScorePartie } from '../achievements.js';
import { enregistrerLignesParNiveau } from '../profil-jeu.js';
import { emettre } from '../etat/bus-jeu.js';
import { etat } from '../etat/store-jeu.js';
import { store } from '../etat/store-jeu.js';
import { appliquerScoreLignes } from './score-partie.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { suiviDifficulteActif } from '../gestionnaire-difficulte.js';

export function calculerScore(nbLignes, tSpin = null) {
    vivant_enregistrerLignesScore(nbLignes);
    const optionsScore =
        modeHistoireEnCours() && suiviDifficulteActif()
            ? {
                  niveauScore: store.histoire.difficulte.palierCourant,
                  ignorerLevelUp: true,
              }
            : {};
    const result = appliquerScoreLignes(etat, nbLignes, tSpin, optionsScore);

    if (nbLignes > 0) {
        majStatsScorePartie(nbLignes, etat.combo);
        enregistrerLignesParNiveau(nbLignes);
    }

    emettre('score:maj', { nbLignes, result });
}
