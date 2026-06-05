import { describe, it, expect } from 'vitest';
import { noteVersFreq } from '../js/audio.js';

describe('audio', () => {
    it('La4 proche de 220 Hz', () => {
        const la4 = noteVersFreq(0, 0);
        expect(la4).toBeGreaterThan(215);
        expect(la4).toBeLessThan(225);
    });

    it('Octave supérieure double la fréquence', () => {
        const base = noteVersFreq(0, 0);
        const haut = noteVersFreq(0, 1);
        expect(haut / base).toBeCloseTo(2, 2);
    });
});
