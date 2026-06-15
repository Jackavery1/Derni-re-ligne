import { describe, it, expect, beforeEach, vi } from 'vitest';
import { etat } from '../js/store-jeu.js';

vi.mock('../js/mode-histoire.js', () => ({
    modeHistoireEnCours: () => false,
}));

vi.mock('../js/registre-modes.js', () => ({
    modeArchiEnCours: () => false,
    modeCoopEnCours: () => false,
}));

const { budgetNiveauMs, timerNiveauActif, obtenirTempsRestantNiveauMs, reinitialiserTimerNiveau } =
    await import('../js/timer-niveau.js');

describe('timer-niveau', () => {
    beforeEach(() => {
        etat.estEnCours = true;
        etat.modeJeu = 'marathon';
        etat.niveau = 1;
        etat.tempsPauseAccumule = 0;
        etat.tempsPauseDebut = null;
        etat.estEnPause = false;
        reinitialiserTimerNiveau();
    });

    it('budget niveau 1 = 150 s', () => {
        expect(budgetNiveauMs(1)).toBe(150_000);
    });

    it('budget augmente avec le niveau', () => {
        expect(budgetNiveauMs(3)).toBe(174_000);
        expect(budgetNiveauMs(99)).toBe(240_000);
    });

    it('actif en marathon solo', () => {
        expect(timerNiveauActif()).toBe(true);
    });

    it('inactif en sprint', () => {
        etat.modeJeu = 'sprint';
        expect(timerNiveauActif()).toBe(false);
    });

    it('temps restant proche du budget au demarrage', () => {
        const restant = obtenirTempsRestantNiveauMs();
        expect(restant).toBeGreaterThan(149_000);
        expect(restant).toBeLessThanOrEqual(150_000);
    });
});
