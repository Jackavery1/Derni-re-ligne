import { describe, it, expect, vi } from 'vitest';
import {
    noteVersFreq,
    calculerTempoActuel,
    MUSIQUE_BIOMES,
    configurerAudioMoteur,
} from '../js/audio.js';

describe('audio', () => {
    it('La4 proche de 220 Hz (biome classique)', () => {
        const la4 = noteVersFreq(0, 0, 'classique');
        expect(la4).toBeGreaterThan(215);
        expect(la4).toBeLessThan(225);
    });

    it('Octave supérieure double la fréquence', () => {
        const base = noteVersFreq(0, 0, 'classique');
        const haut = noteVersFreq(0, 1, 'classique');
        expect(haut / base).toBeCloseTo(2, 2);
    });

    it('toniques différentes par biome', () => {
        expect(noteVersFreq(0, 0, 'ocean')).toBeLessThan(noteVersFreq(0, 0, 'glace'));
    });

    it('calculerTempoActuel accélère avec le niveau (max +20%)', () => {
        const now = vi.spyOn(performance, 'now').mockReturnValue(0);
        configurerAudioMoteur({ obtenirNiveau: () => 1 });
        expect(calculerTempoActuel(100)).toBe(100);
        configurerAudioMoteur({ obtenirNiveau: () => 6 });
        expect(calculerTempoActuel(100)).toBe(110);
        configurerAudioMoteur({ obtenirNiveau: () => 20 });
        expect(calculerTempoActuel(100)).toBe(120);
        now.mockRestore();
    });

    it('chaque biome a une config musicale procédurale', () => {
        for (const id of Object.keys(MUSIQUE_BIOMES)) {
            const cfg = MUSIQUE_BIOMES[id];
            expect(cfg.melodie.length).toBeGreaterThan(0);
            expect(cfg.tempo).toBeGreaterThan(0);
            expect(cfg.gamme).toBeTruthy();
        }
    });
});
