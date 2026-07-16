import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mettreAJourFps,
    suspendreBoucleSolo,
    SEUIL_ERREURS_BOUCLE,
    reinitialiserErreursBoucle,
    enregistrerErreurBoucle,
} from '../js/logique/boucle-jeu.js';
import {
    definirFpsMoyen,
    definirEffetsReduits,
    obtenirFpsMoyen,
    obtenirEffetsReduits,
    definirBoucleActive,
    definirIdFrame,
    obtenirBoucleActive,
    etat,
} from '../js/etat/store-jeu.js';
import { store } from '../js/etat/store-jeu.js';
import * as loggerMod from '../js/io/logger.js';

describe('boucle-jeu', () => {
    beforeEach(() => {
        definirFpsMoyen(60);
        definirEffetsReduits(false);
        store.prefererMoinsAnimations = false;
        definirBoucleActive(true);
        definirIdFrame(42);
        reinitialiserErreursBoucle();
        etat.estEnCours = true;
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

    it('circuit-breaker suspend après SEUIL_ERREURS_BOUCLE erreurs', () => {
        const afficher = vi
            .spyOn(loggerMod, 'afficherErreurUtilisateur')
            .mockImplementation(() => {});
        for (let i = 0; i < SEUIL_ERREURS_BOUCLE - 1; i++) {
            expect(enregistrerErreurBoucle(new Error(`e${i}`))).toBe(false);
            expect(obtenirBoucleActive()).toBe(true);
        }
        expect(enregistrerErreurBoucle(new Error('finale'))).toBe(true);
        expect(obtenirBoucleActive()).toBe(false);
        expect(afficher).toHaveBeenCalledOnce();
        afficher.mockRestore();
    });

    it('circuit-breaker se reinitialise via reinitialiserErreursBoucle', () => {
        const afficher = vi
            .spyOn(loggerMod, 'afficherErreurUtilisateur')
            .mockImplementation(() => {});
        for (let i = 0; i < SEUIL_ERREURS_BOUCLE - 1; i++) {
            enregistrerErreurBoucle(new Error(`e${i}`));
        }
        reinitialiserErreursBoucle();
        definirBoucleActive(true);
        expect(enregistrerErreurBoucle(new Error('apres-reset'))).toBe(false);
        expect(obtenirBoucleActive()).toBe(true);
        expect(afficher).not.toHaveBeenCalled();
        afficher.mockRestore();
    });
});
