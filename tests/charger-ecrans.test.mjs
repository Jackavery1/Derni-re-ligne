import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { urlFragmentEcran } from '../js/charger-ecrans.js';

describe('charger-ecrans', () => {
    const origine = globalThis.document;

    beforeEach(() => {
        globalThis.document = {
            baseURI: 'http://127.0.0.1:3000/',
        };
    });

    afterEach(() => {
        globalThis.document = origine;
    });

    it('resout les fragments HTML depuis document.baseURI', () => {
        expect(urlFragmentEcran('ecran-titre')).toBe('http://127.0.0.1:3000/html/ecran-titre.html');
        document.baseURI = 'https://jackavery1.github.io/Derni-re-ligne/';
        expect(urlFragmentEcran('ecran-pause')).toBe(
            'https://jackavery1.github.io/Derni-re-ligne/html/ecran-pause.html'
        );
    });
});
