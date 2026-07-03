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

    it('n utilise pas de max-height en vh statique (preferer dvh)', () => {
        const violations = [];
        const ignorer = new Set(['dev.css']);
        const fichiers = listerFichiersCss(STYLES_DIR);
        for (const fichier of fichiers) {
            const base = fichier.replace(/\\/g, '/').split('/').pop() ?? '';
            if (ignorer.has(base)) continue;
            const lignes = readFileSync(fichier, 'utf8').split('\n');
            lignes.forEach((ligne, index) => {
                if (/\bmax-height\s*:[^;]*\b\d+vh\b/.test(ligne) && !/\d+dvh/.test(ligne)) {
                    violations.push(
                        `${fichier.replace(/\\/g, '/').split('/').slice(-2).join('/')}:${index + 1}`
                    );
                }
            });
        }
        expect(violations).toEqual([]);
    });

    it('cibles tactiles secondaires utilisent 48px minimum (pas 44px)', () => {
        const fichiers = ['ecran-selection.css', 'boss.css'];
        const violations = [];
        for (const nom of fichiers) {
            const contenu = readFileSync(join(STYLES_DIR, nom), 'utf8');
            if (/min-height:\s*44px/.test(contenu)) {
                violations.push(nom);
            }
        }
        expect(violations).toEqual([]);
    });

    it('journal et fin histoire utilisent dvh avec safe-area en max-height de base', () => {
        const css = readFileSync(join(STYLES_DIR, 'mode-histoire.css'), 'utf8');
        expect(css).toMatch(
            /#histoire-journal-contenu[\s\S]*?max-height:\s*calc\(90dvh - var\(--safe-top\) - var\(--safe-bottom\)\)/
        );
        expect(css).toMatch(
            /#histoire-fin-contenu[\s\S]*?max-height:\s*calc\(90dvh - var\(--safe-top\) - var\(--safe-bottom\)\)/
        );
    });

    it('conteneur jeu utilise 100dvw (pas 100vw)', () => {
        const css = readFileSync(join(STYLES_DIR, 'interface-jeu.css'), 'utf8');
        expect(css).toMatch(/#conteneur-principal[\s\S]*?width:\s*100dvw/);
        expect(css).not.toMatch(/#conteneur-principal[\s\S]*?width:\s*100vw[^d]/);
    });

    it('conteneur coop utilise 100dvw et safe-area comme solo', () => {
        const css = readFileSync(join(STYLES_DIR, 'ecran-selection.css'), 'utf8');
        expect(css).toMatch(/#conteneur-principal-coop[\s\S]*?width:\s*100dvw/);
        expect(css).toMatch(
            /body\.coop-active #conteneur-principal-coop[\s\S]*?padding:\s*var\(--safe-top\)/
        );
    });
});
