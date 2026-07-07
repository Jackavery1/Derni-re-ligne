import { describe, it, expect } from 'vitest';
import { PORTRAIT_VERA_SRC, calculerCadrePortraitVera } from '../js/rendu/portrait-vera-assets.js';

describe('portrait-vera-assets', () => {
    it('pointe vers img/vera.png', () => {
        expect(PORTRAIT_VERA_SRC).toBe('img/vera.png');
    });

    it('cadre le sprite en bas du canvas portrait', () => {
        const { dx, dy, dw, dh } = calculerCadrePortraitVera(180, 260, 360, 520);
        expect(dx).toBeGreaterThanOrEqual(0);
        expect(dy + dh).toBeLessThanOrEqual(260);
        expect(dw).toBeGreaterThan(0);
        expect(dh).toBeGreaterThan(0);
    });
});
