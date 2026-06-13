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
import { INTRO_HISTOIRE } from '../js/histoire-textes/intro-interludes.js';
import { SCENES_CUTSCENE } from '../js/scenes-cutscene.js';
import { FRAGMENTS_VERA_SIGNAL } from '../js/histoire-textes/journaux.js';
import { SEQUENCE_HISTOIRE } from '../js/histoire-donnees.js';

function extrairePersonnagesCutscenes(objet) {
    const ids = new Set();
    for (const entree of Object.values(objet)) {
        const lignes = Array.isArray(entree) ? entree : (entree?.lignes ?? []);
        if (!Array.isArray(lignes)) continue;
        for (const ligne of lignes) {
            if (ligne?.personnage) ids.add(ligne.personnage);
        }
    }
    return [...ids];
}

function extraireLignesCutscene(entree) {
    return Array.isArray(entree) ? entree : (entree?.lignes ?? []);
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
        expect(PORTRAITS.avantgarde_voix).toBeDefined();
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
        const lignes = extraireLignesCutscene(CUTSCENES_ENTREE.monde_boss_1);
        expect(lignes.some((l) => l.personnage === 'brasier' && l.texte.includes('APPROCHE'))).toBe(
            true
        );
        expect(lignes[0]?.scene).toBe('seuil_brasier');
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
        const entree = extraireLignesCutscene(CUTSCENES_ENTREE.monde_paradoxe);
        const epilogue = EPILOGUES.monde_paradoxe ?? [];
        expect(JSON.stringify(entree)).not.toBe(JSON.stringify(epilogue));
        expect(entree.length).toBeGreaterThan(epilogue.length);
    });

    it('intro et monde_trame referencent des scenes du registre', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        const lignesIntro = INTRO_HISTOIRE.lignes ?? [];
        expect(lignesIntro.some((l) => l.scene === 'fragmentation' && ids.has(l.scene))).toBe(true);
        const entreeTrame = extraireLignesCutscene(CUTSCENES_ENTREE.monde_trame);
        expect(entreeTrame.some((l) => l.scene === 'trame')).toBe(true);
    });

    it('FRAGMENTS_VERA_SIGNAL couvre les mondes narratifs principaux', () => {
        for (const cle of [
            'apres_prologue',
            'apres_ocean',
            'apres_foret',
            'apres_glace',
            'apres_desert',
            'apres_eclipse',
            'apres_lave',
            'apres_rouille',
            'apres_cyber',
            'apres_fuochi',
            'apres_cosmos',
            'apres_vide',
        ]) {
            expect(FRAGMENTS_VERA_SIGNAL[cle]?.length, cle).toBeGreaterThan(0);
        }
    });

    it('chaque monde narratif visible a une cutscene post-monde', () => {
        const mondes = SEQUENCE_HISTOIRE.filter((m) => !m.estBoss && !m.estCache);
        for (const monde of mondes) {
            expect(CUTSCENES_POST_MONDE[monde.id]?.length, monde.id).toBeGreaterThan(0);
        }
    });

    it('mondes secrets ont une cutscene post-monde ou entree dediee', () => {
        for (const id of ['monde_miroir', 'monde_trame']) {
            expect(CUTSCENES_POST_MONDE[id]?.length ?? 0, id).toBeGreaterThan(0);
        }
        expect(CUTSCENES_ENTREE.monde_paradoxe).toBeTruthy();
    });

    it('chaque monde de SEQUENCE_HISTOIRE a une cutscene entree', () => {
        for (const monde of SEQUENCE_HISTOIRE) {
            const lignes = extraireLignesCutscene(CUTSCENES_ENTREE[monde.id]);
            expect(lignes.length, monde.id).toBeGreaterThan(0);
        }
    });

    it('scenes referencees dans les cutscenes existent dans le registre ou sont absentes', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        for (const [mondeId, entree] of Object.entries(CUTSCENES_ENTREE)) {
            for (const ligne of extraireLignesCutscene(entree)) {
                if (!ligne.scene) continue;
                expect(ids.has(ligne.scene), `${mondeId} → ${ligne.scene}`).toBe(true);
            }
        }
    });

    it('vide_errance est referencee dans une cutscene et marquee lazy', () => {
        const vide = extraireLignesCutscene(CUTSCENES_ENTREE.monde_vide);
        expect(vide.some((l) => l.scene === 'vide_errance')).toBe(true);
        expect(SCENES_CUTSCENE.vide_errance?.lazy).toBe(true);
    });
});
