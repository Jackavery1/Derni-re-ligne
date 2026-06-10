import { describe, it, expect } from 'vitest';
import { calculerEchelleInterface } from '../js/layout-calcul.js';

describe('layout-jeu', () => {
    it('calculerEchelleInterface respecte le plafond', () => {
        const scale = calculerEchelleInterface(4000, 3000, 500, 800, { scaleMax: 2.2 });
        expect(scale).toBeLessThanOrEqual(2.2);
        expect(scale).toBeGreaterThan(0);
    });

    it('calculerEchelleInterface reduit l echelle sur petit ecran', () => {
        const grand = calculerEchelleInterface(1200, 900, 500, 800);
        const petit = calculerEchelleInterface(360, 640, 500, 800, { hauteurControles: 120 });
        expect(petit).toBeLessThan(grand);
    });
});
