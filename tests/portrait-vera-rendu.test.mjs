import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    PALETTE_VERA,
    PALETTE_VERA_DESAT,
    dessinerPortraitVeraCanon,
    viderCachePortraitVera,
} from '../js/portrait-vera-rendu.js';
import {
    obtenirParamsExpressionPortrait,
    infererHumeurVeraDepuisTexte,
    reinitExpressionsCutscene,
} from '../js/expressions-cutscene.js';
import {
    obtenirImagePortraitVera,
    reinitialiserCachePortraitVeraAssets,
} from '../js/portrait-vera-assets.js';
import { store } from '../js/store-core.js';

vi.mock('../js/portrait-vera-assets.js', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        obtenirImagePortraitVera: vi.fn(() => null),
        prechargerPortraitVera: vi.fn(() => Promise.resolve(null)),
    };
});

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
        filter: '',
    };
}

describe('portrait VERA canvas procedural', () => {
    beforeEach(() => {
        viderCachePortraitVera();
        reinitialiserCachePortraitVeraAssets();
        reinitExpressionsCutscene();
        store.histoire.cutscene.enCours = true;
        vi.mocked(obtenirImagePortraitVera).mockReturnValue(null);
    });

    it('expose les palettes du canon', () => {
        expect(PALETTE_VERA.COMBINAISON).toBe('#e8edf5');
        expect(PALETTE_VERA.HALO).toBe('#ff2d78');
        expect(PALETTE_VERA_DESAT.VISIERE).toBeTruthy();
    });

    it('dessine sans erreur pour chaque humeur', () => {
        const humeurs = ['neutre', 'douce', 'inquiete', 'determinee', 'glitch'];
        for (const humeur of humeurs) {
            const ctx = creerCtxMock();
            const params = obtenirParamsExpressionPortrait('vera', humeur, 1000);
            expect(() => dessinerPortraitVeraCanon(ctx, 180, 260, 1.5, params)).not.toThrow();
            expect(ctx.clearRect).toHaveBeenCalled();
        }
    });

    it('fallback canvas dessine un buste sans rectangles bruts', () => {
        const ctx = creerCtxMock();
        const params = obtenirParamsExpressionPortrait('vera', 'neutre', 1000);
        dessinerPortraitVeraCanon(ctx, 180, 260, 0, params);
        expect(ctx.ellipse).toHaveBeenCalled();
        expect(ctx.fillRect.mock.calls.every((c) => c[2] < 70)).toBe(true);
    });

    it('dessine en canvas procedural sans sprite PNG', () => {
        const ctx = creerCtxMock();
        const params = obtenirParamsExpressionPortrait('vera', 'neutre', 1000);
        dessinerPortraitVeraCanon(ctx, 180, 260, 0, params);
        expect(ctx.drawImage).not.toHaveBeenCalled();
        expect(ctx.ellipse.mock.calls.length).toBeGreaterThan(4);
    });

    it('glitch procedural utilise getImageData quand disponible', () => {
        const ctx = creerCtxMock();
        const pixels = new Uint8ClampedArray(180 * 260 * 4);
        ctx.getImageData = vi.fn(() => ({ data: pixels, width: 180, height: 260 }));
        ctx.createImageData = vi.fn((width, height) => ({
            data: new Uint8ClampedArray(width * height * 4),
            width,
            height,
        }));
        ctx.putImageData = vi.fn();
        const params = obtenirParamsExpressionPortrait('vera', 'glitch', 1000);
        params.decalagesGlitch = [2, 4, 3];
        dessinerPortraitVeraCanon(ctx, 180, 260, 2, params);
        expect(ctx.getImageData).toHaveBeenCalled();
        expect(ctx.putImageData).toHaveBeenCalled();
    });

    it('infère des humeurs depuis le texte de dialogue', () => {
        expect(infererHumeurVeraDepuisTexte('ROBO. Je suis là.')).toBe('determinee');
        expect(infererHumeurVeraDepuisTexte('— Signal perdu —')).toBe('glitch');
        expect(infererHumeurVeraDepuisTexte('Je suis fière de toi.')).toBe('douce');
        expect(infererHumeurVeraDepuisTexte('Tu es en danger ?')).toBe('inquiete');
    });
});
