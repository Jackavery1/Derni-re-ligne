import { describe, it, expect, beforeEach, vi } from 'vitest';
import { etat } from '../js/store-jeu.js';

vi.mock('../js/mode-histoire.js', () => ({
    modeHistoireEnCours: () => false,
}));

vi.mock('../js/registre-modes.js', () => ({
    modeArchiEnCours: () => false,
    modeCoopEnCours: () => false,
}));

const {
    budgetNiveauMs,
    timerNiveauActif,
    obtenirTempsRestantNiveauMs,
    reinitialiserTimerNiveau,
    mettreAJourAffichageTimerNiveau,
} = await import('../js/timer-niveau.js');

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

    it('budget niveau 1 = 165 s', () => {
        expect(budgetNiveauMs(1)).toBe(165_000);
    });

    it('budget augmente avec le niveau', () => {
        expect(budgetNiveauMs(3)).toBe(189_000);
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
        expect(restant).toBeGreaterThan(164_000);
        expect(restant).toBeLessThanOrEqual(165_000);
    });

    it('barre de progression et etats urgent/alerte dans le DOM', () => {
        vi.useFakeTimers();
        vi.setSystemTime(1_050_000);
        const section = {
            classList: {
                classes: new Set(),
                toggle(cls, actif) {
                    if (actif) this.classes.add(cls);
                    else this.classes.delete(cls);
                },
                contains(cls) {
                    return this.classes.has(cls);
                },
            },
        };
        const affichage = { textContent: '' };
        const barre = { style: { width: '' } };
        const getElementByIdOrig = document.getElementById;
        document.getElementById = (id) => {
            if (id === 'section-timer-niveau') return section;
            if (id === 'affichage-temps-niveau') return affichage;
            if (id === 'timer-niveau-barre') return barre;
            return getElementByIdOrig(id);
        };
        etat.tempsNiveauBudgetMs = 100_000;
        etat.tempsNiveauDebut = 1_000_000;
        etat.tempsPauseAccumule = 0;
        mettreAJourAffichageTimerNiveau();
        document.getElementById = getElementByIdOrig;
        expect(barre.style.width).toBe('50%');
        expect(section.classList.contains('timer-niveau-urgent')).toBe(true);
        expect(section.classList.contains('timer-niveau-alerte')).toBe(false);
        vi.useRealTimers();
    });
});
