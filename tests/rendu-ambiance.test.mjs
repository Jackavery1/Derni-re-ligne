import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initParticulesAmbiance, mettreAJourParticulesAmbiance } from '../js/rendu-ambiance.js';
import { particulesAmbiance } from '../js/store-jeu.js';
import { definirBiomeActif } from '../js/store-etat-partie.js';
import { definirRefsCanvas } from '../js/store-refs-canvas.js';

function creerCtxMock() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        transform: vi.fn(),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        globalAlpha: 1,
        lineWidth: 1,
        shadowBlur: 0,
        shadowColor: '',
        font: '',
        textAlign: '',
    };
}

describe('rendu-ambiance Phase 2', () => {
    beforeEach(() => {
        particulesAmbiance.length = 0;
        definirRefsCanvas({
            canvasPlateau: { width: 320, height: 640, tagName: 'CANVAS' },
            ctx: creerCtxMock(),
            canvasPreview: null,
            ctxPreview: null,
            canvasReserve: null,
            ctxReserve: null,
        });
    });

    it('classique : aucune particule d ambiance', () => {
        definirBiomeActif('classique');
        initParticulesAmbiance();
        expect(particulesAmbiance).toHaveLength(0);
    });

    it('lave : initialise 20 bulles recyclables', () => {
        definirBiomeActif('lave');
        initParticulesAmbiance();
        expect(particulesAmbiance).toHaveLength(20);
        expect(particulesAmbiance.every((p) => p.type === 'bulle_lave' && p.actif)).toBe(true);
    });

    it('ocean : bulles + rayons lumineux', () => {
        definirBiomeActif('ocean');
        initParticulesAmbiance();
        expect(particulesAmbiance).toHaveLength(28);
        expect(particulesAmbiance.filter((p) => p.type === 'rayon_eau')).toHaveLength(3);
    });

    it('cosmos : 35 étoiles fixes', () => {
        definirBiomeActif('cosmos');
        initParticulesAmbiance();
        expect(particulesAmbiance).toHaveLength(35);
        expect(particulesAmbiance.every((p) => p.type === 'etoile_cosmos')).toBe(true);
    });

    it('recyclage bulle lave sans splice quand sort par le haut', () => {
        definirBiomeActif('lave');
        initParticulesAmbiance();
        const p = particulesAmbiance[0];
        p.y = -100;
        const longueurAvant = particulesAmbiance.length;
        mettreAJourParticulesAmbiance(16);
        expect(particulesAmbiance.length).toBe(longueurAvant);
        expect(p.y).toBeGreaterThan(600);
    });

    it('fuochi : max 40 particules avec recyclage circulaire', () => {
        definirBiomeActif('fuochi');
        initParticulesAmbiance();
        expect(particulesAmbiance.length).toBeLessThanOrEqual(40);
        for (let i = 0; i < 50; i++) {
            mettreAJourParticulesAmbiance(16);
        }
        expect(particulesAmbiance.length).toBeLessThanOrEqual(40);
    });
});
