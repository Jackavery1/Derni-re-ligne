import { describe, it, expect, vi } from 'vitest';
import { dessinerRobo, definirHumeurRobo, PALETTE_ROBO } from '../js/rendu/rendu-robo.js';
import { convertirHumeurVersCanvas } from '../js/ui/mascotte-robo.js';

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
        fillText: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        createRadialGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        lineCap: 'butt',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        shadowBlur: 0,
        shadowColor: '',
        font: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
        imageSmoothingEnabled: true,
        filter: '',
    };
}

describe('rendu-robo', () => {
    it('dessine ROBO sans erreur sur canvas 120×150', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'neutre', 0);
        expect(ctx.clearRect).toHaveBeenCalled();
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 120, 150);
        expect(ctx.fill.mock.calls.length + ctx.arc.mock.calls.length).toBeGreaterThan(5);
    });

    it('fond transparent en cutscene sans remplissage plein ecran', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'neutre', 0, { fondTransparent: true });
        expect(ctx.fillRect).not.toHaveBeenCalledWith(0, 0, 120, 150);
    });

    it('dessine ROBO excité avec arc-en-ciel', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'excite', 1.5, { arcEnCiel: true });
        expect(ctx.arc.mock.calls.length).toBeGreaterThan(0);
    });

    it('convertit les humeurs jeu vers canvas', () => {
        expect(convertirHumeurVersCanvas('triomphal')).toBe('excite');
        expect(convertirHumeurVersCanvas('stresse')).toBe('alerte');
    });

    it('definirHumeurRobo accepte les humeurs canvas', () => {
        expect(() => definirHumeurRobo('content')).not.toThrow();
    });

    it('expose PALETTE_ROBO v3 canon', () => {
        expect(PALETTE_ROBO.COQUE).toBe('#e6ecf7');
        expect(PALETTE_ROBO.ECRAN).toBe('#070a1c');
        expect(PALETTE_ROBO.GLYPHE).toBe('#00f5ff');
    });

    it('neutre dessine des glyphes ovales avec halo (ellipse)', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'neutre', 0);
        expect(ctx.ellipse.mock.calls.length).toBeGreaterThan(0);
    });

    it('content dessine des arcs yeux et une bouche optionnelle', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'content', 0);
        expect(ctx.quadraticCurveTo.mock.calls.length).toBeGreaterThan(0);
    });

    it('alerte dessine des barres verticales', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'alerte', 0);
        expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
    });

    it('excite agrandit les glyphes', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'excite', 0);
        expect(ctx.arc.mock.calls.length).toBeGreaterThan(2);
    });

    it('dessine chaque humeur canvas sans erreur', () => {
        for (const humeur of ['neutre', 'content', 'excite', 'triste', 'alerte']) {
            const ctx = creerCtxMock();
            dessinerRobo(ctx, 120, 150, humeur, 2);
            expect(ctx.arc.mock.calls.length + ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
        }
    });
});
