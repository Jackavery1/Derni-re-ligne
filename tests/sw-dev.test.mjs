import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { estHoteDevLocal, swAutorise } from '../js/io/sw-dev.js';

describe('sw-dev', () => {
    const origine = globalThis.window;

    beforeEach(() => {
        globalThis.window = {
            location: {
                hostname: '127.0.0.1',
                search: '',
            },
        };
    });

    afterEach(() => {
        globalThis.window = origine;
    });

    it('detecte localhost et 127.0.0.1 comme dev local', () => {
        window.location.hostname = '127.0.0.1';
        expect(estHoteDevLocal()).toBe(true);
        window.location.hostname = 'localhost';
        expect(estHoteDevLocal()).toBe(true);
        window.location.hostname = 'jackavery1.github.io';
        expect(estHoteDevLocal()).toBe(false);
    });

    it('desactive le SW en dev sauf ?pwa=1', () => {
        window.location.hostname = '127.0.0.1';
        window.location.search = '';
        expect(swAutorise()).toBe(false);
        window.location.search = '?pwa=1';
        expect(swAutorise()).toBe(true);
        window.location.hostname = 'example.com';
        window.location.search = '';
        expect(swAutorise()).toBe(true);
    });
});
