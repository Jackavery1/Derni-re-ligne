export { appliquerScoreLignes } from './score-partie.js';

export { calculerScore } from './logique-partie-score.js';
export { verrouillerPiece } from './logique-partie-verrouillage.js';
export {
    jouable,
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
    utiliserReserve,
} from './logique-partie-mouvement.js';

import { CONFIG } from '../config/config.js';
import { meteo } from './meteo.js';
import { etat } from '../etat/store-jeu.js';
import { vitesseHistoireMs } from '../gestionnaire-difficulte.js';
import { obtenirVitesseChuteModifiee } from '../mecaniques-histoire.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';

export function vitesseChute() {
    if (modeHistoireEnCours()) {
        return obtenirVitesseChuteModifiee(vitesseHistoireMs());
    }
    const estSprint = etat.modeJeu === 'sprint';
    const vitesseBase = estSprint ? CONFIG.sprintVitesseBase : CONFIG.vitesseBase;
    const reduction = estSprint ? CONFIG.sprintReductionParNiveau : CONFIG.reductionParNiveau;
    const vitesseMin = estSprint ? CONFIG.sprintVitesseMin : CONFIG.vitesseMin;
    const base = Math.max(vitesseBase - (etat.niveau - 1) * reduction, vitesseMin);
    return obtenirVitesseChuteModifiee(base * (meteo.facteurVitesse ?? 1));
}
