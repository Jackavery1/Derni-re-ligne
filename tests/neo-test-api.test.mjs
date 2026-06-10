import { describe, it, expect, vi, afterEach } from 'vitest';
import { estNeoTestAutorise, exposerNeoTestApi } from '../js/neo-test-api.js';

describe('neo-test-api', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        delete globalThis.window?.__NEO_TEST__;
    });

    it('autorise localhost', () => {
        vi.stubGlobal('window', { location: { hostname: '127.0.0.1', search: '' } });
        expect(estNeoTestAutorise()).toBe(true);
    });

    it('refuse github pages sans parametre', () => {
        vi.stubGlobal('window', { location: { hostname: 'jackavery1.github.io', search: '' } });
        expect(estNeoTestAutorise()).toBe(false);
    });

    it('autorise avec ?neoTest=1 sur domaine public', () => {
        vi.stubGlobal('window', {
            location: { hostname: 'jackavery1.github.io', search: '?neoTest=1' },
        });
        expect(estNeoTestAutorise()).toBe(true);
    });

    it('exposerNeoTestApi n expose pas hors contexte autorise', () => {
        vi.stubGlobal('window', { location: { hostname: 'example.com', search: '' } });
        exposerNeoTestApi({ demarrerPartieLibre: vi.fn() });
        expect(window.__NEO_TEST__).toBeUndefined();
    });

    it('exposerNeoTestApi expose sur localhost', () => {
        vi.stubGlobal('window', { location: { hostname: 'localhost', search: '' } });
        const api = { demarrerPartieLibre: vi.fn() };
        exposerNeoTestApi(api);
        expect(window.__NEO_TEST__).toBe(api);
    });
});
