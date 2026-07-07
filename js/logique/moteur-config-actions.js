import { configurerActionsJeu } from './actions-jeu.js';
import { planifierBoucle } from '../boucle-jeu.js';
import {
    demarrerJeu,
    basculerPause,
    terminerPartie,
    confirmerRecommencer,
    quitterVersMenu,
} from '../partie.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
    utiliserReserve,
} from './logique-partie.js';

export function configurerActionsMoteur() {
    configurerActionsJeu({
        planifierBoucle,
        terminerPartie,
        demarrerJeu,
        basculerPause,
        confirmerRecommencer,
        quitterVersMenu,
        deplacerGauche,
        deplacerDroite,
        deplacerBas,
        chuteRapide,
        tourner,
        utiliserReserve,
    });
}
