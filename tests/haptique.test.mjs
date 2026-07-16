import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    vibrer,
    haptiqueActif,
    definirHaptiqueActif,
    initialiserHaptique,
} from '../js/audio/haptique.js';
import { definirReduireEffetsAccessibilite } from '../js/ui/accessibilite.js';
import { emettre } from '../js/etat/bus-jeu.js';

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

    it('ecoute le bus jeu pour lignes et tetris', () => {
        initialiserHaptique();
        emettre('lignes:effacees', { nbSupprimees: 2 });
        expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
        vi.mocked(navigator.vibrate).mockClear();
        emettre('lignes:effacees', { nbSupprimees: 4 });
        expect(navigator.vibrate).toHaveBeenCalledWith([15, 40, 15, 40, 20]);
    });

    it('vibre motif boss distinct (audit B G5)', () => {
        vibrer('boss');
        expect(navigator.vibrate).toHaveBeenCalledWith([45, 35, 70, 35, 50]);
    });
});
