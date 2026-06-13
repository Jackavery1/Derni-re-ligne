import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/charger-histoire-textes.js', () => ({
    obtenirHistoireTextesSync: vi.fn(),
}));

import { obtenirHistoireTextesSync } from '../js/charger-histoire-textes.js';
import { obtenirCutsceneEntree, obtenirCutscenePostMonde } from '../js/histoire-narratif.js';

describe('histoire-narratif — metadata cutscene', () => {
    beforeEach(() => {
        obtenirHistoireTextesSync.mockReturnValue({
            CUTSCENES_ENTREE: {
                monde_prologue: [
                    { scene: 'labo', personnage: 'systeme', texte: 'INITIALISATION...' },
                    { scene: 'labo', personnage: 'robo', texte: 'Je suis conscient.' },
                ],
                monde_boss_1: [
                    { scene: 'seuil_brasier', personnage: 'brasier', texte: 'QUI APPROCHE ?' },
                ],
            },
            CUTSCENES_POST_MONDE: {
                monde_trame: [
                    { scene: 'trame', personnage: 'narrateur', texte: 'La Trame accumule.' },
                ],
            },
        });
    });

    it('obtenirCutsceneEntree conserve scene et personnage sur les lignes', () => {
        const cutscene = obtenirCutsceneEntree('monde_prologue', true);
        expect(cutscene?.lignes[0]).toEqual(
            expect.objectContaining({
                scene: 'labo',
                personnage: 'systeme',
                texte: 'INITIALISATION...',
            })
        );
        expect(typeof cutscene?.lignes[0]).toBe('object');
    });

    it('obtenirCutsceneEntree retourne null si deja visite', () => {
        expect(obtenirCutsceneEntree('monde_prologue', false)).toBeNull();
    });

    it('obtenirCutscenePostMonde conserve les metadata', () => {
        const post = obtenirCutscenePostMonde('monde_trame', true);
        expect(post?.lignes[0]).toEqual(
            expect.objectContaining({ scene: 'trame', personnage: 'narrateur' })
        );
    });
});
