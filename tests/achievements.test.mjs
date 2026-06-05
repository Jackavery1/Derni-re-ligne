import { describe, it, expect, beforeEach } from 'vitest';
import {
    ACHIEVEMENTS,
    statsGlobales,
    majStatsScorePartie,
    majStatsLignesEffacees,
    majStatsRelique,
    verifierAchievements,
    sauvegarderStats,
    chargerStats,
} from '../js/achievements.js';

describe('achievements', () => {
    beforeEach(() => {
        statsGlobales.lignesTotal = 0;
        statsGlobales.meilleurScore = 0;
        statsGlobales.maxLignesUnCoup = 0;
        statsGlobales.maxCombo = 0;
        statsGlobales.nbAchievementsDebloques = 0;
        statsGlobales.debloqués = {};
        statsGlobales.decorationsActives = [];
        statsGlobales.reliquesUtilisees = 0;
        statsGlobales.typesReliquesUtilises = new Set();
        statsGlobales.biomesJoues = new Set();
        statsGlobales.meteosPartieActuelle = new Set();
    });

    it('contient 32 achievements', () => {
        expect(Object.keys(ACHIEVEMENTS)).toHaveLength(32);
    });

    it('majStatsScorePartie met à jour maxLignesUnCoup et maxCombo', () => {
        majStatsScorePartie(4, 3);
        expect(statsGlobales.maxLignesUnCoup).toBe(4);
        expect(statsGlobales.maxCombo).toBe(3);
    });

    it('majStatsLignesEffacees cumule lignesTotal', () => {
        majStatsLignesEffacees(2);
        majStatsLignesEffacees(1);
        expect(statsGlobales.lignesTotal).toBe(3);
    });

    it('verifierAchievements débloque premier_tetris', () => {
        statsGlobales.maxLignesUnCoup = 4;
        verifierAchievements();
        expect(statsGlobales.debloqués.premier_tetris).toBeTruthy();
        expect(statsGlobales.decorationsActives).toContain('flash_cyan');
    });

    it('collectionneur nécessite 9 types de reliques', () => {
        const effets = [
            'doublon',
            'explosion',
            'flottaison',
            'croissance',
            'blizzard',
            'remplissage',
            'hack',
            'colonne',
            'gravite',
        ];
        effets.forEach((e) => majStatsRelique(e));
        verifierAchievements();
        expect(statsGlobales.debloqués.collectionneur).toBeTruthy();
    });

    it('verifierAchievements débloque centenaire', () => {
        statsGlobales.lignesTotal = 100;
        verifierAchievements();
        expect(statsGlobales.debloqués.centenaire).toBeTruthy();
    });

    it('verifierAchievements débloque score_10k', () => {
        statsGlobales.meilleurScore = 10000;
        verifierAchievements();
        expect(statsGlobales.debloqués.score_10k).toBeTruthy();
    });

    it('verifierAchievements débloque explorateur', () => {
        statsGlobales.biomesJoues = new Set(['classique', 'lave', 'ocean']);
        verifierAchievements();
        expect(statsGlobales.debloqués.explorateur).toBeTruthy();
    });

    it('sauvegarde et recharge les stats', () => {
        statsGlobales.lignesTotal = 42;
        statsGlobales.biomesJoues.add('lave');
        sauvegarderStats();
        statsGlobales.lignesTotal = 0;
        statsGlobales.biomesJoues = new Set();
        chargerStats();
        expect(statsGlobales.lignesTotal).toBe(42);
        expect(statsGlobales.biomesJoues.has('lave')).toBe(true);
    });
});
