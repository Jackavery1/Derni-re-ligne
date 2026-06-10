import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/achievements.js', () => ({
    finaliserStatsPartie: vi.fn(),
}));

vi.mock('../js/codex.js', () => ({
    verifierCodex: vi.fn(() => Promise.resolve()),
}));

vi.mock('../js/profil-jeu.js', () => ({
    sauvegarderSnapshotProfil: vi.fn(),
}));

vi.mock('../js/ecrans-ui.js', () => ({
    obtenirTempsEcoule: vi.fn(() => 120000),
}));

vi.mock('../js/annonces.js', () => ({
    annoncer: vi.fn(),
}));

import { finaliserStatsPartie } from '../js/achievements.js';
import { sauvegarderSnapshotProfil } from '../js/profil-jeu.js';
import { annoncer } from '../js/annonces.js';
import { finaliserPartieCommune } from '../js/partie-fin-commun.js';

describe('partie-fin-commun', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('finalise stats, profil et codex pour solo et coop', () => {
        finaliserPartieCommune({
            score: 9000,
            lignes: 40,
            biomeId: 'classique',
            annonceDefaite: 'Mission coop echouee',
        });
        expect(sauvegarderSnapshotProfil).toHaveBeenCalledWith(40, 'classique');
        expect(finaliserStatsPartie).toHaveBeenCalledWith(9000, 120);
        expect(annoncer).toHaveBeenCalledWith('Mission coop echouee');
    });
});
