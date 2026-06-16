import { describe, it, expect, beforeEach } from 'vitest';
import {
    urlsMusiqueFichier,
    chargerBufferMusique,
    viderCacheBuffersMusique,
} from '../js/audio-fichiers-musique.js';

describe('audio fichiers musique (hybride Suno)', () => {
    beforeEach(() => {
        viderCacheBuffersMusique();
    });

    it('expose les URLs ogg et m4a par biome', () => {
        expect(urlsMusiqueFichier('narratif_cutscene')).toEqual([
            'assets/musique/narratif_cutscene.ogg',
            'assets/musique/narratif_cutscene.m4a',
        ]);
    });

    it('retourne null si aucun fichier disponible', async () => {
        const ctx = {
            decodeAudioData: async () => {
                throw new Error('ne devrait pas être appelé');
            },
        };
        globalThis.fetch = async () => ({ ok: false });
        const buffer = await chargerBufferMusique('narratif_cutscene', ctx);
        expect(buffer).toBeNull();
        const cache = await chargerBufferMusique('narratif_cutscene', ctx);
        expect(cache).toBeNull();
    });
});
