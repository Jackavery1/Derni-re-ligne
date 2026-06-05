import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config.js';
import { etat } from '../js/store-jeu.js';
import { creerPlateau } from '../js/piece-jeu.js';
import {
    coop,
    DEMI_LARGEUR,
    coop_nouvellePiece,
    coop_estPositionValide,
    coop_verifierLignes,
    reinitialiserEtatCoop,
} from '../js/coop-logique.js';

describe('coop-logique', () => {
    beforeEach(() => {
        coop.actif = true;
        reinitialiserEtatCoop();
    });

    it('coop_nouvellePiece place J1 dans la moitié gauche', () => {
        const piece = coop_nouvellePiece('j1');
        expect(piece.joueur).toBe('j1');
        expect(piece.x).toBeGreaterThanOrEqual(0);
        expect(piece.x + 3).toBeLessThanOrEqual(DEMI_LARGEUR);
    });

    it('coop_nouvellePiece place J2 dans la moitié droite', () => {
        const piece = coop_nouvellePiece('j2');
        expect(piece.joueur).toBe('j2');
        expect(piece.x).toBeGreaterThanOrEqual(DEMI_LARGEUR);
        expect(piece.x).toBeLessThan(CONFIG.colonnes);
    });

    it('coop_estPositionValide empêche le débordement dans la zone adverse', () => {
        const pieceJ1 = { type: 'I', rotation: 0, x: 3, y: 10, joueur: 'j1' };
        expect(coop_estPositionValide(pieceJ1, 2, 0)).toBe(false);

        const pieceJ2 = { type: 'I', rotation: 0, x: 6, y: 10, joueur: 'j2' };
        expect(coop_estPositionValide(pieceJ2, -3, 0)).toBe(false);
    });

    it("coop_verifierLignes n'efface que si les deux moitiés sont complètes", () => {
        const l = CONFIG.lignes - 1;
        for (let c = 0; c < DEMI_LARGEUR; c++) etat.plateau[l][c] = '#00f5ff';
        for (let c = DEMI_LARGEUR; c < CONFIG.colonnes; c++) etat.plateau[l][c] = '#ff006e';

        const lignesAvant = coop.lignes;
        coop_verifierLignes();
        expect(coop.lignes).toBe(lignesAvant + 1);
        expect(etat.plateau[0].every((c) => c === 0)).toBe(true);
    });

    it('coop_verifierLignes ignore une moitié seule complète', () => {
        const l = CONFIG.lignes - 1;
        for (let c = 0; c < DEMI_LARGEUR; c++) etat.plateau[l][c] = '#00f5ff';
        const lignesAvant = coop.lignes;
        coop_verifierLignes();
        expect(coop.lignes).toBe(lignesAvant);
        expect(coop.lignesEnAttenteJ1).toBe(l);
    });

    it('coop_estPositionValide fonctionne sur plateau vide', () => {
        etat.plateau = creerPlateau();
        const piece = coop_nouvellePiece('j1');
        expect(coop_estPositionValide(piece)).toBe(true);
    });
});
