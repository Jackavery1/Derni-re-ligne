import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../audio/audio-partie.js', () => ({
    initialiserAudioBiome: vi.fn(),
}));

vi.mock('../rendu/layout-jeu.js', () => ({
    adapterInterface: vi.fn(),
}));

vi.mock('../codex.js', () => ({
    planifierVerifierCodex: vi.fn(),
}));

vi.mock('./constellation.js', () => ({
    arreterConstellation: vi.fn(),
}));

vi.mock('../audio/melodie.js', () => ({
    reinitialiserMelodie: vi.fn(),
}));

import { etat } from '../js/etat/store-jeu.js';
import { initialiserEtatPartie } from '../js/logique/partie-etat.js';

describe('partie-etat', () => {
    beforeEach(() => {
        etat.estEnCours = false;
        etat.score = 99;
        etat.lignes = 42;
        etat.niveau = 5;
    });

    it('initialiserEtatPartie remet score et lignes à zéro', () => {
        initialiserEtatPartie();
        expect(etat.score).toBe(0);
        expect(etat.lignes).toBe(0);
        expect(etat.niveau).toBe(1);
        expect(etat.estEnCours).toBe(true);
        expect(etat.estEnPause).toBe(false);
        expect(etat.pieceActuelle).toBeTruthy();
        expect(etat.filePieces).toHaveLength(3);
    });
});
