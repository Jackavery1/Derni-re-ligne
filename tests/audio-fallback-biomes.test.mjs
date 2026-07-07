import { describe, it, expect, beforeEach } from 'vitest';
import { MUSIQUE_BIOMES } from '../js/audio/audio-donnees.js';
import {
    obtenirConfigMusiqueBiome,
    _reinitialiserCacheMusiqueFallback,
} from '../js/audio/audio-fallback-biomes.js';

describe('audio-fallback-biomes', () => {
    beforeEach(() => {
        _reinitialiserCacheMusiqueFallback();
    });

    it('retourne la config solo si le biome existe deja', () => {
        expect(obtenirConfigMusiqueBiome('classique')).toBe(MUSIQUE_BIOMES.classique);
    });

    it('genere un fallback pour un biome histoire sans piste dediee', () => {
        const config = obtenirConfigMusiqueBiome('rouille');
        expect(config).not.toBeNull();
        expect(config).not.toBe(MUSIQUE_BIOMES.rouille);
        expect(config.melodie).toEqual(MUSIQUE_BIOMES.lave.melodie);
        expect(config.tempo).toBeDefined();
    });

    it('met en cache le fallback genere', () => {
        const a = obtenirConfigMusiqueBiome('eclipse');
        const b = obtenirConfigMusiqueBiome('eclipse');
        expect(a).toBe(b);
    });
});
