import { describe, it, expect, beforeEach, vi } from 'vitest';
import { obtenirProgressionAchievement } from '../js/achievements-progres.js';

vi.mock('../js/progression.js', () => ({
    chargerEtatHistoire: vi.fn(() => ({
        bossVaincus: ['brasier'],
        prouessesHistoire: {
            blocksRouillesMax: 12,
            lignesEclipseBasseMax: 0,
            lignesVideMax: 0,
            precisionMiroirMax: 0.5,
        },
    })),
}));

describe('achievements-progres', () => {
    /** @type {object} */
    let stats;

    beforeEach(() => {
        stats = {
            lignesTotal: 42,
            meilleurScore: 5000,
            maxLignesUnCoup: 2,
            maxCombo: 0,
            nbAchievementsDebloques: 3,
            meilleurTemps: 90,
            biomesJoues: new Set(['classique', 'lave']),
            reliquesUtilisees: 4,
            typesReliquesUtilises: new Set(['doublon']),
            meteosSubies: 2,
            oracleMeilleuresMult: 2.5,
            lignesCoopTotal: 0,
            meilleurTempsParBiome: { lave: 120 },
            lignesParBiome: { cosmos: 10 },
        };
    });

    it('retourne la progression pour un exploit mesurable', () => {
        const prog = obtenirProgressionAchievement('centenaire', 'lignes', stats);
        expect(prog).toEqual({ actuel: 42, cible: 100 });
    });

    it('plafonne la progression au seuil', () => {
        stats.lignesTotal = 500;
        const prog = obtenirProgressionAchievement('centenaire', 'lignes', stats);
        expect(prog?.actuel).toBe(100);
    });

    it('masque la progression pour les categories narratives', () => {
        expect(obtenirProgressionAchievement('premier_monde', 'histoire', stats)).toBeNull();
        expect(
            obtenirProgressionAchievement('fin_normale_obtenue', 'histoire_fins', stats)
        ).toBeNull();
    });

    it('lit la progression boss depuis l etat histoire', () => {
        const prog = obtenirProgressionAchievement('tous_boss', 'histoire_boss', stats);
        expect(prog).toEqual({ actuel: 1, cible: 5 });
    });

    it('formate la progression oracle en decimal', () => {
        const prog = obtenirProgressionAchievement('oracle_maitre', 'oracle', stats);
        expect(prog?.formaterTexte?.(2.5, 4)).toBe('2.5 / 4.0');
    });
});
