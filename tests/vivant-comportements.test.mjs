import { describe, it, expect } from 'vitest';
import { COMPORTEMENTS_VIVANT } from '../js/logique/vivant-comportements.js';

describe('vivant-comportements', () => {
    it('expose un comportement par biome vivant', () => {
        expect(COMPORTEMENTS_VIVANT.classique).toBeNull();
        for (const cle of [
            'lave',
            'ocean',
            'foret',
            'glace',
            'desert',
            'cyber',
            'fuochi',
            'cosmos',
        ]) {
            const cfg = COMPORTEMENTS_VIVANT[cle];
            expect(cfg?.nom).toBeTruthy();
            expect(cfg?.intervalle).toBeGreaterThan(0);
            expect(cfg?.delaiMinimum).toBeGreaterThan(0);
        }
    });
});
