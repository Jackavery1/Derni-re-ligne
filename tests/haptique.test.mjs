import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vibrer, haptiqueActif, definirHaptiqueActif } from '../js/haptique.js';

describe('haptique', () => {
    beforeEach(() => {
        localStorage.clear();
        definirHaptiqueActif(true);
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
});
