import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SCENES_CUTSCENE } from '../js/rendu/scenes-cutscene.js';
import {
    CUTSCENES_ENTREE,
    CUTSCENES_POST_MONDE,
    CUTSCENES_VICTOIRE_BOSS,
    EPILOGUES,
    INTERLUDES,
} from '../js/histoire-textes.js';
import { INTRO_HISTOIRE, OUTRO_FINS } from '../js/histoire-textes/intro-interludes.js';
import { TRANSITIONS_CHAPITRE } from '../js/histoire-textes/chapitres.js';
import { FRAGMENTS_VERA_SIGNAL } from '../js/histoire-textes/journaux.js';
import {
    SCENE_DEFAUT_TRANSITION_CHAPITRE,
    SCENE_DEFAUT_POST_MONDE,
    SCENE_DEFAUT_INTERLUDE,
} from '../js/histoire/histoire-narratif-scenes.js';
import { lireCheminsScenesArrierePlanSw } from '../e2e/helpers-sw-precache.mjs';

const racine = join(import.meta.dirname, '..');
const swSource = readFileSync(join(racine, 'sw.js'), 'utf8');

function extraireLignes(entree) {
    return Array.isArray(entree) ? entree : (entree?.lignes ?? []);
}

function collecterScenes(objet) {
    const scenes = new Set();
    for (const entree of Object.values(objet)) {
        if (!Array.isArray(entree) && entree?.scene) scenes.add(entree.scene);
        for (const ligne of extraireLignes(entree)) {
            if (ligne.scene) scenes.add(ligne.scene);
        }
    }
    return scenes;
}

describe('scenes-cutscene — assets et registre', () => {
    it('chaque src du registre pointe vers un PNG existant', () => {
        for (const [id, scene] of Object.entries(SCENES_CUTSCENE)) {
            expect(scene.type).toBe('image');
            const chemin = join(racine, scene.src);
            expect(existsSync(chemin), `${id} → ${scene.src}`).toBe(true);
        }
    });

    it('le SW precache les scenes eager du registre', () => {
        for (const [, scene] of Object.entries(SCENES_CUTSCENE)) {
            if (scene.lazy) continue;
            const src = scene.src.replace(/^assets\//, './assets/');
            expect(swSource).toContain(src);
        }
    });

    it('interlude_gardiens est precachee a l install (monde rouille)', () => {
        const installBloc =
            swSource.match(/SCENES_CUTSCENE_INSTALL\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
        expect(installBloc).toContain('scene_interlude_gardiens');
    });

    it('interlude_elle est precachee a l install (monde eclipse)', () => {
        const installBloc =
            swSource.match(/SCENES_CUTSCENE_INSTALL\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
        expect(installBloc).toContain('scene_interlude_elle');
    });

    it('seuil_brasier est precachee a l install (premier boss)', () => {
        expect(swSource).toContain('scene_seuil_brasier');
        const installBloc =
            swSource.match(/SCENES_CUTSCENE_INSTALL\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
        expect(installBloc).toContain('scene_seuil_brasier');
    });

    it('vide_errance est lazy mais precachee en arriere-plan SW', () => {
        expect(SCENES_CUTSCENE.vide_errance?.lazy).toBe(true);
        expect(swSource).toContain('scene_vide_errance');
    });

    it('chaque scene lazy du registre est precachee install ou arriere-plan SW', () => {
        const installBloc =
            swSource.match(/SCENES_CUTSCENE_INSTALL\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
        const arrierePlanBloc =
            swSource.match(/SCENES_CUTSCENE_ARRIERE_PLAN\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
        for (const [id, scene] of Object.entries(SCENES_CUTSCENE)) {
            if (!scene.lazy) continue;
            const src = scene.src.replace(/^assets\//, './assets/');
            const precache = installBloc.includes(src) || arrierePlanBloc.includes(src);
            expect(precache, `${id} doit etre precachee`).toBe(true);
        }
    });

    it('helper E2E aligne sur SCENES_CUTSCENE_ARRIERE_PLAN', () => {
        const chemins = lireCheminsScenesArrierePlanSw();
        expect(chemins.length).toBeGreaterThanOrEqual(10);
        for (const chemin of chemins) {
            expect(swSource).toContain(chemin);
        }
    });

    it('vide_errance est annotee lazy et referencee par une cutscene entree', () => {
        const vide = CUTSCENES_ENTREE.monde_vide;
        const lignes = Array.isArray(vide) ? vide : (vide?.lignes ?? []);
        expect(lignes.some((l) => l.scene === 'vide_errance')).toBe(true);
    });

    it('chaque transition de chapitre a une scene par defaut', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        for (const cle of Object.keys(TRANSITIONS_CHAPITRE)) {
            const scene = SCENE_DEFAUT_TRANSITION_CHAPITRE[cle];
            expect(scene, cle).toBeTruthy();
            expect(ids.has(scene), `${cle} → ${scene}`).toBe(true);
        }
    });

    it('les scenes interlude sont reservees aux interludes narratifs', () => {
        const scenesInterlude = new Set(Object.values(SCENE_DEFAUT_INTERLUDE));
        for (const scene of Object.values(SCENE_DEFAUT_TRANSITION_CHAPITRE)) {
            expect(scenesInterlude.has(scene)).toBe(false);
        }
        for (const scene of Object.values(SCENE_DEFAUT_POST_MONDE)) {
            expect(scenesInterlude.has(scene)).toBe(false);
        }
        for (const [cle, interlude] of Object.entries(INTERLUDES)) {
            const sceneAttendue = SCENE_DEFAUT_INTERLUDE[cle];
            expect(sceneAttendue, cle).toBeTruthy();
            if (Array.isArray(interlude)) {
                expect(interlude.every((l) => l.scene === sceneAttendue || !l.scene)).toBe(true);
            } else {
                expect(interlude.scene).toBe(sceneAttendue);
            }
        }
    });

    it('toutes les scenes narrativement referencees existent dans le registre', () => {
        const ids = new Set(Object.keys(SCENES_CUTSCENE));
        const toutes = new Set([
            ...collecterScenes(CUTSCENES_ENTREE),
            ...collecterScenes(CUTSCENES_POST_MONDE),
            ...collecterScenes(CUTSCENES_VICTOIRE_BOSS),
            ...collecterScenes(TRANSITIONS_CHAPITRE),
            ...collecterScenes(INTERLUDES),
            ...collecterScenes(EPILOGUES),
            ...collecterScenes(OUTRO_FINS),
            ...collecterScenes(FRAGMENTS_VERA_SIGNAL),
            ...Object.values(SCENE_DEFAUT_TRANSITION_CHAPITRE),
        ]);
        if (INTRO_HISTOIRE.scene) toutes.add(INTRO_HISTOIRE.scene);
        for (const ligne of INTRO_HISTOIRE.lignes ?? []) {
            if (ligne.scene) toutes.add(ligne.scene);
        }
        for (const scene of toutes) {
            expect(ids.has(scene), `scene manquante : ${scene}`).toBe(true);
        }
    });
});
