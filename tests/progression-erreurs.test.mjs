import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    lireStockage,
    ecrireStockage,
    lireStockageJson,
    ecrireStockageJson,
    parserIdsStockage,
} from '../js/io/progression.js';

describe('progression — gestion erreurs', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('lireStockage refuse une clé inconnue', () => {
        expect(lireStockage('cle_invalide', 'defaut')).toBe('defaut');
    });

    it('ecrireStockage refuse une clé inconnue', () => {
        expect(ecrireStockage('cle_invalide', 'valeur')).toBe(false);
    });

    it('lireStockageJson retourne le défaut si JSON corrompu', () => {
        localStorage.setItem('tetrisNeo_codex', '{pas du json');
        expect(lireStockageJson('tetrisNeo_codex', [])).toEqual([]);
    });

    it('parserIdsStockage retourne un Set vide si JSON corrompu', () => {
        expect(parserIdsStockage('{invalide')).toEqual(new Set());
    });

    it('parserIdsStockage retourne un Set vide si tableau invalide', () => {
        expect(parserIdsStockage(JSON.stringify([1, 2]))).toEqual(new Set());
    });

    it('lireStockage gère localStorage indisponible', () => {
        const spy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
            throw new Error('quota');
        });
        expect(lireStockage('tetrisNeo_volume', '0')).toBe('0');
        spy.mockRestore();
    });

    it('ecrireStockageJson gère les valeurs non sérialisables', () => {
        const circulaire = {};
        circulaire.self = circulaire;
        expect(ecrireStockageJson('tetrisNeo_codex', circulaire)).toBe(false);
    });
});
