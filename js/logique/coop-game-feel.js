import { CONFIG } from '../config/config-jeu.js';
import { coop } from './coop-etat.js';
import {
    ajouterBufferInput,
    creerBufferInputVide,
    premierBufferInput,
    retirerPremierBufferInput,
} from './buffer-input-jeu.js';

/** @typedef {'tourner_cw' | 'tourner_ccw' | 'hold' | 'gauche' | 'droite' | 'bas' | 'chute'} CoopInputBuffer */

const EXECUTEURS_BUFFER = {
    tourner_cw: (actions) => actions?.tourner?.(1),
    tourner_ccw: (actions) => actions?.tourner?.(-1),
    hold: (actions) => actions?.reserve?.(),
    gauche: (actions) => actions?.gauche?.(),
    droite: (actions) => actions?.droite?.(),
    bas: (actions) => actions?.bas?.(),
    chute: (actions) => actions?.chute?.(),
};

export function coopReinitialiserGameFeelJoueur(joueur) {
    const j = coop[joueur];
    j.areRestant = 0;
    j.spawnGraceRestant = 0;
    j.coyoteRestant = 0;
    j.inputBuffer = creerBufferInputVide();
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

/** @param {CoopInputBuffer} action */
export function coopBufferiserInput(joueur, action) {
    coop[joueur].inputBuffer = ajouterBufferInput(coop[joueur].inputBuffer, action);
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
 * @param {{ pieceValide: () => boolean, surCollision?: () => void, actions?: { tourner?: (sens: number) => void, reserve?: () => void, gauche?: () => void, droite?: () => void, bas?: () => void, chute?: () => void } }} opts
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
 * @param {{ tourner?: (sens: number) => void, reserve?: () => void, gauche?: () => void, droite?: () => void, bas?: () => void, chute?: () => void } | undefined} actions
 */
export function coopConsommerBufferInput(joueur, actions) {
    const j = coop[joueur];
    const action = premierBufferInput(j.inputBuffer);
    if (!action || coopAreActive(joueur)) return;
    if (!coop.estEnCours || coop.estEnPause || !j.pieceActuelle) return;
    const suivant = retirerPremierBufferInput(j.inputBuffer);
    j.inputBuffer = suivant.file;
    const actionConsommee = suivant.action;
    if (!actionConsommee) return;
    EXECUTEURS_BUFFER[actionConsommee]?.(actions);
}
