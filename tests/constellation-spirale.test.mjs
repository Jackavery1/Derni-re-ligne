import { describe, it, expect } from 'vitest';

import { parametresSpiraleConstellation } from '../js/constellation-spirale.js';

describe('constellation — spirale responsive', () => {
    it('resserre la spirale sur viewport compact', () => {
        const large = parametresSpiraleConstellation(800);
        const compact = parametresSpiraleConstellation(320);
        expect(compact.rayonInit).toBeLessThan(large.rayonInit);
        expect(compact.croissance).toBeLessThan(large.croissance);
    });

    it('maintient les noeuds dans le canvas sur 320×568', () => {
        const w = 320;
        const h = 568;
        const base = Math.min(w, h);
        const { rayonInit, croissance, compact } = parametresSpiraleConstellation(base);
        const centreX = w / 2;
        const centreY = h / 2;
        const nb = 15;
        let maxRayon = 0;
        for (let index = 0; index < nb; index++) {
            const rayonSpirale = rayonInit + index * croissance;
            const rayonNoeud = (compact ? 22 : 28) + index * (compact ? 1.5 : 2);
            maxRayon = Math.max(maxRayon, rayonSpirale + rayonNoeud);
        }
        expect(centreX + maxRayon).toBeLessThanOrEqual(w + 4);
        expect(centreY + maxRayon).toBeLessThanOrEqual(h + 4);
        expect(centreX - maxRayon).toBeGreaterThanOrEqual(-4);
        expect(centreY - maxRayon).toBeGreaterThanOrEqual(-4);
    });
});
