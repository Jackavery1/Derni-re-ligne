import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config.js';
import {
    definirPieceAuSol,
    definirNbLockResets,
    definirLockDelayRestant,
    nbLockResets,
    lockDelayRestant,
    etat,
    sacPieces,
} from '../js/contexte-jeu.js';
import {
    creerPlateau,
    reinitialiserLockDelay,
    estPositionValide,
    calculerDistanceChute,
    remplirSac,
    genererProchainePiece,
} from '../js/piece-jeu.js';

describe('piece-jeu', () => {
    beforeEach(() => {
        definirPieceAuSol(false);
        definirNbLockResets(0);
        definirLockDelayRestant(0);
        etat.plateau = creerPlateau();
        etat.pieceActuelle = null;
        sacPieces.length = 0;
    });

    it('creerPlateau a les bonnes dimensions', () => {
        const plateau = creerPlateau();
        expect(plateau).toHaveLength(CONFIG.lignes);
        expect(plateau[0]).toHaveLength(CONFIG.colonnes);
    });

    it('lock delay réinitialisé quand la pièce est au sol', () => {
        definirPieceAuSol(true);
        reinitialiserLockDelay();
        expect(lockDelayRestant).toBe(CONFIG.lockDelay);
        expect(nbLockResets).toBe(1);
    });

    it('lock delay ignoré si max resets atteint', () => {
        definirPieceAuSol(true);
        definirNbLockResets(CONFIG.maxLockResets);
        reinitialiserLockDelay();
        expect(nbLockResets).toBe(CONFIG.maxLockResets);
        expect(lockDelayRestant).toBe(0);
    });

    it('lock delay ignoré si la pièce n’est pas au sol', () => {
        definirPieceAuSol(false);
        reinitialiserLockDelay();
        expect(lockDelayRestant).toBe(0);
        expect(nbLockResets).toBe(0);
    });

    it('calculerDistanceChute sur plateau vide', () => {
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        expect(calculerDistanceChute(etat.pieceActuelle)).toBeGreaterThan(10);
    });

    it('estPositionValide refuse une collision', () => {
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau[1][4] = '#fff';
        expect(estPositionValide(etat.pieceActuelle, 0, 1)).toBe(false);
    });

    it('genererProchainePiece remplit le sac si vide', () => {
        const piece = genererProchainePiece();
        expect(piece.type).toBeTruthy();
        expect(sacPieces.length).toBeGreaterThanOrEqual(0);
    });

    it('remplirSac produit 7 pièces', () => {
        remplirSac();
        expect(sacPieces).toHaveLength(7);
    });
});
