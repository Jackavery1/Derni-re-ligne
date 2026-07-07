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

    it('le SW precache les scenes eager du registre (pas les lazy)', () => {
        for (const [, scene] of Object.entries(SCENES_CUTSCENE)) {
            if (scene.lazy) continue;
            const src = scene.src.replace(/^assets\//, './assets/');
            expect(swSource).toContain(src);
        }
        expect(SCENES_CUTSCENE.vide_errance?.lazy).toBe(true);
        expect(swSource).not.toContain('scene_vide_errance');
    });

    it('vide_errance est annotee lazy et referencee par une cutscene entree', () => {
        const vide = CUTSCENES_ENTREE.monde_vide;
        const lignes = Array.isArray(vide) ? vide : (vide?.lignes ?? []);
        expect(lignes.some((l) => l.scene === 'vide_errance')).toBe(true);
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
