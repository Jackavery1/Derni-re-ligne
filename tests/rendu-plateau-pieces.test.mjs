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

vi.mock('../js/rendu/rendu-cellule.js', () => ({
    dessinerCellule: vi.fn(),
}));

vi.mock('../js/rendu/rendu-blocs.js', () => ({
    dessinerCelluleStyle: vi.fn(),
}));

vi.mock('../js/rendu/rendu-accessibilite.js', () => ({
    dessinerPulsePieceActive: vi.fn(),
}));

vi.mock('../js/logique/boss-jeu.js', () => ({
    obtenirFauxFantomeActif: vi.fn(() => false),
    COULEUR_BRAISE: '#ff8800',
}));

vi.mock('../js/logique/meteo.js', () => ({
    meteo: { masquerPiece: false },
}));

const { dessinerCellule } = await import('../js/rendu/rendu-cellule.js');
const { dessinerCelluleStyle } = await import('../js/rendu/rendu-blocs.js');
const { dessinerPulsePieceActive } = await import('../js/rendu/rendu-accessibilite.js');
const { obtenirFauxFantomeActif } = await import('../js/logique/boss-jeu.js');
const { meteo } = await import('../js/logique/meteo.js');

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
        obtenirFauxFantomeActif.mockReturnValue(false);
        meteo.masquerPiece = false;
        vi.clearAllMocks();
    });

    it('dessinerPieceFantome ignore sans piece active', () => {
        dessinerPieceFantome();
        expect(dessinerCellule).not.toHaveBeenCalled();
    });

    it('dessinerPieceFantome ignore si fantome desactive', () => {
        storeJeu.etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 0 };
        ghostEstDesactive.mockReturnValue(true);
        dessinerPieceFantome();
        expect(dessinerCellule).not.toHaveBeenCalled();
    });

    it('dessinerPieceFantome dessine le fantome standard', () => {
        storeJeu.etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 0 };
        dessinerPieceFantome();
        expect(dessinerCellule).toHaveBeenCalled();
    });

    it('dessinerPieceFantome dessine le double fantome si faux fantome actif', () => {
        storeJeu.etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 0 };
        obtenirFauxFantomeActif.mockReturnValue(true);
        dessinerPieceFantome();
        expect(dessinerCellule.mock.calls.length).toBeGreaterThan(1);
    });

    it('dessinerOverlayBraise ignore sans ctx', () => {
        storeJeu.obtenirCtx.mockReturnValue(null);
        dessinerOverlayBraise();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });

    it('dessinerOverlayBraise ignore si effets accessibilite reduits', () => {
        storeJeu.obtenirEffetsAccessibiliteReduits.mockReturnValue(true);
        storeJeu.etat.plateau[0][0] = '#ff8800';
        dessinerOverlayBraise();
        expect(ctxMock.fillRect).not.toHaveBeenCalled();
    });

    it('dessinerOverlayBraise pulse les cellules braise', () => {
        storeJeu.etat.plateau[0][0] = '#ff8800';
        dessinerOverlayBraise();
        expect(ctxMock.fillRect).toHaveBeenCalled();
        expect(ctxMock.save).toHaveBeenCalled();
        expect(ctxMock.restore).toHaveBeenCalled();
    });

    it('dessinerPieceActive ignore sans piece', () => {
        dessinerPieceActive();
        expect(dessinerCelluleStyle).not.toHaveBeenCalled();
    });

    it('dessinerPieceActive dessine la piece courante', () => {
        storeJeu.etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 0 };
        dessinerPieceActive();
        expect(dessinerCelluleStyle).toHaveBeenCalled();
        expect(dessinerPulsePieceActive).toHaveBeenCalledWith(ctxMock);
    });

    it('dessinerPieceActive affiche l icone relique', () => {
        storeJeu.etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 0 };
        storeJeu.obtenirReliqueActive.mockReturnValue({ couleur: '#00ffcc', icone: '★' });
        dessinerPieceActive();
        expect(ctxMock.fillText).toHaveBeenCalledWith('★', expect.any(Number), expect.any(Number));
    });
});
