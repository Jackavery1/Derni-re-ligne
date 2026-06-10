import { CONFIG, TETROMINOS } from './config.js';
import { AudioMoteur } from './audio.js';
import { meteo, ETATS_METEO } from './meteo.js';
import { emettre } from './bus-jeu.js';
import {
    etat,
    definirLockDelayRestant,
    definirNbLockResets,
    definirPieceAuSol,
} from './store-jeu.js';
import {
    obtenirForme,
    estPositionValide,
    calculerDistanceChute,
    activerReliqueSurPiece,
    reinitialiserLockDelay,
} from './piece-jeu.js';
import {
    compterRotation,
    compterMouvementLateral,
    compterHardDrop,
    compterHold,
    signalerApparitionPiece,
} from './profil-jeu.js';
import { declencherCalculOracle } from './oracle-jeu.js';
import { annoncer, annoncerPieceCourante } from './annonces.js';
import { actionMiroir } from './mecaniques-histoire.js';
import { obtenirControlesInversesBoss } from './boss-jeu.js';
import { obtenirEssaisKick } from './logique-pure.js';
import { marquerPoseApresRotation, reinitialiserPoseApresRotation } from './logique-partie-pose.js';
import { verrouillerPiece } from './logique-partie-verrouillage.js';
import { produireProchainePieceApresHold } from './logique-partie-hold.js';

export function jouable() {
    return etat.estEnCours && !etat.estEnPause && etat.pieceActuelle !== null;
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
    reinitialiserPoseApresRotation();
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
    emettre('partie:reserve-preview', { reserve: etat.pieceEnReserve });
}
