import { describe, it, expect, vi } from 'vitest';

vi.mock('../js/store-jeu.js', () => ({
    etat: { filePieces: [] },
    obtenirCtxPreview: () => ({ clearRect: vi.fn(), fillRect: vi.fn() }),
    obtenirCanvasPreview: () => ({ width: 104, height: 210 }),
}));

vi.mock('../js/piece-jeu.js', () => ({
    obtenirForme: () => [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    obtenirCouleurPiece: () => '#00f5ff',
}));

vi.mock('../js/rendu-cellule.js', () => ({
    dessinerCellule: vi.fn(),
}));

vi.mock('../js/rendu-accessibilite.js', () => ({
    dessinerMotifsPreview: vi.fn(),
}));

const { dessinerPreview } = await import('../js/rendu-previews.js');
const { dessinerCellule } = await import('../js/rendu-cellule.js');

describe('rendu-previews', () => {
    it('adapte la taille des cellules pour tenir dans le canvas hold', () => {
        const canvas = { width: 104, height: 72 };
        const ctx = { clearRect: vi.fn() };
        dessinerPreview(ctx, canvas, { type: 'I', rotation: 0 });
        expect(dessinerCellule).toHaveBeenCalled();
        const tailleCell = dessinerCellule.mock.calls[0][4];
        expect(tailleCell).toBeLessThanOrEqual(18);
        const maxBottom = Math.max(
            ...dessinerCellule.mock.calls.map(([, y]) => (y + 1) * tailleCell)
        );
        expect(maxBottom).toBeLessThanOrEqual(canvas.height);
    });
});
