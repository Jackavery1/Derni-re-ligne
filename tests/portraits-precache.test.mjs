import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { URLS_PORTRAITS_PRECACHE } from '../js/portraits-precache.js';

const racine = join(import.meta.dirname, '..');

describe('portraits-precache', () => {
    it('registre vera.png comme asset portrait', () => {
        expect(URLS_PORTRAITS_PRECACHE).toContain('./img/vera.png');
    });

    it('chaque URL portrait est dans le precache SW shell', () => {
        const swPrecache = readFileSync(join(racine, 'sw-precache-list.js'), 'utf8');
        for (const url of URLS_PORTRAITS_PRECACHE) {
            expect(swPrecache).toContain(`'${url}'`);
        }
    });

    it('sw.js documente les portraits shell (alignement registre)', () => {
        const sw = readFileSync(join(racine, 'sw.js'), 'utf8');
        for (const url of URLS_PORTRAITS_PRECACHE) {
            expect(sw).toContain(url);
        }
    });
});
