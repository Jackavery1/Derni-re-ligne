import { describe, it, expect } from 'vitest';
import {
    extraireForme,
    estPositionValideAvecBornes,
    estPositionValideSurPlateau,
    calculerDistanceChuteSurPlateau,
} from '../js/moteur-piece.js';
import { creerPlateau } from '../js/piece-jeu.js';

describe('moteur-piece', () => {
    it('extraireForme retourne la rotation courante', () => {
        const piece = { type: 'T', rotation: 1 };
        const forme = extraireForme(piece);
        expect(forme).toBeTruthy();
        expect(forme.length).toBeGreaterThan(0);
    });

    it('extraireForme avec rotation explicite', () => {
        const piece = { type: 'I', rotation: 0 };
        const forme0 = extraireForme(piece, 0);
        const forme1 = extraireForme(piece, 1);
        expect(forme0).not.toEqual(forme1);
    });

    it('extraireForme utilise reliqueForme si présente', () => {
        const forme = [[1, 1]];
        const piece = { type: 'O', rotation: 0, reliqueForme: forme };
        expect(extraireForme(piece)).toBe(forme);
    });

    it('estPositionValideAvecBornes respecte la zone J1', () => {
        const plateau = creerPlateau();
        const piece = { type: 'O', rotation: 0, x: 3, y: 0 };
        const forme = extraireForme(piece);
        expect(estPositionValideAvecBornes(plateau, piece, forme, 0, 0, 0, 5)).toBe(true);
        expect(estPositionValideAvecBornes(plateau, piece, forme, 2, 0, 0, 5)).toBe(false);
    });

    it('estPositionValideSurPlateau refuse collision', () => {
        const plateau = creerPlateau();
        plateau[1][4] = '#fff';
        const piece = { type: 'O', rotation: 0, x: 4, y: 0 };
        const forme = extraireForme(piece);
        expect(estPositionValideSurPlateau(plateau, piece, forme, 0, 1)).toBe(false);
    });

    it('calculerDistanceChuteSurPlateau sur plateau vide', () => {
        const plateau = creerPlateau();
        const piece = { type: 'O', rotation: 0, x: 4, y: 0 };
        const estValide = (p, dx, dy) => {
            const forme = extraireForme(p);
            return estPositionValideSurPlateau(plateau, p, forme, dx, dy);
        };
        expect(calculerDistanceChuteSurPlateau(plateau, piece, estValide)).toBeGreaterThan(10);
    });
});
