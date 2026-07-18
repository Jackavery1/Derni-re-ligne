import { ecouter } from '../etat/bus-jeu.js';
import { reinitialiserHistoriquePositions } from './decorations-jeu.js';
import { initParticulesAmbiance, dessinerFileNext, rendreFrameJeu } from './rendu-jeu.js';
import { adapterInterface } from './layout-jeu.js';

let partieRenduBusInitialise = false;

export function initialiserPartieRenduBus() {
    if (partieRenduBusInitialise) return;
    partieRenduBusInitialise = true;

    ecouter('partie:rendu-features', () => {
        reinitialiserHistoriquePositions();
    });

    ecouter('partie:rendu-ui', () => {
        adapterInterface();
        dessinerFileNext();
        initParticulesAmbiance();
        rendreFrameJeu();
    });
}
