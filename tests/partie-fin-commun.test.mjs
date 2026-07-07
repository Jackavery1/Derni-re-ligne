import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/achievements.js', () => ({
    finaliserStatsPartie: vi.fn(),
}));

vi.mock('../js/codex.js', () => ({
    planifierVerifierCodex: vi.fn(),
}));

vi.mock('../js/profil-jeu.js', () => ({
    sauvegarderSnapshotProfil: vi.fn(),
}));

vi.mock('../js/ui/ecrans-ui.js', () => ({
    obtenirTempsEcoule: vi.fn(() => 120000),
}));

vi.mock('../js/annonces.js', () => ({
    annoncer: vi.fn(),
}));

import { finaliserStatsPartie } from '../js/achievements.js';
import { planifierVerifierCodex } from '../js/codex.js';
import { sauvegarderSnapshotProfil } from '../js/profil-jeu.js';
import { annoncer } from '../js/annonces.js';
import { finaliserPartieCommune } from '../js/partie-fin-commun.js';

describe('partie-fin-commun', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('finalise stats, profil et codex pour solo et coop', async () => {
        finaliserPartieCommune({
            score: 9000,
            lignes: 40,
            biomeId: 'classique',
            annonceDefaite: 'Mission coop echouee',
        });
        await vi.waitFor(() => expect(planifierVerifierCodex).toHaveBeenCalled());
        expect(sauvegarderSnapshotProfil).toHaveBeenCalledWith(40, 'classique');
        expect(finaliserStatsPartie).toHaveBeenCalledWith(9000, 120);
        expect(annoncer).toHaveBeenCalledWith('Mission coop echouee');
    });
});
