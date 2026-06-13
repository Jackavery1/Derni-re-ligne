import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SCENES_CUTSCENE } from '../js/scenes-cutscene.js';

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

    it('le SW precache les 8 scenes du registre (pas vide_errance)', () => {
        for (const id of Object.keys(SCENES_CUTSCENE)) {
            const src = SCENES_CUTSCENE[id].src.replace(/^assets\//, './assets/');
            expect(swSource).toContain(src);
        }
        expect(swSource).not.toContain('scene_vide_errance');
    });
});
