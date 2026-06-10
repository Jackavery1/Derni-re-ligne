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

import { CONFIG } from './config.js';
import { meteo } from './meteo.js';
import { etat } from './store-jeu.js';
import { vitesseHistoireMs } from './gestionnaire-difficulte.js';
import { obtenirVitesseChuteModifiee } from './mecaniques-histoire.js';
import { modeHistoireEnCours } from './mode-histoire.js';

export function vitesseChute() {
    if (modeHistoireEnCours()) {
        return obtenirVitesseChuteModifiee(vitesseHistoireMs());
    }
    const base = Math.max(
        CONFIG.vitesseBase - (etat.niveau - 1) * CONFIG.reductionParNiveau,
        CONFIG.vitesseMin
    );
    return obtenirVitesseChuteModifiee(base * (meteo.facteurVitesse ?? 1));
}
