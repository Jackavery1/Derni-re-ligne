import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import {
    PORTRAITS,
    CUTSCENES_ENTREE,
    CUTSCENES_POST_MONDE,
    CUTSCENES_VICTOIRE_BOSS,
    EPILOGUES,
    DIALOGUES_COMBAT_BOSS,
    INTERLUDES,
} from '../js/histoire-textes.js';
import { ACHIEVEMENTS_HISTOIRE } from '../js/achievements-histoire.js';
import { INTRO_HISTOIRE, OUTRO_FINS } from '../js/histoire-textes/intro-interludes.js';
import { TRANSITIONS_CHAPITRE } from '../js/histoire-textes/chapitres.js';
import { SCENES_CUTSCENE } from '../js/scenes-cutscene.js';
import { FRAGMENTS_VERA_SIGNAL } from '../js/histoire-textes/journaux.js';
import { SEQUENCE_HISTOIRE } from '../js/histoire-donnees.js';
import { HUMEURS_PERSONNAGES } from '../js/expressions-cutscene.js';
import { idPortraitRendu } from '../js/histoire/histoire-cutscene-config.js';
import { CLE_FRAGMENT_PAR_MONDE } from '../js/histoire/histoire-manager-post-monde.js';
import {
    SCENE_DEFAUT_POST_MONDE,
    SCENE_DEFAUT_VICTOIRE_BOSS,
} from '../js/histoire/histoire-narratif.js';

const BOSS_CONNUS = new Set(['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion']);

const REGISTRES_NARRATIFS = [
    ['CUTSCENES_ENTREE', CUTSCENES_ENTREE],
    ['CUTSCENES_POST_MONDE', CUTSCENES_POST_MONDE],
    ['CUTSCENES_VICTOIRE_BOSS', CUTSCENES_VICTOIRE_BOSS],
    ['INTERLUDES', INTERLUDES],
    ['EPILOGUES', EPILOGUES],
    ['OUTRO_FINS', OUTRO_FINS],
    ['FRAGMENTS_VERA_SIGNAL', FRAGMENTS_VERA_SIGNAL],
];

function extrairePersonnagesCutscenes(objet) {
    const ids = new Set();
    for (const entree of Object.values(objet)) {
        const lignes = extraireLignesCutscene(entree);
        for (const ligne of lignes) {
            if (ligne?.personnage) ids.add(ligne.personnage);
        }
    }
    return [...ids];
}

function extraireLignesCutscene(entree) {
    return Array.isArray(entree) ? entree : (entree?.lignes ?? []);
}

function sceneDefautEntree(entree) {
    if (Array.isArray(entree)) return null;
    return entree?.scene ?? null;
}

function* itererLignesNarratives(registre) {
    for (const [nomRegistre, objet] of registre) {
        for (const [cle, entree] of Object.entries(objet)) {
            const defaut = sceneDefautEntree(entree);
            for (const ligne of extraireLignesCutscene(entree)) {
                yield { nomRegistre, cle, ligne, sceneDefaut: defaut };
            }
        }
    }
}

describe('histoire-textes — cohérence portraits', () => {
    it('chaque personnage narratif existe dans PORTRAITS ou est un boss connu', () => {
        const personnages = new Set();
        for (const [, objet] of REGISTRES_NARRATIFS) {
            for (const id of extrairePersonnagesCutscenes(objet)) personnages.add(id);
        }
        for (const ligne of INTRO_HISTOIRE.lignes ?? []) {
            if (ligne.personnage) personnages.add(ligne.personnage);
        }
        for (const id of personnages) {
            const connu = PORTRAITS[id] || BOSS_CONNUS.has(id) || id === 'narrateur';
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

    it('INTERLUDES contient gardiens, elle et veille', () => {
        expect(extraireLignesCutscene(INTERLUDES.interlude_gardiens).length).toBeGreaterThan(3);
        expect(extraireLignesCutscene(INTERLUDES.interlude_elle).length).toBeGreaterThan(3);
        expect(extraireLignesCutscene(INTERLUDES.interlude_veille).length).toBeGreaterThan(3);
    });

    it('monde_boss_1 inclut le dialogue du Brasier', () => {
        const lignes = extraireLignesCutscene(CUTSCENES_ENTREE.monde_boss_1);
        expect(lignes.some((l) => l.personnage === 'brasier' && l.texte.includes('APPROCHE'))).toBe(
            true
        );
        expect(lignes[0]?.scene).toBe('seuil_brasier');
    });

    it('CUTSCENES_POST_MONDE.monde_trame existe avec au moins 8 lignes', () => {
        expect(
            extraireLignesCutscene(CUTSCENES_POST_MONDE.monde_trame)?.length
        ).toBeGreaterThanOrEqual(8);
    });

    it('chaque cutscene post-monde expose un fond de scene valide', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        for (const mondeId of Object.keys(CUTSCENES_POST_MONDE)) {
            const entree = CUTSCENES_POST_MONDE[mondeId];
            const scene =
                entree?.scene ??
                extraireLignesCutscene(entree)[0]?.scene ??
                SCENE_DEFAUT_POST_MONDE[mondeId];
            expect(scene && ids.has(scene), `${mondeId} → ${scene}`).toBe(true);
        }
    });

    it('cutscenes victoire boss brasier et sentinelle changent de scene en cours de dialogue', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        for (const bossId of ['brasier', 'sentinelle']) {
            const lignes = extraireLignesCutscene(CUTSCENES_VICTOIRE_BOSS[bossId]);
            const scenes = [...new Set(lignes.map((l) => l.scene).filter(Boolean))];
            expect(scenes.length, bossId).toBeGreaterThan(1);
            for (const scene of scenes) {
                expect(ids.has(scene), `${bossId} → ${scene}`).toBe(true);
            }
            expect(lignes[0]?.scene ?? SCENE_DEFAUT_VICTOIRE_BOSS[bossId]).toBe(
                SCENE_DEFAUT_VICTOIRE_BOSS[bossId]
            );
        }
    });

    it('cutscenes victoire archiviste et avantgarde declarent une scene explicite', () => {
        for (const bossId of ['archiviste', 'avantgarde']) {
            const lignes = extraireLignesCutscene(CUTSCENES_VICTOIRE_BOSS[bossId]);
            expect(lignes[0]?.scene, bossId).toBe(SCENE_DEFAUT_VICTOIRE_BOSS[bossId]);
            expect(lignes.every((l) => l.scene)).toBe(true);
        }
    });

    it('narration francaise sans typos connues audit D', () => {
        const motifs = [
            /\btu as avance\b/i,
            /\becran principal\b/i,
            /Si tu trouvés/i,
            /\bpieces\b/i,
            /\bhesitation\b/i,
            /\bgravite est inversee\b/i,
            /\bdifferemment\b/i,
        ];
        const corpus = REGISTRES_NARRATIFS.flatMap(([, objet]) =>
            Object.values(objet).flatMap((entree) =>
                extraireLignesCutscene(entree).map((l) => l.texte)
            )
        ).join('\n');
        for (const motif of motifs) {
            expect(corpus).not.toMatch(motif);
        }
    });

    it('entree Codex Paradoxe sans accents dans le corps', () => {
        const entree = JSON.parse(
            readFileSync('data/codex-textes.json', 'utf8')
        ).chronique_paradoxe;
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

    it('CLE_FRAGMENT_PAR_MONDE couvre chaque fragment narratif', () => {
        for (const cle of Object.values(CLE_FRAGMENT_PAR_MONDE)) {
            expect(FRAGMENTS_VERA_SIGNAL[cle]?.length, cle).toBeGreaterThan(0);
        }
        expect(CLE_FRAGMENT_PAR_MONDE.monde_vide).toBe('apres_vide');
    });

    it('chaque monde narratif visible a une cutscene post-monde', () => {
        const mondes = SEQUENCE_HISTOIRE.filter((m) => !m.estBoss && !m.estCache);
        for (const monde of mondes) {
            const entree = CUTSCENES_POST_MONDE[monde.id];
            const nb = extraireLignesCutscene(entree).length;
            expect(nb, monde.id).toBeGreaterThan(0);
        }
    });

    it('mondes secrets ont une cutscene post-monde ou entree dediee', () => {
        for (const id of ['monde_miroir', 'monde_trame', 'monde_paradoxe']) {
            expect(
                CUTSCENES_POST_MONDE[id]?.lignes?.length ?? CUTSCENES_POST_MONDE[id]?.length ?? 0,
                id
            ).toBeGreaterThan(0);
        }
        expect(CUTSCENES_ENTREE.monde_paradoxe).toBeTruthy();
    });

    it('chaque cutscene post-monde declare une scene explicite', () => {
        for (const [mondeId, entree] of Object.entries(CUTSCENES_POST_MONDE)) {
            const scene = entree?.scene ?? extraireLignesCutscene(entree)[0]?.scene;
            expect(scene, mondeId).toBeTruthy();
        }
    });

    it('chaque monde de SEQUENCE_HISTOIRE a une cutscene entree', () => {
        for (const monde of SEQUENCE_HISTOIRE) {
            const lignes = extraireLignesCutscene(CUTSCENES_ENTREE[monde.id]);
            expect(lignes.length, monde.id).toBeGreaterThan(0);
        }
    });

    it('scenes referencees dans les cutscenes existent dans le registre ou sont absentes', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        for (const { nomRegistre, cle, ligne } of itererLignesNarratives(REGISTRES_NARRATIFS)) {
            if (!ligne.scene) continue;
            expect(ids.has(ligne.scene), `${nomRegistre}.${cle} → ${ligne.scene}`).toBe(true);
        }
        for (const ligne of INTRO_HISTOIRE.lignes ?? []) {
            if (!ligne.scene) continue;
            expect(ids.has(ligne.scene), `INTRO → ${ligne.scene}`).toBe(true);
        }
    });

    it('humeurs de cutscene sont valides pour chaque personnage', () => {
        for (const { nomRegistre, cle, ligne } of itererLignesNarratives(REGISTRES_NARRATIFS)) {
            if (!ligne.humeur) continue;
            const pid = ligne.personnage ?? 'narrateur';
            const rendu = idPortraitRendu(pid);
            const valides = HUMEURS_PERSONNAGES[rendu] ?? HUMEURS_PERSONNAGES[pid];
            expect(valides, `${nomRegistre}.${cle} ${pid}`).toBeTruthy();
            expect(valides.includes(ligne.humeur), `${nomRegistre}.${cle} ${ligne.humeur}`).toBe(
                true
            );
        }
    });

    it('humeurs intro et transitions chapitre sont valides', () => {
        const lignes = [
            ...(INTRO_HISTOIRE.lignes ?? []).map((ligne) => ({
                nomRegistre: 'INTRO_HISTOIRE',
                cle: 'intro',
                ligne,
            })),
            ...Object.entries(TRANSITIONS_CHAPITRE).flatMap(([cle, entree]) =>
                extraireLignesCutscene(entree).map((ligne) => ({
                    nomRegistre: 'TRANSITIONS_CHAPITRE',
                    cle,
                    ligne,
                }))
            ),
        ];
        for (const { nomRegistre, cle, ligne } of lignes) {
            if (!ligne.humeur) continue;
            const pid = ligne.personnage ?? 'narrateur';
            const rendu = idPortraitRendu(pid);
            const valides = HUMEURS_PERSONNAGES[rendu] ?? HUMEURS_PERSONNAGES[pid];
            expect(valides, `${nomRegistre}.${cle} ${pid}`).toBeTruthy();
            expect(valides.includes(ligne.humeur), `${nomRegistre}.${cle} ${ligne.humeur}`).toBe(
                true
            );
        }
    });

    it('chaque cutscene entree a une scene par defaut ou sur la premiere ligne', () => {
        for (const [mondeId, entree] of Object.entries(CUTSCENES_ENTREE)) {
            const defaut = sceneDefautEntree(entree);
            const lignes = extraireLignesCutscene(entree);
            const scenePremiereLigne = lignes[0]?.scene ?? null;
            expect(defaut || scenePremiereLigne, `${mondeId} sans fond de scene`).toBeTruthy();
        }
    });

    it('vide_errance est referencee dans une cutscene et marquee lazy', () => {
        const vide = extraireLignesCutscene(CUTSCENES_ENTREE.monde_vide);
        expect(vide.some((l) => l.scene === 'vide_errance')).toBe(true);
        expect(SCENES_CUTSCENE.vide_errance?.lazy).toBe(true);
    });
});
