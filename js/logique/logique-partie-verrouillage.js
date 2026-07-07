import { meteo } from './meteo.js';
import { appliquerEffetRelique } from '../reliques.js';
import { obtenirActions } from '../actions-jeu.js';
import { emettre } from '../etat/bus-jeu.js';
import {
    etat,
    flashVerrou,
    flashLignes,
    obtenirReliqueEnAttente,
    obtenirReliqueActive,
    obtenirCompteurPieces,
    obtenirSeuilProchRelique,
    incrementerCompteurPieces,
    definirReliqueEnAttente,
    definirReliqueActive,
    definirCompteurPieces,
    definirSeuilProchRelique,
    definirLockDelayRestant,
    definirNbLockResets,
    definirPieceAuSol,
} from '../etat/store-jeu.js';
import {
    obtenirForme,
    obtenirCouleurPiece,
    estPositionValide,
    creerPlateau,
    genererProchainePiece,
    activerReliqueSurPiece,
} from './piece-jeu.js';
import {
    detecterTSpin,
    supprimerLignesDuPlateau,
    supprimerLignesDuPlateauExcluantRouille,
} from './logique-pure.js';
import { enregistrerNotesLignesCompletes } from '../audio/melodie.js';
import { majStatsLignesEffacees } from '../achievements.js';
import { enregistrerDonneesVerrouillage, signalerApparitionPiece } from '../profil-jeu.js';
import { sauvegarderPlacementOracle, declencherCalculOracle } from './oracle-jeu.js';
import { annoncerPieceCourante } from '../annonces.js';
import {
    vivant_enregistrerDepot,
    vivant_recompenserActivite,
    vivant_synchroniserApresLignes,
} from './vivant.js';
import { poserPieceSurPlateau } from './actions-piece-communes.js';
import { obtenirDecalageDistorsionBoss } from '../boss-jeu.js';
import {
    enregistrerTimestampCellules,
    biomeActuelMecanique,
    celluleEstRouillee,
    reinitialiserMatricesRouille,
} from '../mecaniques-histoire.js';
import {
    enregistrerPosePiece,
    estMondeZenActif,
    enregistrerTopOut,
} from '../gestionnaire-difficulte.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { demarrerAre, demarrerGraceSpawn, verifierCollisionSpawn } from './game-feel-jeu.js';
import { consommerPoseApresRotation } from './logique-partie-pose.js';
import { calculerScore } from './logique-partie-score.js';
import { produireProchainePieceApresShift } from './logique-partie-hold.js';

export { recupererZenApresTopOut };

function recupererZenApresTopOut() {
    enregistrerTopOut();
    etat.plateau = creerPlateau();
    reinitialiserMatricesRouille();
    etat.pieceActuelle = genererProchainePiece();
    activerReliqueSurPiece(etat.pieceActuelle);
    etat.filePieces = [genererProchainePiece(), genererProchainePiece(), genererProchainePiece()];
    etat.reserveUtilisee = false;
    definirPieceAuSol(false);
    definirLockDelayRestant(0);
    definirNbLockResets(0);
    demarrerGraceSpawn();
    emettre('partie:nouvelle-piece');
    signalerApparitionPiece();
    annoncerPieceCourante();
}

function supprimerLignesCompletes() {
    const { plateau, nbSupprimees, lignesEffacees } =
        biomeActuelMecanique() === 'rouille'
            ? supprimerLignesDuPlateauExcluantRouille(etat.plateau, celluleEstRouillee)
            : supprimerLignesDuPlateau(etat.plateau);
    if (nbSupprimees === 0) return 0;

    etat.plateau = plateau;
    vivant_synchroniserApresLignes(lignesEffacees);
    flashLignes.lignes = [...lignesEffacees];
    flashLignes.timer = flashLignes.duree;
    emettre('lignes:effacees', { nbSupprimees, lignesEffacees });
    return nbSupprimees;
}

export function verrouillerPiece() {
    if (!etat.pieceActuelle) return;
    if (meteo.decalageForce !== 0) {
        if (estPositionValide(etat.pieceActuelle, meteo.decalageForce, 0)) {
            etat.pieceActuelle.x += meteo.decalageForce;
        }
    }

    sauvegarderPlacementOracle();

    const _decalageBoss = obtenirDecalageDistorsionBoss();
    if (
        _decalageBoss !== 0 &&
        etat.pieceActuelle &&
        estPositionValide(etat.pieceActuelle, _decalageBoss, 0)
    ) {
        etat.pieceActuelle.x += _decalageBoss;
    }

    const formeVerrou = obtenirForme(etat.pieceActuelle);
    const pieceVerrou = etat.pieceActuelle;
    const tSpin =
        consommerPoseApresRotation() &&
        pieceVerrou.type === 'T' &&
        pieceVerrou.x != null &&
        pieceVerrou.y != null
            ? detecterTSpin(etat.plateau, pieceVerrou, formeVerrou)
            : null;

    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    const optionsPose = modeHistoireEnCours()
        ? {}
        : { onCellule: (x, y) => vivant_enregistrerDepot(x, y) };
    const { gameOver, cellulesPosees } = poserPieceSurPlateau(
        etat.plateau,
        etat.pieceActuelle,
        couleur,
        optionsPose
    );

    if (gameOver) {
        if (modeHistoireEnCours() && estMondeZenActif()) {
            recupererZenApresTopOut();
            return;
        }
        emettre('partie:topout');
        obtenirActions().terminerPartie?.();
        return;
    }

    enregistrerPosePiece();

    vivant_recompenserActivite();

    flashVerrou.cellules = cellulesPosees;
    enregistrerTimestampCellules(cellulesPosees);
    flashVerrou.timer = flashVerrou.duree;

    enregistrerDonneesVerrouillage();

    incrementerCompteurPieces();
    if (obtenirCompteurPieces() >= obtenirSeuilProchRelique() && !obtenirReliqueEnAttente()) {
        definirReliqueEnAttente(true);
        definirCompteurPieces(0);
        definirSeuilProchRelique(Math.floor(Math.random() * 6) + 15);
    }
    const reliqueActive = obtenirReliqueActive();
    if (reliqueActive) {
        appliquerEffetRelique(reliqueActive, etat.pieceActuelle);
        definirReliqueActive(null);
    }

    enregistrerNotesLignesCompletes();
    const nbLignesEffacees = supprimerLignesCompletes();
    majStatsLignesEffacees(nbLignesEffacees);
    calculerScore(nbLignesEffacees, tSpin);
    emettre('piece:son', { type: 'verrou' });

    etat.pieceActuelle = etat.filePieces.shift();
    activerReliqueSurPiece(etat.pieceActuelle);
    produireProchainePieceApresShift();
    etat.reserveUtilisee = false;
    definirPieceAuSol(false);
    definirLockDelayRestant(0);
    definirNbLockResets(0);

    demarrerAre();
    demarrerGraceSpawn();
    emettre('partie:nouvelle-piece');
    signalerApparitionPiece();
    annoncerPieceCourante();
    declencherCalculOracle();

    verifierCollisionSpawn(recupererZenApresTopOut);
}
