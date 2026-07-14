import { BIOMES } from '../config/biomes.js';
import { initialiserMeteo, annulerMeteo } from './meteo.js';
import { initialiserVivant, annulerTimersVivant } from './vivant.js';
import {
    etat,
    particules,
    textesFlottants,
    secousse,
    flashVerrou,
    flashLignes,
    flashTopout,
    dasEtat,
    obtenirBiomeActif,
    obtenirSacPieces,
    definirReliqueEnAttente,
    definirReliqueActive,
    definirCompteurPieces,
    definirSeuilProchRelique,
    definirCouleurAmbRgb,
    definirDerniereSecondeTemps,
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
} from '../etat/store-jeu.js';
import {
    creerPlateau,
    genererProchainePiece,
    activerReliqueSurPiece,
    remplirSac,
    reinitialiserDas,
    hexVersRgb,
} from './piece-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { reinitialiserGameFeel, demarrerGraceSpawn } from './game-feel-jeu.js';
import { signalerApparitionPiece } from '../ui/profil-jeu.js';
import { annoncerPieceCourante } from '../ui/annonces.js';

export function initialiserEtatPartie() {
    etat.plateau = creerPlateau();
    etat.victoireSprint = false;
    etat.score = 0;
    etat.lignes = 0;
    etat.niveau = 1;
    etat.pieceEnReserve = null;
    etat.reserveUtilisee = false;
    etat.estEnCours = true;
    etat.estEnPause = false;
    etat.combo = 0;
    etat.dernierEtaitTetris = false;
    etat.tempsDebut = Date.now();
    etat.tempsPauseAccumule = 0;
    etat.tempsPauseDebut = null;
    particules.length = 0;
    textesFlottants.length = 0;
    definirCouleurAmbRgb(hexVersRgb(BIOMES[obtenirBiomeActif()].lueurCoul));
    secousse.timer = 0;
    flashVerrou.timer = 0;
    flashVerrou.cellules = [];
    flashLignes.timer = 0;
    flashLignes.lignes = [];
    flashTopout.timer = 0;
    definirDerniereSecondeTemps(-1);
    obtenirSacPieces().length = 0;
    remplirSac();
    definirPieceAuSol(false);
    definirLockDelayRestant(0);
    definirNbLockResets(0);
    Object.keys(dasEtat).forEach(reinitialiserDas);

    definirCompteurPieces(0);
    definirSeuilProchRelique(Math.floor(Math.random() * 6) + 15);
    definirReliqueEnAttente(false);
    definirReliqueActive(null);
    reinitialiserGameFeel();
    if (modeHistoireEnCours()) {
        annulerMeteo();
    } else {
        initialiserMeteo();
    }
    if (modeHistoireEnCours()) {
        annulerTimersVivant();
    } else {
        initialiserVivant();
    }

    etat.pieceActuelle = genererProchainePiece();
    activerReliqueSurPiece(etat.pieceActuelle);
    etat.filePieces = [genererProchainePiece(), genererProchainePiece(), genererProchainePiece()];
    demarrerGraceSpawn();
    signalerApparitionPiece();
    annoncerPieceCourante();
}
