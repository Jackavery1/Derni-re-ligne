import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formaterRapportErreurs,
    copierRapportErreurs,
    logger,
    sessionId,
} from '../js/io/logger.js';

describe('logger rapport erreurs', () => {
    /** @type {Map<string, string>} */
    let storage;

    beforeEach(() => {
        storage = new Map();
        vi.stubGlobal('window', { location: { href: 'http://127.0.0.1:3000/' } });
        vi.stubGlobal('sessionStorage', {
            getItem: (k) => storage.get(k) ?? null,
            setItem: (k, v) => storage.set(k, String(v)),
            clear: () => storage.clear(),
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('formaterRapportErreurs inclut sessionId et journal', () => {
        logger.error('test erreur');
        const rapport = JSON.parse(formaterRapportErreurs());
        expect(rapport.sessionId).toBe(sessionId);
        expect(rapport.journal.length).toBeGreaterThan(0);
        expect(rapport.journal[0].niveau).toBe('error');
    });

    it('copierRapportErreurs ecrit dans le presse-papier', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', { clipboard: { writeText } });

        const ok = await copierRapportErreurs();

        expect(ok).toBe(true);
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining(sessionId));
    });

    it('copierRapportErreurs retourne false si clipboard indisponible', async () => {
        vi.stubGlobal('navigator', {});

        expect(await copierRapportErreurs()).toBe(false);
    });
});
