import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/etat/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => true),
}));

vi.mock('../js/accessibilite.js', () => ({
    obtenirEffetsAccessibiliteReduits: vi.fn(() => true),
}));

import { modeHistoireEnCours } from '../js/etat/mode-histoire.js';
import { store } from '../js/etat/store-jeu.js';
import {
    obtenirExpressionBossCombat,
    notifierPresentationBossPortrait,
    notifierPhaseBossPortrait,
    notifierTetrisBossPortrait,
    notifierQuasiVaincuBossPortrait,
    notifierGameOverBossPortrait,
    reinitialiserReactionsBossPortrait,
} from '../js/reactions-boss-portrait.js';

describe('reactions-boss-portrait', () => {
    beforeEach(() => {
        reinitialiserReactionsBossPortrait();
        modeHistoireEnCours.mockReturnValue(true);
        store.histoire.boss = {
            actif: { id: 'brasier', pvMax: 100 },
            pv: 100,
            vaincu: false,
        };
    });

    it('reste inactif si histoire désactivée', () => {
        modeHistoireEnCours.mockReturnValueOnce(false);
        notifierPresentationBossPortrait();
        expect(obtenirExpressionBossCombat()).toBe('calme');
    });

    it('suit la séquence calme → agressif → vacillant → calme', () => {
        notifierPresentationBossPortrait();
        expect(obtenirExpressionBossCombat()).toBe('calme');

        notifierPhaseBossPortrait();
        expect(obtenirExpressionBossCombat()).toBe('agressif');

        notifierQuasiVaincuBossPortrait();
        expect(obtenirExpressionBossCombat()).toBe('vacillant');

        notifierGameOverBossPortrait();
        expect(obtenirExpressionBossCombat()).toBe('calme');
    });

    it('revient à l’expression de phase après un tetris', () => {
        vi.useFakeTimers();
        notifierPhaseBossPortrait();
        notifierTetrisBossPortrait();
        expect(obtenirExpressionBossCombat()).toBe('agressif');
        vi.advanceTimersByTime(1500);
        expect(obtenirExpressionBossCombat()).toBe('agressif');
        vi.useRealTimers();
    });
});
