import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    ACHIEVEMENTS,
    statsGlobales,
    majStatsScorePartie,
    majStatsLignesEffacees,
    majStatsRelique,
    verifierAchievements,
    sauvegarderStats,
    chargerStats,
    majStatsMeteo,
    initStatsPartie,
    finaliserStatsPartie,
    genererGalerieAchievements,
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

    it('contient 58 achievements (33 arcade + 25 histoire)', () => {
        expect(Object.keys(ACHIEVEMENTS)).toHaveLength(58);
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

    it('majStatsMeteo enregistre les effets uniques par partie', () => {
        majStatsMeteo('turbo');
        majStatsMeteo('turbo');
        majStatsMeteo('inversion');
        expect(statsGlobales.meteosPartieActuelle.size).toBe(2);
    });

    it('initStatsPartie réinitialise les compteurs de session', () => {
        statsGlobales.meteosPartieActuelle.add('turbo');
        statsGlobales.oracleDeviationsPartieActuelle = 3;
        initStatsPartie();
        expect(statsGlobales.meteosPartieActuelle.size).toBe(0);
        expect(statsGlobales.oracleDeviationsPartieActuelle).toBe(0);
    });

    it('finaliserStatsPartie met à jour le meilleur score et le temps', () => {
        finaliserStatsPartie(5000, 120);
        expect(statsGlobales.meilleurScore).toBe(5000);
        expect(statsGlobales.meilleurTemps).toBe(120);
    });

    it('genererGalerieAchievements remplit la grille DOM', () => {
        class MockCanvas {
            constructor() {
                this.className = '';
                this.dataset = {};
                this.style = { setProperty: vi.fn() };
                this.width = 64;
                this.height = 64;
            }
            appendChild = vi.fn();
            setAttribute = vi.fn();
            getContext = vi.fn(() => null);
        }
        vi.stubGlobal('HTMLCanvasElement', MockCanvas);

        const grille = { textContent: '', appendChild: vi.fn() };
        const compteur = { textContent: '' };
        vi.stubGlobal('document', {
            getElementById: (id) => {
                if (id === 'ach-galerie-grille') return grille;
                if (id === 'ach-compteur') return compteur;
                return null;
            },
            querySelectorAll: () => [],
            createElement: (tag) => {
                if (tag === 'canvas') return new MockCanvas();
                return {
                    className: '',
                    dataset: {},
                    style: { setProperty: vi.fn() },
                    appendChild: vi.fn(),
                    append: vi.fn(),
                    addEventListener: vi.fn(),
                    setAttribute: vi.fn(),
                    tabIndex: 0,
                    textContent: '',
                };
            },
        });
        genererGalerieAchievements();
        expect(grille.appendChild).toHaveBeenCalledTimes(Object.keys(ACHIEVEMENTS).length);
        expect(compteur.textContent).toContain('/ 58');
    });
});
