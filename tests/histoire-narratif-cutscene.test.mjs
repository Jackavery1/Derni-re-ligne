import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/io/charger-histoire-textes.js', () => ({
    obtenirHistoireTextesSync: vi.fn(),
}));

vi.mock('../js/histoire/histoire-manager-ui.js', () => ({
    afficherCutsceneHistoire: vi.fn(),
}));

import { obtenirHistoireTextesSync } from '../js/io/charger-histoire-textes.js';
import { afficherCutsceneHistoire } from '../js/histoire/histoire-manager-ui.js';
import {
    obtenirCutsceneEntree,
    obtenirCutscenePostMonde,
    afficherVictoireBoss,
} from '../js/histoire/histoire-narratif.js';

describe('histoire-narratif — metadata cutscene', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        obtenirHistoireTextesSync.mockReturnValue({
            CUTSCENES_ENTREE: {
                monde_prologue: [
                    { scene: 'labo', personnage: 'systeme', texte: 'INITIALISATION...' },
                    { scene: 'labo', personnage: 'robo', texte: 'Je suis conscient.' },
                ],
                monde_boss_1: [
                    { scene: 'seuil_brasier', personnage: 'brasier', texte: 'QUI APPROCHE ?' },
                ],
                monde_lave: {
                    scene: 'seuil_brasier',
                    lignes: [{ personnage: 'robo', texte: 'Le feu brûle plus fort.' }],
                },
            },
            CUTSCENES_POST_MONDE: {
                monde_trame: [
                    { scene: 'trame', personnage: 'narrateur', texte: 'La Trame accumule.' },
                ],
            },
            CUTSCENES_VICTOIRE_BOSS: {},
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

    it('obtenirCutsceneEntree conserve scene par defaut sur entree objet', () => {
        const cutscene = obtenirCutsceneEntree('monde_lave', true);
        expect(cutscene?.scene).toBe('seuil_brasier');
        expect(cutscene?.lignes[0]?.personnage).toBe('robo');
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

    it('obtenirCutscenePostMonde injecte la scene par defaut sur tableau brut', () => {
        obtenirHistoireTextesSync.mockReturnValue({
            CUTSCENES_ENTREE: {},
            CUTSCENES_POST_MONDE: {
                monde_lave: [{ personnage: 'robo', texte: 'Le feu brûle plus fort.' }],
            },
            CUTSCENES_VICTOIRE_BOSS: {},
        });
        const post = obtenirCutscenePostMonde('monde_lave', true);
        expect(post?.scene).toBe('seuil_brasier');
        expect(post?.lignes).toHaveLength(1);
        expect(post?.lignes[0]).toEqual(
            expect.objectContaining({ scene: 'seuil_brasier', personnage: 'robo' })
        );
    });

    it('obtenirCutscenePostMonde propage scene d enveloppe sur chaque ligne', () => {
        obtenirHistoireTextesSync.mockReturnValue({
            CUTSCENES_ENTREE: {},
            CUTSCENES_POST_MONDE: {
                monde_prologue: {
                    scene: 'labo',
                    lignes: [
                        { personnage: 'robo', texte: 'A', humeur: 'content' },
                        { personnage: 'robo', texte: 'B', humeur: 'excite' },
                    ],
                },
            },
            CUTSCENES_VICTOIRE_BOSS: {},
        });
        const post = obtenirCutscenePostMonde('monde_prologue', true);
        expect(post?.scene).toBe('labo');
        expect(post?.lignes.every((l) => l.scene === 'labo')).toBe(true);
    });

    it('afficherVictoireBoss enveloppe les lignes avec la scene par defaut du boss', async () => {
        obtenirHistoireTextesSync.mockReturnValue({
            CUTSCENES_ENTREE: {},
            CUTSCENES_POST_MONDE: {},
            CUTSCENES_VICTOIRE_BOSS: {
                brasier: [
                    { personnage: 'narrateur', texte: "Le Brasier s'effondre." },
                    { scene: 'labo', personnage: 'narrateur', texte: 'Inferno respire.' },
                ],
            },
        });
        afficherVictoireBoss('brasier', 'normal', () => {});
        await vi.waitFor(() => expect(afficherCutsceneHistoire).toHaveBeenCalled());
        const entree = afficherCutsceneHistoire.mock.calls[0][0];
        expect(entree.scene).toBe('seuil_brasier');
        expect(entree.lignes[1].scene).toBe('labo');
    });
});
