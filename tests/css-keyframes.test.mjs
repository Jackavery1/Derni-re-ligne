import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const racine = join(import.meta.dirname, '..');
const stylesDir = join(racine, 'styles');

const AGREGATEURS_CSS = new Set([
    'main.css',
    'ecran-selection.css',
    'animations.css',
    'mode-histoire.css',
    'overlays-meta.css',
    'objectifs-histoire.css',
    'boss.css',
    'menu-narratif.css',
    'interface-jeu.css',
    'mode-architecte.css',
]);

describe('css-keyframes — registre centralisé', () => {
    it('feuilles animations contiennent toutes les keyframes du projet', () => {
        const fichiers = readdirSync(stylesDir).filter(
            (f) => f.startsWith('animations-') && f.endsWith('.css')
        );
        const noms = [];
        for (const fichier of fichiers) {
            const animations = readFileSync(join(stylesDir, fichier), 'utf8');
            noms.push(...[...animations.matchAll(/@keyframes\s+([^\s{]+)/g)].map((m) => m[1]));
        }
        expect(noms.length).toBeGreaterThanOrEqual(35);
        expect(new Set(noms).size).toBe(noms.length);
    });

    it('aucun @keyframes hors feuilles animations-* (hors cutscenes externes)', () => {
        const ignore = new Set([...AGREGATEURS_CSS, 'dev.css']);
        const orphelins = [];
        for (const fichier of readdirSync(stylesDir).filter(
            (f) => f.endsWith('.css') && !ignore.has(f) && !f.startsWith('animations-')
        )) {
            const contenu = readFileSync(join(stylesDir, fichier), 'utf8');
            if (/@keyframes/.test(contenu)) orphelins.push(fichier);
        }
        expect(orphelins).toEqual([]);
    });
});
