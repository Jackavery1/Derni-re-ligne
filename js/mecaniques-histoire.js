import { CONFIG } from './config.js';
import { store } from './store-jeu.js';
import { etat, obtenirBiomeActif } from './store-jeu.js';
import { ecouter } from './bus-jeu.js';
import { logger } from './logger.js';
import { obtenirEtatHistoire, sauvegarderEtatHistoireStore } from './histoire-mondes.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { verifierConditionMiroir, verifierConditionC3 } from './conditions-secrets.js';
import { biomeActuelMecanique } from './mecaniques-histoire-queries.js';
import {
    reinitialiserCellulesRouilleActives,
    tickRouille,
    effondrerRouilleExpiree,
    decalerMatricesRouille,
} from './mecaniques-histoire-rouille.js';
import { initialiserEclipse, tickEclipse } from './mecaniques-histoire-eclipse.js';
import {
    initialiserVide,
    reinitialiserVideSurNouvellePiece,
    tickVide,
} from './mecaniques-histoire-vide.js';
import { initialiserTrame, tickTrame } from './mecaniques-histoire-trame.js';
import { appliquerCSSMiroir } from './mecaniques-histoire-miroir.js';

export {
    biomeActuelMecanique,
    biomeActuelEstMiroir,
    biomeActuelEstVide,
} from './mecaniques-histoire-queries.js';
export {
    enregistrerTimestampCellules,
    reinitialiserMatricesRouille,
    celluleEstRouillee,
} from './mecaniques-histoire-rouille.js';
export {
    obtenirVitesseChuteModifiee,
    obtenirLigneEclipse,
    obtenirLibelleModificateurBiomeHud,
} from './mecaniques-histoire-eclipse.js';
export {
    pieceEstInvisible,
    opacitePieceCourante,
    ghostEstDesactive,
} from './mecaniques-histoire-vide.js';
export { obtenirFondTrame } from './mecaniques-histoire-trame.js';
export { actionMiroir } from './mecaniques-histoire-miroir.js';

let _desinscriptions = [];

export function initialiserMecaniquesHistoire() {
    if (!modeHistoireEnCours()) return;

    const mec = biomeActuelMecanique();
    if (!mec) return;

    const N = CONFIG.lignes * CONFIG.colonnes;
    store.histoire.mecaniques.plateauTimestamps = new Float64Array(N).fill(0);
    store.histoire.mecaniques.plateauRouille = new Uint8Array(N).fill(0);
    reinitialiserCellulesRouilleActives();

    initialiserEclipse();
    initialiserVide();
    store.histoire.mecaniques.cyberTetrisConsecutifs = 0;
    initialiserTrame();

    if (mec === 'miroir' || mec === 'paradoxe') appliquerCSSMiroir(true);

    const off1 = ecouter('partie:nouvelle-piece', _surNouvellepiece);
    const off2 = ecouter('lignes:effacees', _surLignesEffacees);
    _desinscriptions = [off1, off2];

    logger.info('[mecHistoire] initialise :', mec);
}

export function arreterMecaniquesHistoire() {
    appliquerCSSMiroir(false);

    _desinscriptions.forEach((fn) => fn?.());
    _desinscriptions = [];

    store.histoire.mecaniques.plateauTimestamps = null;
    store.histoire.mecaniques.plateauRouille = null;
    store.histoire.mecaniques.videInvisible = false;
    reinitialiserCellulesRouilleActives();

    logger.info('[mecHistoire] arrête');
}

export function mettreAJourMecaniquesHistoire(dt, timestamp) {
    if (!modeHistoireEnCours() || etat.estEnPause) return;
    const mec = biomeActuelMecanique();
    if (!mec) return;

    switch (mec) {
        case 'rouille':
            tickRouille(timestamp);
            effondrerRouilleExpiree(timestamp);
            break;
        case 'eclipse':
            tickEclipse(timestamp);
            break;
        case 'vide':
            tickVide(timestamp);
            break;
        case 'trame':
            tickTrame(dt);
            break;
        case 'paradoxe':
            tickVide(timestamp);
            break;
    }
}

function _surNouvellepiece() {
    reinitialiserVideSurNouvellePiece();
}

function _surLignesEffacees({ nbSupprimees, lignesEffacees }) {
    if (!modeHistoireEnCours()) return;
    const mec = biomeActuelMecanique();

    if (mec === 'rouille' && store.histoire.mecaniques.plateauTimestamps) {
        decalerMatricesRouille(lignesEffacees);
    }

    if (obtenirBiomeActif() === 'cyber') {
        _trackerTetrisCyber(nbSupprimees);
    }
}

function _trackerTetrisCyber(nbLignes) {
    const etatHist = obtenirEtatHistoire();
    if (!etatHist) return;
    verifierConditionMiroir(nbLignes, etatHist);
}

export function onGameOverHistoire(lignes, mondeId) {
    if (!modeHistoireEnCours()) return;
    if (mondeId !== 'monde_prologue') return;
    if (lignes > 0) return;

    const etatHist = obtenirEtatHistoire();
    if (!etatHist) return;

    etatHist.conditionsParadoxe.topsVolontairesPrologue =
        (etatHist.conditionsParadoxe.topsVolontairesPrologue ?? 0) + 1;
    store.histoire.prologueTopsVolontaires = etatHist.conditionsParadoxe.topsVolontairesPrologue;

    logger.info(
        '[mecHistoire] top prologue n°',
        etatHist.conditionsParadoxe.topsVolontairesPrologue
    );
    sauvegarderEtatHistoireStore(etatHist);

    verifierConditionC3(etatHist.conditionsParadoxe.topsVolontairesPrologue ?? 0, etatHist);
}
