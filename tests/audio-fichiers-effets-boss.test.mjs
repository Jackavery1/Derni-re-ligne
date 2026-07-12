import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    EFFETS_BOSS_SAMPLES,
    urlsEffetBoss,
    estEffetBossSample,
    chargerBufferEffetBoss,
    viderCacheBuffersEffetsBoss,
    creerMethodesEffetsBoss,
} from '../js/audio/audio-fichiers-effets-boss.js';

describe('audio fichiers effets boss', () => {
    beforeEach(() => {
        viderCacheBuffersEffetsBoss();
    });

    it('expose les URLs ogg et wav par type', () => {
        expect(urlsEffetBoss('boss_braise')).toEqual([
            'assets/sfx/boss/boss_braise.ogg',
            'assets/sfx/boss/boss_braise.wav',
        ]);
    });

    it('reconnait les six types boss', () => {
        expect(EFFETS_BOSS_SAMPLES).toHaveLength(6);
        for (const type of EFFETS_BOSS_SAMPLES) {
            expect(estEffetBossSample(type)).toBe(true);
        }
        expect(estEffetBossSample('verrou')).toBe(false);
    });

    it('retourne null si aucun fichier disponible', async () => {
        const ctx = {
            decodeAudioData: async () => {
                throw new Error('ne devrait pas etre appele');
            },
        };
        globalThis.fetch = async () => ({ ok: false });
        const buffer = await chargerBufferEffetBoss('boss_gel', ctx);
        expect(buffer).toBeNull();
    });

    it('decode le premier format disponible', async () => {
        const fakeBuffer = { duration: 0.2 };
        const decodeAudioData = vi.fn(async () => fakeBuffer);
        globalThis.fetch = vi
            .fn()
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });

        const buffer = await chargerBufferEffetBoss('boss_braise', { decodeAudioData });
        expect(buffer).toBe(fakeBuffer);
        expect(decodeAudioData).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('jouerEffetBossSample retourne true avec buffer charge', async () => {
        const fakeBuffer = { duration: 0.2 };
        globalThis.fetch = async () => ({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(16),
        });
        const ctx = {
            decodeAudioData: async () => fakeBuffer,
            currentTime: 0,
            createBufferSource: () => ({
                buffer: null,
                connect: vi.fn(),
                start: vi.fn(),
            }),
            createGain: () => ({
                gain: { setValueAtTime: vi.fn() },
                connect: vi.fn(),
            }),
        };

        await chargerBufferEffetBoss('boss_braise', ctx);
        const moteur = {
            ctx,
            gainEffets: {},
            volumeEffets: 0.8,
            muet: false,
            ...creerMethodesEffetsBoss(),
        };
        expect(moteur.jouerEffetBossSample('boss_braise', 1)).toBe(true);
        expect(moteur.jouerEffetBossSample('verrou')).toBe(false);
    });
});
