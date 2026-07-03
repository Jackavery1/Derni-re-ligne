import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from '../js/config.js';
import { coop } from '../js/coop-etat.js';
import {
    coopReinitialiserGameFeelJoueur,
    coopDemarrerAre,
    coopDemarrerGraceSpawn,
    coopDemarrerCoyote,
    coopAreActive,
    coopGraceSpawnActive,
    coopCoyoteActif,
    coopBufferiserInput,
    coopPieceControlesActifs,
    coopActiverPieceAuSol,
    coopQuitterSolPiece,
    coopMettreAJourGameFeel,
} from '../js/coop-game-feel.js';

describe('coop-game-feel', () => {
    beforeEach(() => {
        coop.estEnCours = true;
        coop.estEnPause = false;
        coop.j1 = {
            pieceActuelle: { type: 'O', rotation: 0, x: 1, y: 0, joueur: 'j1' },
            pieceAuSol: false,
            lockDelayRestant: 0,
            nbLockResets: 0,
            areRestant: 0,
            spawnGraceRestant: 0,
            coyoteRestant: 0,
            inputBuffer: [],
        };
        coopReinitialiserGameFeelJoueur('j1');
        coop.j1.pieceActuelle = { type: 'O', rotation: 0, x: 1, y: 0, joueur: 'j1' };
    });

    it('ARE bloque les contrôles sans masquer la pièce', () => {
        coopDemarrerAre('j1');
        expect(coopAreActive('j1')).toBe(true);
        expect(coopPieceControlesActifs('j1')).toBe(false);
        expect(coop.j1.pieceActuelle).not.toBeNull();
    });

    it('bufferise puis consomme une rotation après ARE', () => {
        coopDemarrerAre('j1');
        coopBufferiserInput('j1', 'tourner_cw');
        expect(coop.j1.inputBuffer).toEqual(['tourner_cw']);
        coop.j1.areRestant = 0;
        const tourner = vi.fn();
        coopMettreAJourGameFeel('j1', 16, {
            pieceValide: () => true,
            actions: { tourner },
        });
        expect(tourner).toHaveBeenCalledWith(1);
        expect(coop.j1.inputBuffer).toEqual([]);
    });

    it('conserve deux inputs coop sans écrasement', () => {
        coopBufferiserInput('j1', 'gauche');
        coopBufferiserInput('j1', 'tourner_cw');
        expect(coop.j1.inputBuffer).toEqual(['gauche', 'tourner_cw']);
        const gauche = vi.fn();
        coopMettreAJourGameFeel('j1', 16, {
            pieceValide: () => true,
            actions: { gauche },
        });
        expect(gauche).toHaveBeenCalled();
        expect(coop.j1.inputBuffer).toEqual(['tourner_cw']);
    });

    it('bufferise puis consomme un déplacement après pause', () => {
        coop.estEnPause = true;
        coopBufferiserInput('j1', 'gauche');
        expect(coop.j1.inputBuffer).toEqual(['gauche']);
        coop.estEnPause = false;
        const gauche = vi.fn();
        coopMettreAJourGameFeel('j1', 16, {
            pieceValide: () => true,
            actions: { gauche },
        });
        expect(gauche).toHaveBeenCalled();
        expect(coop.j1.inputBuffer).toEqual([]);
    });

    it('grace spawn retarde le game over sur collision', () => {
        const surCollision = vi.fn();
        coopDemarrerGraceSpawn('j1');
        expect(coopGraceSpawnActive('j1')).toBe(true);
        coopMettreAJourGameFeel('j1', 16, {
            pieceValide: () => false,
            surCollision,
        });
        expect(surCollision).not.toHaveBeenCalled();
        coop.j1.spawnGraceRestant = 0;
        coopMettreAJourGameFeel('j1', 16, {
            pieceValide: () => false,
            surCollision,
        });
        expect(surCollision).toHaveBeenCalled();
    });

    it('coyote préserve le lock delay au retour au sol', () => {
        coop.j1.pieceAuSol = true;
        coop.j1.lockDelayRestant = 250;
        coop.j1.nbLockResets = 2;
        coopDemarrerCoyote('j1');
        coopQuitterSolPiece('j1');
        expect(coopCoyoteActif('j1')).toBe(true);
        expect(coop.j1.lockDelayRestant).toBe(250);
        coopActiverPieceAuSol('j1');
        expect(coop.j1.lockDelayRestant).toBe(250);
        expect(coop.j1.nbLockResets).toBe(2);
    });

    it('sans coyote, retour au sol réinitialise le lock delay', () => {
        coop.j1.pieceAuSol = false;
        coop.j1.coyoteRestant = 0;
        coopActiverPieceAuSol('j1');
        expect(coop.j1.lockDelayRestant).toBe(CONFIG.lockDelay);
        expect(coop.j1.nbLockResets).toBe(0);
    });
});
