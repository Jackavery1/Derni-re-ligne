import { describe, it, expect, vi } from 'vitest';
import { dessinerRobo, convertirHumeurVersCanvas, definirHumeurRobo } from '../js/rendu-robo.js';

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
        expect(() => dessinerRobo(ctx, 120, 150, 'neutre', 0)).not.toThrow();
        expect(() => dessinerRobo(ctx, 120, 150, 'excite', 1.5, { arcEnCiel: true })).not.toThrow();
    });

    it('convertit les humeurs jeu vers canvas', () => {
        expect(convertirHumeurVersCanvas('triomphal')).toBe('excite');
        expect(convertirHumeurVersCanvas('stresse')).toBe('alerte');
    });

    it('definirHumeurRobo accepte les humeurs canvas', () => {
        expect(() => definirHumeurRobo('content')).not.toThrow();
    });
});
