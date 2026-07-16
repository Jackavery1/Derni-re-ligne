import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/achievements.js', () => ({
    finaliserStatsPartie: vi.fn(),
}));

vi.mock('../js/codex.js', () => ({
    planifierVerifierCodex: vi.fn(),
}));

vi.mock('../js/logique/temps-partie.js', () => ({
    obtenirTempsEcoule: vi.fn(() => 120000),
}));

import { finaliserStatsPartie } from '../js/achievements.js';
import { planifierVerifierCodex } from '../js/codex.js';
import { ecouter, reinitialiserBusJeu } from '../js/etat/bus-jeu.js';
import { finaliserPartieCommune } from '../js/logique/partie-fin-commun.js';

describe('partie-fin-commun', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        reinitialiserBusJeu();
    });

    it('finalise stats et codex puis emet partie:finale-commune', async () => {
        const payload = vi.fn();
        ecouter('partie:finale-commune', payload);
        finaliserPartieCommune({
            score: 9000,
            lignes: 40,
            biomeId: 'classique',
            annonceDefaite: 'Mission coop echouee',
        });
        await vi.waitFor(() => expect(planifierVerifierCodex).toHaveBeenCalled());
        expect(finaliserStatsPartie).toHaveBeenCalledWith(9000, 120);
        expect(payload).toHaveBeenCalledWith({
            lignes: 40,
            biomeId: 'classique',
            victoire: false,
            annonce: 'Mission coop echouee',
        });
    });
});
