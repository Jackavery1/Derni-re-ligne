import { describe, it, expect } from 'vitest';
import { dessinerSilhouetteApercu } from '../js/rendu/archi-apercu-silhouette.js';

describe('archi-apercu-silhouette', () => {
    it('dessine les cellules cible sur le canvas', () => {
        const canvas = {
            width: 64,
            height: 64,
        };
        const pixels = [];
        const ctx = {
            clearRect: () => {},
            fillStyle: '',
            fillRect: (x, y, w, h) => pixels.push({ x, y, w, h }),
        };
        dessinerSilhouetteApercu(canvas, ctx, ['....####..', '....####..'], '#00f5ff');
        expect(pixels.length).toBe(8);
    });

    it('ignore une silhouette vide', () => {
        const ctx = { clearRect: () => {}, fillRect: () => {} };
        expect(() =>
            dessinerSilhouetteApercu({ width: 64, height: 64 }, ctx, [], '#fff')
        ).not.toThrow();
    });
});
