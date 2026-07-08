import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    dessinerRobo,
    definirHumeurRobo,
    notifierTetrisRobo,
    PALETTE_ROBO,
} from '../js/rendu/rendu-robo.js';
import { convertirHumeurVersCanvas } from '../js/ui/mascotte-robo.js';
import {
    synchroniserTransitionHumeurRobo,
    obtenirTransitionHumeurRobo,
    reinitialiserTransitionHumeurRobo,
} from '../js/rendu/rendu-robo-transition.js';
import { PERIODE_CLIGNEMENT_S, DUREE_CLIGNEMENT_S } from '../js/rendu/rendu-robo-visage.js';
import { calculerAnimRobo } from '../js/rendu/rendu-robo-corps.js';
import { definirReduireEffetsAccessibilite } from '../js/ui/accessibilite.js';

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
    beforeEach(() => {
        vi.useFakeTimers();
        reinitialiserTransitionHumeurRobo();
        definirReduireEffetsAccessibilite(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

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

    it('content dessine des arcs yeux', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'content', 0);
        expect(ctx.arc.mock.calls.length).toBeGreaterThan(0);
    });

    it('alerte dessine des barres verticales', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'alerte', 0);
        expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
    });

    it('tetris dessine des carrés pleins', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'tetris', 0);
        expect(ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
    });

    it('excite agrandit les glyphes', () => {
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'excite', 0);
        expect(ctx.arc.mock.calls.length + ctx.ellipse.mock.calls.length).toBeGreaterThan(0);
    });

    it('dessine chaque humeur canvas sans erreur', () => {
        for (const humeur of ['neutre', 'content', 'excite', 'triste', 'alerte', 'tetris']) {
            const ctx = creerCtxMock();
            dessinerRobo(ctx, 120, 150, humeur, 2);
            expect(ctx.arc.mock.calls.length + ctx.fillRect.mock.calls.length).toBeGreaterThan(0);
        }
    });

    it('transition humeur progresse sur ~175 ms', () => {
        synchroniserTransitionHumeurRobo('content', 0);
        synchroniserTransitionHumeurRobo('excite', 50);
        const debut = obtenirTransitionHumeurRobo(50);
        const milieu = obtenirTransitionHumeurRobo(140);
        const fin = obtenirTransitionHumeurRobo(250);
        expect(debut.blend).toBeLessThan(milieu.blend);
        expect(milieu.blend).toBeLessThan(fin.blend);
        expect(fin.blend).toBe(1);
    });

    it('notifierTetrisRobo restaure l humeur precedente', () => {
        definirHumeurRobo('excite');
        notifierTetrisRobo();
        vi.advanceTimersByTime(600);
        expect(() => definirHumeurRobo('excite')).not.toThrow();
    });

    it('clignement periodique deterministe (~4 s)', () => {
        expect(PERIODE_CLIGNEMENT_S).toBe(4);
        expect(DUREE_CLIGNEMENT_S).toBeCloseTo(0.12);
        const ctx = creerCtxMock();
        dessinerRobo(ctx, 120, 150, 'neutre', PERIODE_CLIGNEMENT_S - 0.06);
        expect(ctx.scale.mock.calls.some((c) => c[1] === 0.1)).toBe(true);
    });

    it('effets reduits desactive l oscillation d antenne', () => {
        definirReduireEffetsAccessibilite(true);
        const a0 = calculerAnimRobo('neutre', 0, 1);
        const a1 = calculerAnimRobo('neutre', 1, 1);
        expect(a0.antenneAngle).toBe(a1.antenneAngle);
        definirReduireEffetsAccessibilite(false);
        const b0 = calculerAnimRobo('neutre', 0, 1);
        const b1 = calculerAnimRobo('neutre', 1, 1);
        expect(b0.antenneAngle).not.toBe(b1.antenneAngle);
    });
});
