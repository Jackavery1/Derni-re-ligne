import { ecouter } from '../etat/bus-jeu.js';
import { archi } from '../logique/archi-logique.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { dessinerPreview } from './rendu-jeu.js';
import { arreterAnimationMenu } from './menu-fond.js';
import { archi_rendreFrame } from './archi-rendu.js';
import { adapterInterfaceArchi } from './layout-jeu.js';
import { obtenirCanvas } from '../logique/dom-utils.js';

let idFrameArchi = null;

function arreterBoucleArchi() {
    if (idFrameArchi) {
        cancelAnimationFrame(idFrameArchi);
        idFrameArchi = null;
    }
}

function boucleArchi() {
    if (!archi.actif) return;
    if (!archi.estEnPause) {
        mettreAJourParticules(16);
    }
    archi_rendreFrame();
    idFrameArchi = requestAnimationFrame(boucleArchi);
}

function rafraichirPreviewArchi() {
    if (!archi.pieceActuelle) return;
    const cvs = obtenirCanvas('canvas-archi-preview');
    if (cvs) dessinerPreview(cvs.getContext('2d'), cvs, archi.pieceActuelle);
}

let archiRenduBusInitialise = false;

export function initialiserArchiRenduBus() {
    if (archiRenduBusInitialise) return;
    archiRenduBusInitialise = true;

    ecouter('archi:rendu-init', () => {
        arreterAnimationMenu();
        adapterInterfaceArchi();
    });

    ecouter('archi:rafraichir-preview', () => {
        rafraichirPreviewArchi();
    });

    ecouter('archi:demarrer-boucle', () => {
        arreterBoucleArchi();
        idFrameArchi = requestAnimationFrame(boucleArchi);
    });

    ecouter('archi:arreter-boucle', () => {
        arreterBoucleArchi();
    });
}
