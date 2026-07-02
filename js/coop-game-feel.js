import { CONFIG } from './config.js';
import { coop } from './coop-etat.js';

export function coopReinitialiserGameFeelJoueur(joueur) {
    const j = coop[joueur];
    j.areRestant = 0;
    j.spawnGraceRestant = 0;
    j.coyoteRestant = 0;
    j.inputBuffer = null;
}

export function coopDemarrerAre(joueur) {
    coop[joueur].areRestant = CONFIG.areMs;
}

export function coopDemarrerGraceSpawn(joueur) {
    coop[joueur].spawnGraceRestant = CONFIG.spawnGraceMs;
}

export function coopDemarrerCoyote(joueur) {
    coop[joueur].coyoteRestant = CONFIG.coyoteTimeMs;
}

export function coopAreActive(joueur) {
    return coop[joueur].areRestant > 0;
}

export function coopGraceSpawnActive(joueur) {
    return coop[joueur].spawnGraceRestant > 0;
}

export function coopCoyoteActif(joueur) {
    return coop[joueur].coyoteRestant > 0;
}

/** @param {'tourner_cw' | 'tourner_ccw' | 'hold'} action */
export function coopBufferiserInput(joueur, action) {
    coop[joueur].inputBuffer = action;
}

export function coopPieceControlesActifs(joueur) {
    return (
        coop.estEnCours &&
        !coop.estEnPause &&
        coop[joueur].pieceActuelle !== null &&
        !coopAreActive(joueur)
    );
}

export function coopActiverPieceAuSol(joueur) {
    const j = coop[joueur];
    if (coopCoyoteActif(joueur)) {
        j.pieceAuSol = true;
        j.coyoteRestant = 0;
        return;
    }
    j.pieceAuSol = true;
    j.lockDelayRestant = CONFIG.lockDelay;
    j.nbLockResets = 0;
}

export function coopQuitterSolPiece(joueur) {
    const j = coop[joueur];
    if (j.pieceAuSol) coopDemarrerCoyote(joueur);
    j.pieceAuSol = false;
    if (!coopCoyoteActif(joueur)) j.lockDelayRestant = 0;
}

/**
 * @param {'j1' | 'j2'} joueur
 * @param {number} dt
 * @param {{ pieceValide: () => boolean, surCollision?: () => void, actions?: { tourner?: (sens: number) => void, reserve?: () => void } }} opts
 */
export function coopMettreAJourGameFeel(joueur, dt, opts) {
    const j = coop[joueur];
    if (j.areRestant > 0) j.areRestant = Math.max(0, j.areRestant - dt);
    if (j.spawnGraceRestant > 0) j.spawnGraceRestant = Math.max(0, j.spawnGraceRestant - dt);
    if (j.coyoteRestant > 0 && !j.pieceAuSol) {
        j.coyoteRestant = Math.max(0, j.coyoteRestant - dt);
    }

    coopConsommerBufferInput(joueur, opts.actions);
    if (j.pieceActuelle && !opts.pieceValide() && !coopGraceSpawnActive(joueur)) {
        opts.surCollision?.();
    }
}

/**
 * @param {'j1' | 'j2'} joueur
 * @param {{ tourner?: (sens: number) => void, reserve?: () => void } | undefined} actions
 */
export function coopConsommerBufferInput(joueur, actions) {
    const j = coop[joueur];
    const action = j.inputBuffer;
    if (!action || coopAreActive(joueur)) return;
    if (!coop.estEnCours || coop.estEnPause || !j.pieceActuelle) return;
    j.inputBuffer = null;
    switch (action) {
        case 'tourner_cw':
            actions?.tourner?.(1);
            break;
        case 'tourner_ccw':
            actions?.tourner?.(-1);
            break;
        case 'hold':
            actions?.reserve?.();
            break;
    }
}
