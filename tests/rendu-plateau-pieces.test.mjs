import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storeJeu from '../js/etat/store-jeu.js';
import { ghostEstDesactive } from '../js/histoire/mecaniques-histoire.js';
import {
    dessinerPieceFantome,
    dessinerOverlayBraise,
    dessinerPieceActive,
} from '../js/rendu/rendu-plateau-pieces.js';

vi.mock('../js/histoire/mecaniques-histoire.js', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        ghostEstDesactive: vi.fn(() => false),
        opacitePieceCourante: vi.fn(() => 1),
    };
});

const ctxMock = {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    font: '',
    textAlign: '',
    fillText: vi.fn(),
    shadowBlur: 0,
    shadowColor: '',
};

describe('rendu-plateau-pieces', () => {
    beforeEach(() => {
        storeJeu.etat.pieceActuelle = null;
        storeJeu.etat.plateau = Array.from({ length: 20 }, () => Array(10).fill(0));
        vi.spyOn(storeJeu, 'obtenirCtx').mockReturnValue(ctxMock);
        vi.spyOn(storeJeu, 'obtenirCanvasPlateau').mockReturnValue({ width: 320, height: 640 });
        vi.spyOn(storeJeu, 'obtenirEffetsAccessibiliteReduits').mockReturnValue(false);
        vi.spyOn(storeJeu, 'obtenirEffetsReduits').mockReturnValue(false);
        vi.spyOn(storeJeu, 'obtenirPrefererMoinsAnimations').mockReturnValue(false);
        vi.spyOn(storeJeu, 'obtenirReliqueActive').mockReturnValue(null);
        vi.spyOn(storeJeu, 'obtenirBiomeActif').mockReturnValue('classique');
        ghostEstDesactive.mockReturnValue(false);
        vi.clearAllMocks();
    });

    it('dessinerPieceFantome ignore sans piece active', () => {
        dessinerPieceFantome();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });

    it('dessinerPieceFantome ignore si fantome desactive', () => {
        storeJeu.etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 0 };
        ghostEstDesactive.mockReturnValue(true);
        dessinerPieceFantome();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });

    it('dessinerOverlayBraise ignore sans ctx', () => {
        storeJeu.obtenirCtx.mockReturnValue(null);
        dessinerOverlayBraise();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });

    it('dessinerPieceActive ignore sans piece', () => {
        dessinerPieceActive();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });
});
