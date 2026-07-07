import { describe, it, expect, vi, afterEach } from 'vitest';
import { lireInsetsSafeArea } from '../js/logique/safe-area.js';

describe('safe-area.js', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('retourne zero sans document', () => {
        vi.stubGlobal('document', undefined);
        expect(lireInsetsSafeArea()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });

    it('lit les variables CSS calculees', () => {
        vi.stubGlobal('document', {
            documentElement: {},
        });
        vi.stubGlobal('getComputedStyle', () => ({
            getPropertyValue: (cle) => {
                const map = {
                    '--safe-top': '47px',
                    '--safe-right': '0px',
                    '--safe-bottom': '34px',
                    '--safe-left': '0px',
                };
                return map[cle] ?? '';
            },
        }));
        expect(lireInsetsSafeArea()).toEqual({ top: 47, right: 0, bottom: 34, left: 0 });
    });
});
