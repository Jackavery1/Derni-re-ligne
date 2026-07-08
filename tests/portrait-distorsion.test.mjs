import { describe, it, expect, vi } from 'vitest';
import { dessinerPortraitDistorsion } from '../js/rendu/portrait-distorsion-rendu.js';

function creerCtxMock() {
    const gradient = { addColorStop: vi.fn() };
    return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fillText: vi.fn(),
        createRadialGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        shadowBlur: 0,
        shadowColor: '',
        font: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
    };
}

describe('portrait-distorsion', () => {
    it('dessine sans erreur en cutscene (fond transparent + halo)', () => {
        const ctx = creerCtxMock();
        dessinerPortraitDistorsion(ctx, 180, 260, 1.2, { fondTransparent: true });
        expect(ctx.createRadialGradient).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
    });

    it('dessine chaque humeur preset sans erreur', () => {
        const presets = [
            { vortexVitesse: 1.3, yeuxRouge: true },
            { vortexVitesse: 0.45, paupiere: true, yeuxRouge: true },
            { vortexVitesse: 0.15, unOeil: true, yeuxRouge: true },
            { vortexVitesse: 0.25, yeuxViolet: true, fragmentsStables: true },
        ];
        for (const params of presets) {
            const ctx = creerCtxMock();
            dessinerPortraitDistorsion(ctx, 180, 260, 0, {
                fondTransparent: true,
                ...params,
            });
            expect(ctx.fillText).toHaveBeenCalled();
        }
    });
});
