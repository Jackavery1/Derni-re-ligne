import { CONFIG, TETROMINOS, RELIQUES } from './config.js';
import { AudioMoteur } from './audio.js';
import {
    detecterTSpin,
    obtenirEssaisKick,
    supprimerLignesDuPlateau,
    supprimerLignesDuPlateauExcluantRouille,
} from './logique-pure.js';
import { meteo, ETATS_METEO } from './meteo.js';
import { appliquerEffetRelique } from './reliques.js';
import { obtenirActions } from './actions-jeu.js';
import { emettre } from './bus-jeu.js';
import {
    etat,
    flashVerrou,
    flashLignes,
    obtenirBiomeActif,
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
} from './store-jeu.js';
import {
    obtenirForme,
    obtenirCouleurPiece,
    estPositionValide,
    calculerDistanceChute,
    creerPieceRelique,
    creerPlateau,
    genererProchainePiece,
    activerReliqueSurPiece,
    reinitialiserLockDelay,
} from './piece-jeu.js';
import { enregistrerNotesLignesCompletes } from './melodie.js';
import { majStatsLignesEffacees, majStatsScorePartie } from './achievements.js';
import {
    enregistrerDonneesVerrouillage,
    signalerApparitionPiece,
    compterRotation,
    compterMouvementLateral,
    compterHardDrop,
    compterHold,
    enregistrerLignesParNiveau,
} from './profil-jeu.js';
import { sauvegarderPlacementOracle, declencherCalculOracle } from './oracle-jeu.js';
import { annoncer, annoncerPieceCourante } from './annonces.js';
import {
    vivant_enregistrerDepot,
    vivant_recompenserActivite,
    vivant_synchroniserApresLignes,
    vivant_enregistrerLignesScore,
} from './vivant.js';
import { poserPieceSurPlateau } from './actions-piece-communes.js';
import { obtenirControlesInversesBoss, obtenirDecalageDistorsionBoss } from './boss-jeu.js';
import {
    obtenirVitesseChuteModifiee,
    enregistrerTimestampCellules,
    actionMiroir,
    biomeActuelMecanique,
    celluleEstRouillee,
    reinitialiserMatricesRouille,
} from './mecaniques-histoire.js';
import {
    vitesseHistoireMs,
    enregistrerPosePiece,
    estMondeZenActif,
    enregistrerTopOut,
    suiviDifficulteActif,
} from './gestionnaire-difficulte.js';
import { store } from './store-core.js';
import { appliquerScoreLignes } from './score-partie.js';
import { modeHistoireEnCours } from './mode-histoire.js';

export { appliquerScoreLignes } from './score-partie.js';

let _poseApresRotation = false;

function produireProchainePieceApresShift() {
    if (obtenirReliqueEnAttente()) {
        definirReliqueEnAttente(false);
        const relique = RELIQUES[obtenirBiomeActif()] ?? RELIQUES.classique;
        etat.filePieces.unshift(creerPieceRelique(relique));
    } else {
        etat.filePieces.push(genererProchainePiece());
    }
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
        _poseApresRotation &&
        pieceVerrou.type === 'T' &&
        pieceVerrou.x != null &&
        pieceVerrou.y != null
            ? detecterTSpin(etat.plateau, pieceVerrou, formeVerrou)
            : null;
    _poseApresRotation = false;

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
            _recupererZenApresTopOut();
            return;
        }
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

    emettre('partie:nouvelle-piece');
    signalerApparitionPiece();
    annoncerPieceCourante();
    declencherCalculOracle();

    if (!estPositionValide(etat.pieceActuelle)) {
        if (modeHistoireEnCours() && estMondeZenActif()) {
            _recupererZenApresTopOut();
            return;
        }
        obtenirActions().terminerPartie?.();
    }
}

function _recupererZenApresTopOut() {
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

export function jouable() {
    return etat.estEnCours && !etat.estEnPause && etat.pieceActuelle !== null;
}

function deplacerGaucheReel() {
    if (!jouable()) return;
    _poseApresRotation = false;
    if (estPositionValide(etat.pieceActuelle, -1, 0)) {
        etat.pieceActuelle.x--;
        emettre('piece:son', { type: 'deplacement' });
        reinitialiserLockDelay();
        compterMouvementLateral();
    }
}

function deplacerDroiteReel() {
    if (!jouable()) return;
    _poseApresRotation = false;
    if (estPositionValide(etat.pieceActuelle, 1, 0)) {
        etat.pieceActuelle.x++;
        emettre('piece:son', { type: 'deplacement' });
        reinitialiserLockDelay();
        compterMouvementLateral();
    }
}

export function deplacerGauche() {
    if (meteo.controleInverse || obtenirControlesInversesBoss()) {
        deplacerDroiteReel();
        return;
    }
    deplacerGaucheReel();
}

export function deplacerDroite() {
    if (meteo.controleInverse || obtenirControlesInversesBoss()) {
        deplacerGaucheReel();
        return;
    }
    deplacerDroiteReel();
}

export function deplacerBas() {
    if (actionMiroir('bas') === 'chute') {
        chuteRapide();
        return;
    }
    if (!jouable()) return;
    _poseApresRotation = false;
    if (estPositionValide(etat.pieceActuelle, 0, 1)) {
        etat.pieceActuelle.y++;
        etat.score++;
        definirPieceAuSol(false);
        definirLockDelayRestant(0);
        emettre('partie:stats');
    }
}

export function chuteRapide() {
    if (actionMiroir('chute') === 'bas') {
        if (!jouable()) return;
        if (estPositionValide(etat.pieceActuelle, 0, 1)) {
            etat.pieceActuelle.y++;
            etat.score++;
            definirPieceAuSol(false);
            definirLockDelayRestant(0);
            emettre('partie:stats');
        }
        return;
    }
    if (!jouable()) return;
    _poseApresRotation = false;
    if (meteo.etat === ETATS_METEO.ACTIF && meteo.evenementActuel?.effet === 'microgravite') return;
    compterHardDrop();
    const dist = calculerDistanceChute(etat.pieceActuelle);
    etat.pieceActuelle.y += dist;
    etat.score += dist * 2;
    AudioMoteur.son('chute');
    emettre('partie:stats');
    verrouillerPiece();
}

export function tourner(sens) {
    if (!jouable()) return;
    const piece = etat.pieceActuelle;
    const nbRots = TETROMINOS[piece.type].rotations.length;
    const rotationCible = (((piece.rotation + sens) % nbRots) + nbRots) % nbRots;
    const essais = obtenirEssaisKick(piece.type, piece.rotation, rotationCible);

    for (const [dx, dy] of essais) {
        if (estPositionValide(piece, dx, dy, rotationCible)) {
            piece.rotation = rotationCible;
            piece.x += dx;
            piece.y += dy;
            _poseApresRotation = true;
            emettre('piece:son', { type: 'rotation' });
            reinitialiserLockDelay();
            compterRotation();
            annoncer('Pièce tournée');
            return;
        }
    }
}

/** Copie profonde de la forme relique : evite le partage de reference entre hold et piece active. */
function copierReliqueForme(forme) {
    return Array.isArray(forme) ? forme.map((ligne) => [...ligne]) : forme;
}

export function utiliserReserve() {
    if (!jouable()) return;
    if (etat.reserveUtilisee) return;

    const typeActuel = etat.pieceActuelle.type;

    if (!etat.pieceEnReserve) {
        etat.pieceEnReserve = {
            type: typeActuel,
            rotation: 0,
            reliqueForme: copierReliqueForme(etat.pieceActuelle.reliqueForme),
            reliqueData: etat.pieceActuelle.reliqueData,
        };
        etat.pieceActuelle = etat.filePieces.shift();
        activerReliqueSurPiece(etat.pieceActuelle);
        produireProchainePieceApresShift();
        definirReliqueActive(null);
        emettre('partie:nouvelle-piece');
    } else {
        const reserve = etat.pieceEnReserve;
        etat.pieceEnReserve = {
            type: typeActuel,
            rotation: 0,
            reliqueForme: copierReliqueForme(etat.pieceActuelle.reliqueForme),
            reliqueData: etat.pieceActuelle.reliqueData,
        };
        etat.pieceActuelle = {
            type: reserve.type,
            rotation: 0,
            reliqueForme: reserve.reliqueForme,
            reliqueData: reserve.reliqueData,
            x: 0,
            y: 0,
        };
        activerReliqueSurPiece(etat.pieceActuelle);
    }

    const forme = obtenirForme(etat.pieceActuelle);
    etat.pieceActuelle.x = Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2);
    etat.pieceActuelle.y = 0;
    _poseApresRotation = false;
    etat.reserveUtilisee = true;
    compterHold();
    emettre('piece:son', { type: 'hold' });
    annoncer('Réserve utilisée');
    reinitialiserLockDelay();
    signalerApparitionPiece();
    annoncerPieceCourante();
    declencherCalculOracle();
    emettre('partie:reserve-preview', { reserve: etat.pieceEnReserve });
}

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
