import { configurerActionsJeu } from './actions-jeu.js';
import { planifierBoucle } from '../boucle-jeu.js';
import { demarrerJeu, basculerPause, confirmerRecommencer, quitterVersMenu } from '../partie.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
    utiliserReserve,
} from './logique-partie.js';

function terminerPartie(victoire, options) {
    void import('./partie-fin.js').then(({ terminerPartie: finir }) => finir(victoire, options));
}

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
