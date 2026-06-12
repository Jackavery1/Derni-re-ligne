import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    PALETTE_VERA,
    PALETTE_VERA_DESAT,
    dessinerPortraitVeraCanon,
    viderCachePortraitVera,
} from '../js/portrait-vera-rendu.js';
import {
    obtenirParamsExpressionPortrait,
    reinitExpressionsCutscene,
} from '../js/expressions-cutscene.js';
import { store } from '../js/store-core.js';

function creerCtxMock() {
    const gradient = { addColorStop: vi.fn() };
    return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        beginPath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        createRadialGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        lineCap: 'butt',
        globalAlpha: 1,
        shadowBlur: 0,
        shadowColor: '',
    };
}

describe('portrait VERA canon', () => {
    beforeEach(() => {
        viderCachePortraitVera();
        reinitExpressionsCutscene();
        store.histoire.cutscene.enCours = true;
    });

    it('expose les palettes du canon sans couleur hors bloc', () => {
        expect(PALETTE_VERA.COMBINAISON).toBe('#e8edf5');
        expect(PALETTE_VERA.HALO).toBe('#ff2d78');
        expect(PALETTE_VERA_DESAT.VISIERE).toBeTruthy();
        expect(Object.keys(PALETTE_VERA).length).toBeGreaterThanOrEqual(10);
    });

    it('dessine sans erreur pour chaque humeur PROMPT A', () => {
        const humeurs = ['neutre', 'douce', 'inquiete', 'determinee', 'glitch'];
        for (const humeur of humeurs) {
            const ctx = creerCtxMock();
            const params = obtenirParamsExpressionPortrait('vera', humeur, 1000);
            expect(() => dessinerPortraitVeraCanon(ctx, 180, 260, 1.5, params)).not.toThrow();
            expect(ctx.clearRect).toHaveBeenCalled();
        }
    });

    it('effets réduits : t figé (pas de pulsation supplémentaire via tAnim)', () => {
        const ctx0 = creerCtxMock();
        const ctx1 = creerCtxMock();
        const params = obtenirParamsExpressionPortrait('vera', 'neutre', 1000);
        params.effetsReduits = true;
        dessinerPortraitVeraCanon(ctx0, 180, 260, 0, params);
        dessinerPortraitVeraCanon(ctx1, 180, 260, 99, params);
        expect(ctx0.arc.mock.calls.length).toBe(ctx1.arc.mock.calls.length);
    });

    it('glitch active les bandes (drawImage ou fill si pas de cache)', () => {
        const ctx = creerCtxMock();
        const params = obtenirParamsExpressionPortrait('vera', 'glitch', 1000);
        params.decalagesGlitch = [2, 4, 3];
        dessinerPortraitVeraCanon(ctx, 180, 260, 2, params);
        const appels = ctx.drawImage.mock.calls.length + ctx.fillRect.mock.calls.length;
        expect(appels).toBeGreaterThan(5);
    });
});
