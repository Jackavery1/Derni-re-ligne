import { TETROMINOS } from '../config/config.js';
import { meteo, ETATS_METEO } from './meteo.js';
import { emettre } from '../etat/bus-jeu.js';
import { etat, definirLockDelayRestant, definirPieceAuSol } from '../etat/store-jeu.js';
import { estPositionValide, calculerDistanceChute, reinitialiserLockDelay } from './piece-jeu.js';
import {
    compterRotation,
    compterMouvementLateral,
    compterHardDrop,
    compterHold,
    signalerApparitionPiece,
} from '../profil-jeu.js';
import { declencherCalculOracle } from './oracle-jeu.js';
import { annoncer, annoncerPieceCourante } from '../annonces.js';
import { actionMiroir } from '../mecaniques-histoire.js';
import { obtenirControlesInversesBoss } from '../boss-jeu.js';
import { obtenirEssaisKick } from './logique-pure.js';
import {
    areActive,
    bufferiserInput,
    pieceControlesActifs,
    demarrerGraceSpawn,
} from './game-feel-jeu.js';
import { marquerPoseApresRotation, reinitialiserPoseApresRotation } from './logique-partie-pose.js';
import { verrouillerPiece } from './logique-partie-verrouillage.js';
import { produireProchainePieceApresHold } from './logique-partie-hold.js';

export function jouable() {
    return pieceControlesActifs();
}

function tenterBufferMouvement(action) {
    if (!etat.pieceActuelle || !etat.estEnCours) return false;
    if (etat.estEnPause || areActive()) {
        bufferiserInput(action);
        return true;
    }
    return false;
}

function deplacerGaucheReel() {
    if (!jouable()) return;
    reinitialiserPoseApresRotation();
    if (estPositionValide(etat.pieceActuelle, -1, 0)) {
        etat.pieceActuelle.x--;
        emettre('piece:son', { type: 'deplacement' });
        reinitialiserLockDelay();
        compterMouvementLateral();
    }
}

function deplacerDroiteReel() {
    if (!jouable()) return;
    reinitialiserPoseApresRotation();
    if (estPositionValide(etat.pieceActuelle, 1, 0)) {
        etat.pieceActuelle.x++;
        emettre('piece:son', { type: 'deplacement' });
        reinitialiserLockDelay();
        compterMouvementLateral();
    }
}

export function deplacerGauche() {
    if (meteo.controleInverse || obtenirControlesInversesBoss()) {
        if (tenterBufferMouvement('droite')) return;
        deplacerDroiteReel();
        return;
    }
    if (tenterBufferMouvement('gauche')) return;
    deplacerGaucheReel();
}

export function deplacerDroite() {
    if (meteo.controleInverse || obtenirControlesInversesBoss()) {
        if (tenterBufferMouvement('gauche')) return;
        deplacerGaucheReel();
        return;
    }
    if (tenterBufferMouvement('droite')) return;
    deplacerDroiteReel();
}

export function deplacerBas() {
    if (actionMiroir('bas') === 'chute') {
        chuteRapide();
        return;
    }
    if (tenterBufferMouvement('bas')) return;
    reinitialiserPoseApresRotation();
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
        if (tenterBufferMouvement('bas')) return;
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
    if (!etat.pieceActuelle || !etat.estEnCours || etat.estEnPause) {
        bufferiserInput('chute');
        return;
    }
    if (areActive()) {
        bufferiserInput('chute');
        return;
    }
    if (!jouable()) return;
    reinitialiserPoseApresRotation();
    if (meteo.etat === ETATS_METEO.ACTIF && meteo.evenementActuel?.effet === 'microgravite') return;
    compterHardDrop();
    const dist = calculerDistanceChute(etat.pieceActuelle);
    etat.pieceActuelle.y += dist;
    etat.score += dist * 2;
    emettre('piece:son', { type: 'chute' });
    emettre('partie:stats');
    verrouillerPiece();
}

export function tourner(sens) {
    if (!etat.pieceActuelle || !etat.estEnCours || etat.estEnPause) {
        bufferiserInput(sens > 0 ? 'tourner_cw' : 'tourner_ccw');
        return;
    }
    if (areActive()) {
        bufferiserInput(sens > 0 ? 'tourner_cw' : 'tourner_ccw');
        return;
    }
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
            marquerPoseApresRotation();
            emettre('piece:son', { type: 'rotation' });
            reinitialiserLockDelay();
            compterRotation();
            annoncer('Pièce tournée');
            return;
        }
    }
}

export function utiliserReserve() {
    if (!etat.pieceActuelle || !etat.estEnCours || etat.estEnPause) {
        bufferiserInput('hold');
        return;
    }
    if (areActive()) {
        bufferiserInput('hold');
        return;
    }
    if (!jouable()) return;
    if (etat.reserveUtilisee) return;

    produireProchainePieceApresHold();
    reinitialiserPoseApresRotation();
    etat.reserveUtilisee = true;
    compterHold();
    emettre('piece:son', { type: 'hold' });
    annoncer('Réserve utilisée');
    reinitialiserLockDelay();
    signalerApparitionPiece();
    annoncerPieceCourante();
    declencherCalculOracle();
    demarrerGraceSpawn();
    emettre('partie:reserve-preview', { reserve: etat.pieceEnReserve });
}
