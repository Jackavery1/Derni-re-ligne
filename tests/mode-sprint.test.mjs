import { describe, it, expect, beforeEach, vi } from 'vitest';
import { etat } from '../js/etat/store-jeu.js';
import {
    basculerModeSprint,
    desactiverModeSprint,
    modeSprintActif,
    reinitialiserModeSprint,
} from '../js/mode-sprint.js';

describe('mode-sprint', () => {
    beforeEach(() => {
        reinitialiserModeSprint();
        vi.restoreAllMocks();
    });

    it('active le mode sprint et met a jour le store', () => {
        vi.spyOn(document, 'getElementById').mockReturnValue(null);
        basculerModeSprint();
        expect(modeSprintActif).toBe(true);
        expect(etat.modeJeu).toBe('sprint');
    });

    it('desactive le sprint et repasse en marathon', () => {
        vi.spyOn(document, 'getElementById').mockReturnValue(null);
        basculerModeSprint();
        desactiverModeSprint();
        expect(modeSprintActif).toBe(false);
        expect(etat.modeJeu).toBe('marathon');
    });

    it('ignore le basculement sprint si coop actif', () => {
        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'toggle-coop') {
                return { classList: { contains: (c) => c === 'actif' } };
            }
            return null;
        });
        basculerModeSprint();
        expect(modeSprintActif).toBe(false);
        expect(etat.modeJeu).toBe('marathon');
    });
});
