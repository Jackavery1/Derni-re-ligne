import { describe, it, expect, vi } from 'vitest';
import { dessinerRobo, definirHumeurRobo, PALETTE_ROBO } from '../js/rendu-robo.js';
import { convertirHumeurVersCanvas } from '../js/mascotte-robo.js';

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
        expect(ctx.fillRect.mock.calls.length + ctx.arc.mock.calls.length).toBeGreaterThan(5);
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

    it('expose PALETTE_ROBO canon', () => {
        expect(PALETTE_ROBO.SCLERE).toBe('#eaf6ff');
        expect(PALETTE_ROBO.PUPILLE).toBe('#1a3c46');
        expect(PALETTE_ROBO.DENTS).toBe('#35e0e6');
    });

    it('dessine chaque humeur canvas sans erreur', () => {
        for (const humeur of ['neutre', 'content', 'excite', 'triste', 'alerte']) {
            const ctx = creerCtxMock();
            dessinerRobo(ctx, 120, 150, humeur, 2);
            expect(ctx.arc.mock.calls.length).toBeGreaterThan(0);
        }
    });
});
