import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const racine = join(import.meta.dirname, '..');
const stylesDir = join(racine, 'styles');

describe('css-keyframes — registre centralisé', () => {
    it('animations.css contient toutes les keyframes du projet', () => {
        const animations = readFileSync(join(stylesDir, 'animations.css'), 'utf8');
        const noms = [...animations.matchAll(/@keyframes\s+([^\s{]+)/g)].map((m) => m[1]);
        expect(noms.length).toBeGreaterThanOrEqual(35);
        expect(new Set(noms).size).toBe(noms.length);
    });

    it('aucun @keyframes hors animations.css (hors cutscenes externes)', () => {
        const ignore = new Set(['animations.css', 'main.css']);
        const orphelins = [];
        for (const fichier of readdirSync(stylesDir).filter(
            (f) => f.endsWith('.css') && !ignore.has(f)
        )) {
            const contenu = readFileSync(join(stylesDir, fichier), 'utf8');
            if (/@keyframes/.test(contenu)) orphelins.push(fichier);
        }
        expect(orphelins).toEqual([]);
    });
});
