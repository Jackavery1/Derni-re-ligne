import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storeJeu from '../js/etat/store-jeu.js';
import {
    declencherSecousse,
    obtenirDecalageSecousse,
    mettreAJourSecousse,
    dessinerFlashVerrou,
    dessinerFlashLignes,
    declencherFlashTopout,
    dessinerFlashTopout,
    demarrerTransition,
    mettreAJourTransition,
    afficherTexteFlottant,
    mettreAJourTextesFlottants,
    dessinerTextesFlottants,
} from '../js/rendu/rendu-fx.js';

const ctxMock = {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    font: '',
    textAlign: '',
    fillText: vi.fn(),
    shadowColor: '',
    shadowBlur: 0,
};

describe('rendu-fx', () => {
    beforeEach(() => {
        storeJeu.secousse.timer = 0;
        storeJeu.secousse.intensite = 0;
        storeJeu.flashVerrou.timer = 0;
        storeJeu.flashVerrou.cellules = [];
        storeJeu.flashLignes.timer = 0;
        storeJeu.flashLignes.lignes = [];
        storeJeu.flashTopout.timer = 0;
        storeJeu.textesFlottants.length = 0;
        storeJeu.store.surtensionActive = false;
        storeJeu.definirTransitionAlpha(1);
        storeJeu.definirTransitionDebut(0);
        vi.spyOn(storeJeu, 'obtenirEffetsAccessibiliteReduits').mockReturnValue(false);
        vi.spyOn(storeJeu, 'obtenirCtx').mockReturnValue(ctxMock);
        vi.spyOn(storeJeu, 'obtenirCanvasPlateau').mockReturnValue({ width: 320, height: 640 });
        vi.clearAllMocks();
    });

    it('declencherSecousse active le timer', () => {
        declencherSecousse(4);
        expect(storeJeu.secousse.timer).toBeGreaterThan(0);
        expect(storeJeu.secousse.intensite).toBe(4);
    });

    it('obtenirDecalageSecousse retourne zero sans secousse', () => {
        expect(obtenirDecalageSecousse()).toEqual({ x: 0, y: 0 });
    });

    it('mettreAJourSecousse diminue le timer', () => {
        declencherSecousse(3);
        mettreAJourSecousse(50);
        expect(storeJeu.secousse.timer).toBeLessThan(storeJeu.secousse.duree);
    });

    it('dessinerFlashVerrou ignore si timer nul', () => {
        dessinerFlashVerrou();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });

    it('dessinerFlashLignes dessine les lignes actives', () => {
        storeJeu.flashLignes.timer = 100;
        storeJeu.flashLignes.lignes = [4, 5];
        dessinerFlashLignes();
        expect(ctxMock.fillRect).toHaveBeenCalled();
    });

    it('dessinerFlashTopout couvre le plateau', () => {
        declencherFlashTopout();
        dessinerFlashTopout();
        expect(ctxMock.fillRect).toHaveBeenCalledWith(0, 0, 320, 640);
    });

    it('demarrerTransition reinitialise alpha', () => {
        demarrerTransition();
        expect(storeJeu.obtenirTransitionAlpha()).toBe(0);
    });

    it('mettreAJourTransition progresse vers 1', () => {
        demarrerTransition();
        mettreAJourTransition();
        expect(storeJeu.obtenirTransitionAlpha()).toBeGreaterThan(0);
    });

    it('declencherSecousse respecte effets reduits', () => {
        storeJeu.obtenirEffetsAccessibiliteReduits.mockReturnValue(true);
        declencherSecousse(4);
        expect(storeJeu.secousse.timer).toBe(0);
    });

    it('affiche et fait evoluer les textes flottants', () => {
        afficherTexteFlottant('TETRIS', '#ffe600', 12);
        expect(storeJeu.textesFlottants).toHaveLength(1);
        mettreAJourTextesFlottants(800);
        expect(storeJeu.textesFlottants[0].opacite).toBeLessThan(1);
        dessinerTextesFlottants();
        expect(ctxMock.fillText).toHaveBeenCalled();
    });
});
