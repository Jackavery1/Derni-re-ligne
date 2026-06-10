import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../js/store-core.js';
import {
    chargerAccessibiliteDepuisStockage,
    obtenirDaltonien,
    obtenirEffetsAccessibiliteReduits,
    persisterDaltonien,
    persisterReduireEffets,
    definirDaltonien,
    definirReduireEffetsAccessibilite,
} from '../js/accessibilite.js';
import {
    estCleValide,
    existeStockage,
    ecrireStockage,
    lireStockage,
} from '../js/progression-stockage.js';

describe('accessibilite', () => {
    beforeEach(() => {
        store.accessibilite.daltonien = false;
        store.accessibilite.reduireEffets = false;
        store.accessibilite.reduireEffetsConfigure = false;
        store.prefererMoinsAnimations = false;
        localStorage.removeItem('derniereLigne_daltonien');
        localStorage.removeItem('derniereLigne_reduireEffets');
    });

    it('accepte les cles localStorage dediees', () => {
        expect(estCleValide('derniereLigne_daltonien')).toBe(true);
        expect(estCleValide('derniereLigne_reduireEffets')).toBe(true);
    });

    it('persiste le mode daltonien', () => {
        persisterDaltonien(true);
        expect(obtenirDaltonien()).toBe(true);
        expect(lireStockage('derniereLigne_daltonien', 'false')).toBe('true');
        chargerAccessibiliteDepuisStockage();
        expect(obtenirDaltonien()).toBe(true);
    });

    it('active reduireEffets par defaut si prefers-reduced-motion et option jamais touchee', () => {
        store.prefererMoinsAnimations = true;
        chargerAccessibiliteDepuisStockage();
        expect(obtenirEffetsAccessibiliteReduits()).toBe(true);
        expect(existeStockage('derniereLigne_reduireEffets')).toBe(false);
    });

    it('respecte le choix utilisateur sur reduireEffets', () => {
        store.prefererMoinsAnimations = true;
        persisterReduireEffets(false);
        expect(obtenirEffetsAccessibiliteReduits()).toBe(false);
        expect(existeStockage('derniereLigne_reduireEffets')).toBe(true);
    });

    it('store.accessibilite expose daltonien et reduireEffets', () => {
        definirDaltonien(true);
        definirReduireEffetsAccessibilite(true, true);
        expect(store.accessibilite.daltonien).toBe(true);
        expect(store.accessibilite.reduireEffets).toBe(true);
    });
});
