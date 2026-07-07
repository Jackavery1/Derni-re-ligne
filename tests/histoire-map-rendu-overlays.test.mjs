import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    dessinerVignetteCarte,
    dessinerIndicateurScroll,
    synchroniserPanneauMondeSelectionne,
} from '../js/histoire-map-rendu-overlays.js';

function creerCtx() {
    const gradient = { addColorStop: vi.fn() };
    return {
        createRadialGradient: vi.fn(() => gradient),
        createLinearGradient: vi.fn(() => gradient),
        fillRect: vi.fn(),
        fillStyle: '',
        save: vi.fn(),
        restore: vi.fn(),
        globalAlpha: 1,
        shadowBlur: 0,
        shadowColor: '',
    };
}

describe('histoire-map-rendu-overlays', () => {
    it('dessine la vignette carte', () => {
        const ctx = creerCtx();
        dessinerVignetteCarte(ctx, 800, 600);
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('ignore l indicateur scroll sans camera', () => {
        const ctx = creerCtx();
        dessinerIndicateurScroll({ camera: null }, ctx, 800, 600);
        expect(ctx.save).not.toHaveBeenCalled();
    });

    it('dessine l indicateur scroll avec camera', () => {
        const ctx = creerCtx();
        dessinerIndicateurScroll(
            { camera: { scrollMin: 0, scrollMax: 100, cibleY: 50 } },
            ctx,
            800,
            600
        );
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.fillRect).toHaveBeenCalled();
    });

    describe('synchroniserPanneauMondeSelectionne', () => {
        /** @type {typeof document.getElementById} */
        let getElementByIdOrig;

        beforeEach(() => {
            getElementByIdOrig = document.getElementById;
        });

        afterEach(() => {
            document.getElementById = getElementByIdOrig;
        });

        it('masque le panneau sans selection', () => {
            const classes = new Set();
            document.getElementById = vi.fn(() => ({
                classList: {
                    add: (c) => classes.add(c),
                    remove: (c) => classes.delete(c),
                },
            }));

            synchroniserPanneauMondeSelectionne({ noeudSelectionne: null });
            expect(classes.has('histoire-panneau-masque')).toBe(true);
        });

        it('affiche le panneau quand un monde est selectionne', () => {
            const classes = new Set(['histoire-panneau-masque']);
            document.getElementById = vi.fn(() => ({
                classList: {
                    add: (c) => classes.add(c),
                    remove: (c) => classes.delete(c),
                },
            }));

            synchroniserPanneauMondeSelectionne({ noeudSelectionne: 'monde_lave' });
            expect(classes.has('histoire-panneau-masque')).toBe(false);
        });
    });
});
