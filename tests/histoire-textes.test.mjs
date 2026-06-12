import { describe, it, expect } from 'vitest';
import {
    PORTRAITS,
    CUTSCENES_ENTREE,
    CUTSCENES_POST_MONDE,
    EPILOGUES,
    DIALOGUES_COMBAT_BOSS,
    INTERLUDES,
} from '../js/histoire-textes.js';
import { CODEX_HISTOIRE } from '../js/codex-histoire.js';
import { ACHIEVEMENTS_HISTOIRE } from '../js/achievements-histoire.js';

function extrairePersonnagesCutscenes(objet) {
    const ids = new Set();
    for (const lignes of Object.values(objet)) {
        if (!Array.isArray(lignes)) continue;
        for (const ligne of lignes) {
            if (ligne?.personnage) ids.add(ligne.personnage);
        }
    }
    return [...ids];
}

describe('histoire-textes — cohérence portraits', () => {
    it('chaque personnage de cutscene existe dans PORTRAITS ou est un boss connu', () => {
        const personnages = extrairePersonnagesCutscenes(CUTSCENES_ENTREE);
        const bossConnus = new Set([
            'brasier',
            'sentinelle',
            'archiviste',
            'avantgarde',
            'distorsion',
        ]);
        for (const id of personnages) {
            const connu = PORTRAITS[id] || bossConnus.has(id) || id === 'narrateur';
            expect(connu, `personnage inconnu : ${id}`).toBeTruthy();
        }
    });

    it('PORTRAITS contient les voix de boss', () => {
        expect(PORTRAITS.brasier_voix).toBeDefined();
        expect(PORTRAITS.sentinelle_voix).toBeDefined();
        expect(PORTRAITS.archiviste_voix).toBeDefined();
        expect(PORTRAITS.brasier).toBeDefined();
    });

    it('DIALOGUES_COMBAT_BOSS couvre les 5 boss avec champs requis', () => {
        const ids = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
        for (const id of ids) {
            const d = DIALOGUES_COMBAT_BOSS[id];
            expect(d.epithete).toBeTruthy();
            expect(d.debut).toBeTruthy();
            expect(d.phases.length).toBeGreaterThanOrEqual(2);
            expect(d.reactionTetris).toBeTruthy();
            expect(d.quasiVaincu).toBeTruthy();
            expect(d.gameOver).toBeTruthy();
        }
        expect(DIALOGUES_COMBAT_BOSS.distorsion.phases).toHaveLength(3);
    });

    it('INTERLUDES contient gardiens et veille', () => {
        expect(INTERLUDES.interlude_gardiens?.length).toBeGreaterThan(3);
        expect(INTERLUDES.interlude_veille?.length).toBeGreaterThan(3);
    });

    it('monde_boss_1 inclut le dialogue du Brasier', () => {
        const lignes = CUTSCENES_ENTREE.monde_boss_1 ?? [];
        expect(lignes.some((l) => l.personnage === 'brasier' && l.texte.includes('APPROCHE'))).toBe(
            true
        );
    });

    it('CUTSCENES_POST_MONDE.monde_trame existe avec au moins 8 lignes', () => {
        expect(CUTSCENES_POST_MONDE.monde_trame?.length).toBeGreaterThanOrEqual(8);
    });

    it('entree Codex Paradoxe sans accents dans le corps', () => {
        const entree = CODEX_HISTOIRE.chronique_paradoxe;
        expect(entree).toBeDefined();
        expect(entree.titre).toBe('LE PARADOXE');
        expect(entree.texte.length).toBeGreaterThanOrEqual(3);
        for (const paragraphe of entree.texte) {
            expect(paragraphe).not.toMatch(/[éèêëàâùûôîï]/);
        }
    });

    it('achievement Paradoxe en categorie secrets avec description definie', () => {
        const ach = ACHIEVEMENTS_HISTOIRE.paradoxe_atteint;
        expect(ach).toBeDefined();
        expect(ach.categorie).toBe('histoire_secrets');
        expect(ach.description).toBeTruthy();
        expect(typeof ach.condition).toBe('function');
    });

    it('CUTSCENES_ENTREE.monde_paradoxe differe de EPILOGUES.monde_paradoxe', () => {
        const entree = CUTSCENES_ENTREE.monde_paradoxe ?? [];
        const epilogue = EPILOGUES.monde_paradoxe ?? [];
        expect(JSON.stringify(entree)).not.toBe(JSON.stringify(epilogue));
        expect(entree.length).toBeGreaterThan(epilogue.length);
    });
});
