import { TETROMINOS } from './config.js';
import { emettre } from './bus-jeu.js';
import { obtenirBouton } from './dom-utils.js';
import { coop, DEMI_LARGEUR, coop_rafraichirStats } from './coop-etat.js';
import {
    deplacerPieceSiValide,
    tenterRotationSrs,
    calculerSpawnXCoop,
    executerChuteRapide,
} from './actions-piece-communes.js';
import {
    coopAreActive,
    coopBufferiserInput,
    coopPieceControlesActifs,
    coopQuitterSolPiece,
    coopDemarrerGraceSpawn,
} from './coop-game-feel.js';
import {
    coop_reinitialiserLockDelay,
    coop_estPositionValide,
    coop_verrouillerPiece,
    coop_nouvellePiece,
} from './coop-logique-piece.js';

/** @param {'j1' | 'j2'} joueur @param {'gauche' | 'droite' | 'bas' | 'chute'} action */
function coopTenterBufferMouvement(joueur, action) {
    if (!coop[joueur].pieceActuelle || !coop.estEnCours) return false;
    if (coop.estEnPause || coopAreActive(joueur)) {
        coopBufferiserInput(joueur, action);
        return true;
    }
    return false;
}

/** @param {'j1' | 'j2'} joueur */
export function coop_deplacerGauche(joueur) {
    if (coopTenterBufferMouvement(joueur, 'gauche')) return;
    if (!coopPieceControlesActifs(joueur)) return;
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p) return;
    jData.poseApresRotation = false;
    if (deplacerPieceSiValide(p, -1, 0, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy))) {
        emettre('piece:son', { type: 'deplacement' });
        coop_reinitialiserLockDelay(joueur);
    }
}

/** @param {'j1' | 'j2'} joueur */
export function coop_deplacerDroite(joueur) {
    if (coopTenterBufferMouvement(joueur, 'droite')) return;
    if (!coopPieceControlesActifs(joueur)) return;
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p) return;
    jData.poseApresRotation = false;
    if (deplacerPieceSiValide(p, 1, 0, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy))) {
        emettre('piece:son', { type: 'deplacement' });
        coop_reinitialiserLockDelay(joueur);
    }
}

/** @param {'j1' | 'j2'} joueur */
export function coop_deplacerBas(joueur) {
    if (coopTenterBufferMouvement(joueur, 'bas')) return;
    if (!coopPieceControlesActifs(joueur)) return;
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p) return;
    jData.poseApresRotation = false;
    if (deplacerPieceSiValide(p, 0, 1, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy))) {
        coop.score += 1;
        coop_rafraichirStats();
        coopQuitterSolPiece(joueur);
    }
}

/** @param {'j1' | 'j2'} joueur @param {number} sens */
export function coop_tourner(joueur, sens) {
    const jData = coop[joueur];
    if (!jData.pieceActuelle || !coop.estEnCours || coop.estEnPause) {
        if (jData.pieceActuelle && coop.estEnCours) {
            coopBufferiserInput(joueur, sens > 0 ? 'tourner_cw' : 'tourner_ccw');
        }
        return;
    }
    if (coopAreActive(joueur)) {
        coopBufferiserInput(joueur, sens > 0 ? 'tourner_cw' : 'tourner_ccw');
        return;
    }
    if (!coopPieceControlesActifs(joueur)) return;
    const p = jData.pieceActuelle;
    if (!p) return;
    if (
        tenterRotationSrs(p, sens, (piece, dx, dy, rotation) =>
            coop_estPositionValide(piece, dx, dy, rotation)
        )
    ) {
        jData.poseApresRotation = true;
        emettre('piece:son', { type: 'rotation' });
        coop_reinitialiserLockDelay(joueur);
    }
}

/** @param {'j1' | 'j2'} joueur */
export function coop_chuteRapide(joueur) {
    if (coopTenterBufferMouvement(joueur, 'chute')) return;
    if (!coopPieceControlesActifs(joueur)) return;
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p) return;
    jData.poseApresRotation = false;
    const dist = executerChuteRapide(p, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy));
    coop.score += dist * 2;
    coop_rafraichirStats();
    emettre('piece:son', { type: 'chute' });
    coop_verrouillerPiece(joueur);
}

/** @param {'j1' | 'j2'} joueur */
export function coop_utiliserReserve(joueur) {
    const jData = coop[joueur];
    if (!jData.pieceActuelle || !coop.estEnCours || coop.estEnPause) {
        if (jData.pieceActuelle && coop.estEnCours) coopBufferiserInput(joueur, 'hold');
        return;
    }
    if (coopAreActive(joueur)) {
        coopBufferiserInput(joueur, 'hold');
        return;
    }
    if (!coopPieceControlesActifs(joueur)) return;
    if (jData.reserveUtilisee) return;

    const typeActuel = jData.pieceActuelle.type;

    if (!jData.pieceEnReserve) {
        jData.pieceEnReserve = { type: typeActuel, rotation: 0 };
        jData.pieceActuelle = jData.prochainePiece;
        jData.prochainePiece = coop_nouvellePiece(joueur);
    } else {
        const typeRess = jData.pieceEnReserve.type;
        jData.pieceEnReserve = { type: typeActuel, rotation: 0 };
        jData.pieceActuelle = { type: typeRess, rotation: 0, x: 0, y: 0, joueur };
    }

    const forme = TETROMINOS[jData.pieceActuelle.type].rotations[0];
    jData.pieceActuelle.x = calculerSpawnXCoop(joueur, forme[0].length, DEMI_LARGEUR);
    jData.pieceActuelle.y = 0;
    jData.pieceActuelle.joueur = joueur;
    jData.reserveUtilisee = true;
    jData.poseApresRotation = false;
    jData.pieceAuSol = false;
    jData.lockDelayRestant = 0;
    jData.nbLockResets = 0;
    emettre('piece:son', { type: 'hold' });
    coopDemarrerGraceSpawn(joueur);
}

/** @param {'j1' | 'j2'} joueur */
export function utiliserPasserelle(joueur) {
    const jData = coop[joueur];
    const cible = joueur === 'j1' ? 'j2' : 'j1';
    const cibleD = coop[cible];

    if (!jData.passerelleDisponible || coop.estEnPause) return;

    const pieceAEnvoyer = jData.prochainePiece;
    pieceAEnvoyer.joueur = cible;
    const forme = TETROMINOS[pieceAEnvoyer.type].rotations[0];
    pieceAEnvoyer.x = calculerSpawnXCoop(cible, forme[0].length, DEMI_LARGEUR);
    pieceAEnvoyer.y = 0;

    const ancienneProchaine = cibleD.prochainePiece;
    cibleD.prochainePiece = pieceAEnvoyer;
    jData.prochainePiece = ancienneProchaine;
    jData.prochainePiece.joueur = joueur;
    const formeR = TETROMINOS[jData.prochainePiece.type].rotations[0];
    jData.prochainePiece.x = calculerSpawnXCoop(joueur, formeR[0].length, DEMI_LARGEUR);

    jData.passerelleDisponible = false;
    const btn = obtenirBouton(`btn-passerelle-${joueur}`);
    if (btn) btn.disabled = true;

    if (typeof document !== 'undefined') {
        const notif = document.getElementById('notif-niveau');
        if (notif) {
            notif.textContent = `⇒ PASSEUR ${joueur.toUpperCase()} !`;
            notif.classList.remove('notif-synchro');
            notif.classList.add('notif-niveau-vert');
            notif.classList.remove('visible');
            void notif.offsetWidth;
            notif.classList.add('visible');
        }
    }
}
