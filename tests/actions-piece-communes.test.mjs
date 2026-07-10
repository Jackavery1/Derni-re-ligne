import { describe, it, expect } from 'vitest';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import {
    poserPieceSurPlateau,
    vitesseChuteDepuisNiveau,
    deplacerPieceSiValide,
    tenterRotationSimple,
    tenterRotationSrs,
    calculerSpawnXCoop,
    executerChuteRapide,
} from '../js/logique/actions-piece-communes.js';
import { estPositionValideSurPlateau } from '../js/logique/moteur-piece.js';
import { extraireForme } from '../js/logique/moteur-piece.js';
import { CONFIG } from '../js/config/config-jeu.js';

describe('actions-piece-communes', () => {
    it('poserPieceSurPlateau place les cellules', () => {
        const plateau = creerPlateau();
        const piece = { type: 'O', rotation: 0, x: 4, y: 18 };
        const { gameOver, cellulesPosees } = poserPieceSurPlateau(plateau, piece, '#fff');
        expect(gameOver).toBe(false);
        expect(cellulesPosees.length).toBe(4);
        expect(plateau[18][4]).toBe('#fff');
    });

    it('poserPieceSurPlateau détecte game over hors plateau', () => {
        const plateau = creerPlateau();
        const piece = { type: 'O', rotation: 0, x: 4, y: -1 };
        const { gameOver } = poserPieceSurPlateau(plateau, piece, '#fff');
        expect(gameOver).toBe(true);
    });

    it('vitesseChuteDepuisNiveau diminue avec le niveau', () => {
        expect(vitesseChuteDepuisNiveau(1)).toBeGreaterThan(vitesseChuteDepuisNiveau(10));
        expect(vitesseChuteDepuisNiveau(99)).toBe(CONFIG.vitesseMin);
    });

    it('calculerSpawnXCoop centre dans chaque moitié', () => {
        expect(calculerSpawnXCoop('j1', 2, 5)).toBe(1);
        expect(calculerSpawnXCoop('j2', 2, 5)).toBe(6);
    });

    it('deplacerPieceSiValide et executerChuteRapide', () => {
        const plateau = creerPlateau();
        const piece = { type: 'O', rotation: 0, x: 4, y: 0 };
        const estValide = (p, dx, dy) => {
            const forme = extraireForme(p);
            return estPositionValideSurPlateau(plateau, p, forme, dx, dy);
        };
        expect(deplacerPieceSiValide(piece, 0, 1, estValide)).toBe(true);
        const dist = executerChuteRapide(piece, estValide);
        expect(dist).toBeGreaterThan(0);
    });

    it('tenterRotationSimple tourne si valide', () => {
        const plateau = creerPlateau();
        const piece = { type: 'T', rotation: 0, x: 3, y: 0 };
        const ok = tenterRotationSimple(piece, 1, (p, dx, dy, rot) => {
            const forme = extraireForme(p, rot);
            return estPositionValideSurPlateau(plateau, p, forme, dx, dy);
        });
        expect(ok).toBe(true);
        expect(piece.rotation).toBe(1);
    });

    it('tenterRotationSrs applique les wall kicks guideline', () => {
        const plateau = creerPlateau();
        const piece = { type: 'T', rotation: 0, x: 3, y: 0 };
        const ok = tenterRotationSrs(piece, 1, (p, dx, dy, rot) => {
            const forme = extraireForme(p, rot);
            return estPositionValideSurPlateau(plateau, p, forme, dx, dy);
        });
        expect(ok).toBe(true);
        expect(piece.rotation).toBe(1);
    });
});
