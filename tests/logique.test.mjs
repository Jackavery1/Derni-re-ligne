import { describe, it, expect } from 'vitest';
import {
    remplirSac,
    verifierSacValide,
    obtenirEssaisKick,
    compterLignesCompletes,
    supprimerLignesDuPlateau,
    estPositionValidePlateau,
    estPositionValideAvecForme,
    calculerPointsLignes,
    calculerNiveauDepuisLignes,
    detecterTSpin,
    calculerPointsTSpin,
    supprimerLignesDuPlateauExcluantRouille,
} from '../js/logique-pure.js';
import { CONFIG } from '../js/config.js';

describe('logique-pure', () => {
    it('Sac 7-bag contient 7 pièces uniques', () => {
        const sac = remplirSac();
        expect(verifierSacValide(sac)).toBe(true);
    });

    it('SRS : pièce O un seul kick', () => {
        expect(obtenirEssaisKick('O', 0, 1)).toHaveLength(1);
    });

    it('SRS : pièce I a 5 essais en rotation horaire', () => {
        expect(obtenirEssaisKick('I', 0, 1)).toHaveLength(5);
    });

    it('Position valide sur plateau vide', () => {
        const plateau = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
        const forme = [
            [1, 1],
            [1, 1],
        ];
        expect(estPositionValidePlateau(plateau, { x: 4, y: 0 }, forme)).toBe(true);
    });

    it('estPositionValideAvecForme refuse hors limites', () => {
        const plateau = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
        const forme = [[1, 1, 1, 1]];
        expect(estPositionValideAvecForme(plateau, { x: -1, y: 0 }, forme)).toBe(false);
    });

    it('verifierSacValide rejette un sac incomplet', () => {
        expect(verifierSacValide(['I', 'O'])).toBe(false);
    });

    it('supprimerLignesDuPlateau ne modifie pas sans ligne complète', () => {
        const plateau = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
        plateau[5][3] = '#fff';
        const { nbSupprimees, plateau: sortie } = supprimerLignesDuPlateau(plateau);
        expect(nbSupprimees).toBe(0);
        expect(sortie).toBe(plateau);
    });

    it('Ligne complète détectée', () => {
        const plateau = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
        plateau[19].fill('#00f5ff');
        expect(compterLignesCompletes(plateau)).toBe(1);
    });

    it('Points Tetris niveau 1', () => {
        expect(calculerPointsLignes(4, 1)).toBe(800);
    });

    it('Points double niveau 3', () => {
        expect(calculerPointsLignes(2, 3)).toBe(900);
    });

    it('Niveau depuis lignes', () => {
        expect(calculerNiveauDepuisLignes(0)).toBe(1);
        expect(calculerNiveauDepuisLignes(10)).toBe(2);
        expect(calculerNiveauDepuisLignes(25)).toBe(3);
    });

    it('supprimerLignesDuPlateauExcluantRouille ignore les lignes rouillées', () => {
        const plateau = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
        plateau[19].fill('#8b4513');
        const estRouillee = (x, y) => y === 19 && x === 2;
        const { nbSupprimees } = supprimerLignesDuPlateauExcluantRouille(plateau, estRouillee);
        expect(nbSupprimees).toBe(0);
    });

    it('detecterTSpin retourne full avec 3 coins remplis', () => {
        const plateau = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
        const piece = { type: 'T', rotation: 0, x: 4, y: 17 };
        const forme = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
        plateau[17][4] = '#fff';
        plateau[17][6] = '#fff';
        plateau[19][4] = '#fff';
        expect(detecterTSpin(plateau, piece, forme)).toBe('full');
    });

    it('calculerPointsTSpin applique un bonus niveau', () => {
        expect(calculerPointsTSpin('full', 1, 2)).toBe(1600);
        expect(calculerPointsTSpin('mini', 0, 3)).toBe(300);
    });
});
