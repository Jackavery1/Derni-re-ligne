import { describe, it, expect } from 'vitest';
import { MUSIQUE_BIOMES, TONIQUES_BIOMES } from '../js/audio/audio-donnees.js';
import { obtenirConfigMusiqueBiome } from '../js/audio/audio-fallback-biomes.js';

describe('audio narratif cutscene (audit P3)', () => {
    it('expose une piste dediee narratif_cutscene', () => {
        const config = MUSIQUE_BIOMES.narratif_cutscene;
        expect(config).toBeDefined();
        expect(config.tempo).toBeLessThan(90);
        expect(config.tenueNote).toBe(true);
        expect(TONIQUES_BIOMES.narratif_cutscene).toBeGreaterThan(0);
    });

    it('obtenirConfigMusiqueBiome resout narratif_cutscene', () => {
        expect(obtenirConfigMusiqueBiome('narratif_cutscene')).toBe(
            MUSIQUE_BIOMES.narratif_cutscene
        );
    });
});
