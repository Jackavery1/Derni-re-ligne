import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vibrer, haptiqueActif, definirHaptiqueActif } from '../js/haptique.js';
import { definirReduireEffetsAccessibilite } from '../js/accessibilite.js';

describe('haptique', () => {
    beforeEach(() => {
        localStorage.clear();
        definirHaptiqueActif(true);
        definirReduireEffetsAccessibilite(false);
        vi.stubGlobal('navigator', { vibrate: vi.fn() });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('vibre quand actif', () => {
        expect(haptiqueActif()).toBe(true);
        vibrer('ligne');
        expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
    });

    it('ne vibre pas quand desactive', () => {
        definirHaptiqueActif(false);
        vibrer('tetris');
        expect(navigator.vibrate).not.toHaveBeenCalled();
    });

    it('ne vibre pas avec effets reduits', () => {
        definirReduireEffetsAccessibilite(true);
        vibrer('rotation');
        expect(navigator.vibrate).not.toHaveBeenCalled();
    });
});
