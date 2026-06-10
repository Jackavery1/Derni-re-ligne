import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    planifierBoucleSecondaire,
    arreterBoucleSecondaire,
    boucleSecondaireActive,
    _reinitialiserPlanificateurRaf,
} from '../js/planificateur-raf.js';

describe('planificateur-raf', () => {
    /** @type {FrameRequestCallback | null} */
    let prochaineFrame = null;

    beforeEach(() => {
        _reinitialiserPlanificateurRaf();
        prochaineFrame = null;
        vi.stubGlobal('requestAnimationFrame', (cb) => {
            prochaineFrame = cb;
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        _reinitialiserPlanificateurRaf();
        vi.unstubAllGlobals();
    });

    it('planifie et exécute une boucle secondaire', () => {
        const tick = vi.fn();
        planifierBoucleSecondaire('test', tick);
        expect(boucleSecondaireActive('test')).toBe(true);
        prochaineFrame?.(16);
        expect(tick).toHaveBeenCalledWith(16);
    });

    it('arreterBoucleSecondaire annule la clé', () => {
        planifierBoucleSecondaire('test', vi.fn());
        arreterBoucleSecondaire('test');
        expect(boucleSecondaireActive('test')).toBe(false);
        expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it('remplace une boucle existante sur la même clé', () => {
        const tick1 = vi.fn();
        const tick2 = vi.fn();
        planifierBoucleSecondaire('test', tick1);
        planifierBoucleSecondaire('test', tick2);
        prochaineFrame?.(0);
        expect(tick1).not.toHaveBeenCalled();
        expect(tick2).toHaveBeenCalled();
    });
});
