import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from '../js/config/config.js';
import { store, etat } from '../js/etat/store-jeu.js';
import {
    reinitialiserGameFeel,
    demarrerAre,
    demarrerGraceSpawn,
    demarrerCoyote,
    areActive,
    coyoteActif,
    bufferiserInput,
    consommerBufferInput,
    pieceControlesActifs,
    activerPieceAuSol,
    quitterSolPiece,
    verifierCollisionSpawn,
} from '../js/logique/game-feel-jeu.js';
import {
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
    obtenirLockDelayRestant,
    obtenirNbLockResets,
} from '../js/etat/store-etat-partie.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import { configurerActionsJeu, obtenirActions } from '../js/actions-jeu.js';

describe('game-feel-jeu', () => {
    beforeEach(() => {
        reinitialiserGameFeel();
        etat.estEnCours = true;
        etat.estEnPause = false;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau = creerPlateau();
        configurerActionsJeu({
            tourner: vi.fn(),
            utiliserReserve: vi.fn(),
            deplacerGauche: vi.fn(),
            terminerPartie: vi.fn(),
        });
    });

    it('ARE bloque les controles sans masquer la piece', () => {
        demarrerAre();
        expect(areActive()).toBe(true);
        expect(pieceControlesActifs()).toBe(false);
        expect(etat.pieceActuelle).not.toBeNull();
    });

    it('bufferise puis consomme une rotation apres ARE', () => {
        demarrerAre();
        bufferiserInput('tourner_cw');
        expect(store.inputBuffer).toEqual(['tourner_cw']);
        store.areRestant = 0;
        consommerBufferInput();
        expect(obtenirActions().tourner).toHaveBeenCalledWith(1);
        expect(store.inputBuffer).toEqual([]);
    });

    it('conserve deux inputs rapides sans écrasement', () => {
        bufferiserInput('gauche');
        bufferiserInput('tourner_cw');
        expect(store.inputBuffer).toEqual(['gauche', 'tourner_cw']);
        consommerBufferInput();
        expect(obtenirActions().deplacerGauche).toHaveBeenCalled();
        expect(store.inputBuffer).toEqual(['tourner_cw']);
    });

    it('bufferise puis consomme un deplacement lateral apres pause', () => {
        etat.estEnPause = true;
        bufferiserInput('gauche');
        expect(store.inputBuffer).toEqual(['gauche']);
        etat.estEnPause = false;
        consommerBufferInput();
        expect(obtenirActions().deplacerGauche).toHaveBeenCalled();
        expect(store.inputBuffer).toEqual([]);
    });

    it('grace spawn retarde le game over sur collision', () => {
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau[0][4] = 1;
        etat.plateau[0][5] = 1;
        demarrerGraceSpawn();
        verifierCollisionSpawn();
        expect(obtenirActions().terminerPartie).not.toHaveBeenCalled();
        store.spawnGraceRestant = 0;
        verifierCollisionSpawn();
        expect(obtenirActions().terminerPartie).toHaveBeenCalled();
    });

    it('grace spawn sprint plus longue que marathon', () => {
        etat.modeJeu = 'sprint';
        demarrerGraceSpawn();
        const sprint = store.spawnGraceRestant;
        etat.modeJeu = 'marathon';
        demarrerGraceSpawn();
        expect(sprint).toBeGreaterThan(store.spawnGraceRestant);
        expect(sprint).toBe(CONFIG.sprintSpawnGraceMs);
    });

    it('coyote preserve le lock delay au retour au sol', () => {
        definirPieceAuSol(true);
        definirLockDelayRestant(250);
        definirNbLockResets(2);
        demarrerCoyote();
        quitterSolPiece();
        expect(coyoteActif()).toBe(true);
        expect(obtenirLockDelayRestant()).toBe(250);
        activerPieceAuSol();
        expect(obtenirLockDelayRestant()).toBe(250);
        expect(obtenirNbLockResets()).toBe(2);
    });

    it('sans coyote, retour au sol reinitialise le lock delay', () => {
        definirPieceAuSol(false);
        store.coyoteRestant = 0;
        activerPieceAuSol();
        expect(obtenirLockDelayRestant()).toBe(CONFIG.lockDelay);
        expect(obtenirNbLockResets()).toBe(0);
    });
});
