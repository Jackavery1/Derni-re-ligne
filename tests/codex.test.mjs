import { describe, it, expect, beforeEach } from 'vitest';
import { CODEX } from '../js/codex-donnees.js';
import { ILLUSTRATIONS_CODEX } from '../js/codex-illustrations.js';
import { statsGlobales } from '../js/achievements.js';
import {
    codexDebloque,
    codexVus,
    chargerCodex,
    sauvegarderCodex,
    verifierCodex,
} from '../js/codex.js';

describe('codex', () => {
    beforeEach(() => {
        localStorage.removeItem('tetrisNeo_codex');
        localStorage.removeItem('tetrisNeo_codexVus');
        codexDebloque.clear();
        codexVus.clear();
        statsGlobales.biomesJoues = new Set();
        statsGlobales.typesReliquesUtilises = new Set();
        statsGlobales.maxLignesUnCoup = 0;
        statsGlobales.meilleurTempsParBiome = {};
        statsGlobales.meteosSubies = 0;
        statsGlobales.meteosPartieActuelle = new Set();
        statsGlobales.maxNotesComposition = 0;
        statsGlobales.lignesTotal = 0;
        statsGlobales.nbAchievementsDebloques = 0;
    });

    it('contient 42 entrées réparties en 3 chapitres', () => {
        expect(Object.keys(CODEX)).toHaveLength(42);
        const mondes = Object.values(CODEX).filter((e) => e.chapitre === 'mondes');
        const reliques = Object.values(CODEX).filter((e) => e.chapitre === 'reliques');
        const chroniques = Object.values(CODEX).filter((e) => e.chapitre === 'chroniques');
        expect(mondes).toHaveLength(14);
        expect(reliques).toHaveLength(9);
        expect(chroniques).toHaveLength(19);
    });

    it('chaque illustration référencée existe', () => {
        for (const entree of Object.values(CODEX)) {
            expect(typeof ILLUSTRATIONS_CODEX[entree.illustration]).toBe('function');
        }
    });

    it('verifierCodex débloque monde_classique après partie classique', async () => {
        statsGlobales.biomesJoues.add('classique');
        await verifierCodex();
        expect(codexDebloque.has('monde_classique')).toBe(true);
    });

    it('sauvegarde et recharge les entrées débloquées', async () => {
        statsGlobales.biomesJoues.add('lave');
        await verifierCodex();
        sauvegarderCodex();
        codexDebloque.clear();
        const rechargé = chargerCodex();
        codexDebloque.clear();
        rechargé.forEach((id) => codexDebloque.add(id));
        expect(codexDebloque.has('monde_lave')).toBe(true);
    });

    it('chronique_premier_tetris nécessite 4 lignes en un coup', () => {
        const entree = CODEX.chronique_premier_tetris;
        expect(entree.condition({ maxLignesUnCoup: 3 })).toBe(false);
        expect(entree.condition({ maxLignesUnCoup: 4 })).toBe(true);
    });

    it('chronique_chaos_maitrise nécessite blizzard et inversion (cumulés entre parties)', () => {
        const entree = CODEX.chronique_chaos_maitrise;
        expect(
            entree.condition({
                meteosVues: new Set(['blizzard']),
            })
        ).toBe(false);
        expect(
            entree.condition({
                meteosVues: new Set(['blizzard', 'inversion']),
            })
        ).toBe(true);
    });
});
