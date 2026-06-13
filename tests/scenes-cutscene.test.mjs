import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SCENES_CUTSCENE } from '../js/scenes-cutscene.js';
import { CUTSCENES_ENTREE } from '../js/histoire-textes.js';

const racine = join(import.meta.dirname, '..');
const swSource = readFileSync(join(racine, 'sw.js'), 'utf8');

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
});
