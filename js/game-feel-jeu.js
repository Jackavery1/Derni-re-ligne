import { CONFIG } from './config.js';
import { store, etat } from './store-core.js';
import {
    obtenirPieceAuSol,
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
} from './store-etat-partie.js';
import { estPositionValide } from './piece-jeu.js';
import { obtenirActions } from './actions-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { estMondeZenActif } from './gestionnaire-difficulte.js';

export function reinitialiserGameFeel() {
    store.areRestant = 0;
    store.spawnGraceRestant = 0;
    store.coyoteRestant = 0;
    store.inputBuffer = null;
}

export function demarrerAre() {
    store.areRestant = CONFIG.areMs;
}

export function demarrerGraceSpawn() {
    store.spawnGraceRestant = CONFIG.spawnGraceMs;
}

export function areActive() {
    return store.areRestant > 0;
}

export function graceSpawnActive() {
    return store.spawnGraceRestant > 0;
}

export function coyoteActif() {
    return store.coyoteRestant > 0;
}

/** @param {'tourner_cw' | 'tourner_ccw' | 'hold'} action */
export function bufferiserInput(action) {
    store.inputBuffer = action;
}

export function consommerBufferInput() {
    const action = store.inputBuffer;
    if (!action || areActive()) return;
    if (!etat.estEnCours || etat.estEnPause || !etat.pieceActuelle) return;
    store.inputBuffer = null;
    const actions = obtenirActions();
    switch (action) {
        case 'tourner_cw':
            actions.tourner?.(1);
            break;
        case 'tourner_ccw':
            actions.tourner?.(-1);
            break;
        case 'hold':
            actions.utiliserReserve?.();
            break;
    }
}

export function demarrerCoyote() {
    store.coyoteRestant = CONFIG.coyoteTimeMs;
}

export function pieceControlesActifs() {
    return etat.estEnCours && !etat.estEnPause && etat.pieceActuelle !== null && !areActive();
}

/**
 * @param {number} deltaTemps
 * @param {(zen: () => void) => void} [surCollisionSpawn]
 */
export function mettreAJourGameFeel(deltaTemps, surCollisionSpawn) {
    if (store.areRestant > 0) {
        store.areRestant = Math.max(0, store.areRestant - deltaTemps);
    }
    if (store.spawnGraceRestant > 0) {
        store.spawnGraceRestant = Math.max(0, store.spawnGraceRestant - deltaTemps);
    }
    if (store.coyoteRestant > 0 && !obtenirPieceAuSol()) {
        store.coyoteRestant = Math.max(0, store.coyoteRestant - deltaTemps);
    }

    consommerBufferInput();
    verifierCollisionSpawn(surCollisionSpawn);
}

/**
 * @param {(zen: () => void) => void} [surCollisionSpawn] callback recevant la recuperation zen
 */
export function verifierCollisionSpawn(surCollisionSpawn) {
    if (!etat.pieceActuelle || estPositionValide(etat.pieceActuelle)) return;
    if (graceSpawnActive()) return;
    if (modeHistoireEnCours() && estMondeZenActif()) {
        surCollisionSpawn?.();
        return;
    }
    obtenirActions().terminerPartie?.();
}

export function activerPieceAuSol() {
    if (coyoteActif()) {
        definirPieceAuSol(true);
        store.coyoteRestant = 0;
        return;
    }
    definirPieceAuSol(true);
    definirLockDelayRestant(CONFIG.lockDelay);
    definirNbLockResets(0);
}

export function quitterSolPiece() {
    if (obtenirPieceAuSol()) {
        demarrerCoyote();
    }
    definirPieceAuSol(false);
    if (!coyoteActif()) {
        definirLockDelayRestant(0);
    }
}
