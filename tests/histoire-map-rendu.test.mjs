import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dessinerCarteHistoire } from '../js/histoire/histoire-map-rendu.js';

vi.mock('../js/histoire/histoire-map-camera.js', () => ({
    appliquerTransformCamera: vi.fn(),
}));
vi.mock('../js/histoire/histoire-map-fond.js', () => ({
    dessinerEtoilesFond: vi.fn(),
    invaliderDonneesEtoilesHistoire: vi.fn(),
}));
vi.mock('../js/histoire/histoire-map-noeuds.js', () => ({
    dessinerTousLesNoeuds: vi.fn(),
}));
vi.mock('../js/histoire/histoire-map-rendu-chemins.js', () => ({
    dessinerCheminsCarte: vi.fn(),
}));
vi.mock('../js/histoire/histoire-map-rendu-overlays.js', () => ({
    dessinerBrouillardFutur: vi.fn(),
    dessinerEtiquettesChapitres: vi.fn(),
    dessinerIndicateurScroll: vi.fn(),
    dessinerVignetteCarte: vi.fn(),
    synchroniserPanneauMondeSelectionne: vi.fn(),
}));

describe('histoire-map-rendu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ne dessine rien sans canvas', () => {
        expect(() => dessinerCarteHistoire({ canvasCarte: null, ctxCarte: null }, 0)).not.toThrow();
    });

    it('remplit le fond et appelle les couches de dessin', async () => {
        const { dessinerEtoilesFond } = await import('../js/histoire/histoire-map-fond.js');
        const { dessinerTousLesNoeuds } = await import('../js/histoire/histoire-map-noeuds.js');
        const ctx = {
            fillStyle: '',
            fillRect: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
        };
        const etatCarte = {
            canvasCarte: { width: 200, height: 400 },
            ctxCarte: ctx,
            camera: {},
        };
        dessinerCarteHistoire(etatCarte, 100);
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 200, 400);
        expect(dessinerEtoilesFond).toHaveBeenCalled();
        expect(dessinerTousLesNoeuds).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});
