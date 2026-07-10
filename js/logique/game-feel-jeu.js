import {
    ajouterBufferInput,
    creerBufferInputVide,
    premierBufferInput,
    retirerPremierBufferInput,
} from './buffer-input-jeu.js';
import { CONFIG } from '../config/config-jeu.js';
import { store, etat } from '../etat/store-jeu.js';
import {
    obtenirPieceAuSol,
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
} from '../etat/store-etat-partie.js';
import { estPositionValide } from './piece-jeu.js';
import { emettre } from '../etat/bus-jeu.js';
import { obtenirActions } from './actions-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { estMondeZenActif } from './gestionnaire-difficulte.js';

export function reinitialiserGameFeel() {
    store.areRestant = 0;
    store.spawnGraceRestant = 0;
    store.coyoteRestant = 0;
    store.inputBuffer = creerBufferInputVide();
}

export function demarrerAre() {
    store.areRestant = CONFIG.areMs;
}

export function demarrerGraceSpawn() {
    const graceMs = etat.modeJeu === 'sprint' ? CONFIG.sprintSpawnGraceMs : CONFIG.spawnGraceMs;
    store.spawnGraceRestant = graceMs;
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

/** @param {'tourner_cw' | 'tourner_ccw' | 'hold' | 'gauche' | 'droite' | 'bas' | 'chute'} action */
export function bufferiserInput(action) {
    store.inputBuffer = ajouterBufferInput(store.inputBuffer, action);
}

export function consommerBufferInput() {
    const action = premierBufferInput(store.inputBuffer);
    if (!action || areActive()) return;
    if (!etat.estEnCours || etat.estEnPause || !etat.pieceActuelle) return;
    const suivant = retirerPremierBufferInput(store.inputBuffer);
    store.inputBuffer = suivant.file;
    const actionConsommee = suivant.action;
    if (!actionConsommee) return;
    const actions = obtenirActions();
    switch (actionConsommee) {
        case 'tourner_cw':
            actions.tourner?.(1);
            break;
        case 'tourner_ccw':
            actions.tourner?.(-1);
            break;
        case 'hold':
            actions.utiliserReserve?.();
            break;
        case 'gauche':
            actions.deplacerGauche?.();
            break;
        case 'droite':
            actions.deplacerDroite?.();
            break;
        case 'bas':
            actions.deplacerBas?.();
            break;
        case 'chute':
            actions.chuteRapide?.();
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
 * @param {() => void} [surCollisionSpawn]
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
 * @param {() => void} [surCollisionSpawn] recuperation zen (monde paradoxe)
 */
export function verifierCollisionSpawn(surCollisionSpawn) {
    if (!etat.pieceActuelle || estPositionValide(etat.pieceActuelle)) return;
    if (graceSpawnActive()) return;
    if (modeHistoireEnCours() && estMondeZenActif()) {
        surCollisionSpawn?.();
        return;
    }
    emettre('partie:topout');
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
