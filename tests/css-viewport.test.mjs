import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const STYLES_DIR = join(import.meta.dirname, '..', 'styles');
const CSS_EXTRA = [join(import.meta.dirname, '..', 'assets', 'cutscenes', 'cutscenes.css')];

function listerFichiersCss(dossier) {
    return readdirSync(dossier, { withFileTypes: true }).flatMap((entree) => {
        const chemin = join(dossier, entree.name);
        if (entree.isDirectory()) return listerFichiersCss(chemin);
        return entree.name.endsWith('.css') ? [chemin] : [];
    });
}

describe('css viewport mobile', () => {
    it('n utilise plus de hauteur 100vh dans les feuilles de style', () => {
        const violations = [];
        const fichiers = [
            ...listerFichiersCss(STYLES_DIR),
            ...CSS_EXTRA.filter((f) => {
                try {
                    readFileSync(f);
                    return true;
                } catch {
                    return false;
                }
            }),
        ];
        for (const fichier of fichiers) {
            const lignes = readFileSync(fichier, 'utf8').split('\n');
            lignes.forEach((ligne, index) => {
                if (/\b100vh\b/.test(ligne) && !/\b100dvh\b/.test(ligne)) {
                    violations.push(
                        `${fichier.replace(/\\/g, '/').split('/').slice(-2).join('/')}:${index + 1}`
                    );
                }
            });
        }
        expect(violations).toEqual([]);
    });
});
