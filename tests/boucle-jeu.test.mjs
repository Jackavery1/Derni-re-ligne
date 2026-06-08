import { describe, it, expect, beforeEach } from 'vitest';
import { mettreAJourFps, suspendreBoucleSolo } from '../js/boucle-jeu.js';
import {
    definirFpsMoyen,
    definirEffetsReduits,
    obtenirFpsMoyen,
    obtenirEffetsReduits,
    definirBoucleActive,
    definirIdFrame,
    obtenirBoucleActive,
} from '../js/store-jeu.js';
import { store } from '../js/store-core.js';

describe('boucle-jeu', () => {
    beforeEach(() => {
        definirFpsMoyen(60);
        definirEffetsReduits(false);
        store.prefererMoinsAnimations = false;
        definirBoucleActive(true);
        definirIdFrame(42);
    });

    it('mettreAJourFps lisse le FPS et active effetsReduits sous 45 fps', () => {
        mettreAJourFps(100);
        expect(obtenirFpsMoyen()).toBeGreaterThan(0);
        definirFpsMoyen(60);
        for (let i = 0; i < 30; i++) mettreAJourFps(50);
        expect(obtenirEffetsReduits()).toBe(true);
    });

    it('mettreAJourFps ignore deltaTemps <= 0', () => {
        definirFpsMoyen(55);
        mettreAJourFps(0);
        expect(obtenirFpsMoyen()).toBe(55);
    });

    it('suspendreBoucleSolo arrête la boucle RAF', () => {
        suspendreBoucleSolo();
        expect(obtenirBoucleActive()).toBe(false);
    });
});
