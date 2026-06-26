import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = join(import.meta.dirname, '..');

function lireFichiersCssRecursif(dir, acc = []) {
    for (const entree of readdirSync(dir, { withFileTypes: true })) {
        const chemin = join(dir, entree.name);
        if (entree.isDirectory()) lireFichiersCssRecursif(chemin, acc);
        else if (entree.name.endsWith('.css')) acc.push(chemin);
    }
    return acc;
}

describe('safe-area audit C', () => {
    it('index.html declare viewport-fit=cover pour encoche iPhone', () => {
        const html = readFileSync(join(RACINE, 'index.html'), 'utf8');
        expect(html).toMatch(/viewport-fit=cover/);
        expect(html).toMatch(/apple-mobile-web-app-status-bar-style.*black-translucent/);
    });

    it('variables.css expose les insets centralises', () => {
        const css = readFileSync(join(RACINE, 'styles', 'variables.css'), 'utf8');
        expect(css).toMatch(/--safe-top:\s*env\(safe-area-inset-top/);
        expect(css).toMatch(/--safe-bottom:\s*env\(safe-area-inset-bottom/);
    });

    it('ecrans-base positionne les ecrans dans la zone safe', () => {
        const css = readFileSync(join(RACINE, 'styles', 'ecrans-base.css'), 'utf8');
        expect(css).toMatch(/top:\s*var\(--safe-top\)/);
        expect(css).toMatch(/bottom:\s*var\(--safe-bottom\)/);
    });

    it('interface jeu et controles respectent les insets', () => {
        const iface = readFileSync(join(RACINE, 'styles', 'interface-jeu.css'), 'utf8');
        const tactiles = readFileSync(join(RACINE, 'styles', 'controles-tactiles.css'), 'utf8');
        const responsive = readFileSync(join(RACINE, 'styles', 'responsive.css'), 'utf8');
        const cutscenes = readFileSync(
            join(RACINE, 'assets', 'cutscenes', 'cutscenes.css'),
            'utf8'
        );
        expect(iface).toMatch(/var\(--safe-top\)/);
        expect(tactiles).toMatch(/var\(--safe-bottom\)/);
        expect(responsive).toMatch(/var\(--safe-left\)/);
        expect(cutscenes).toMatch(/var\(--safe-left\)/);
    });

    it('objectifs et carte histoire couvrent les viewports compacts', () => {
        const objectifs = readFileSync(join(RACINE, 'styles', 'objectifs-histoire.css'), 'utf8');
        const histoire = readFileSync(join(RACINE, 'styles', 'mode-histoire.css'), 'utf8');
        const archi = readFileSync(join(RACINE, 'styles', 'mode-architecte.css'), 'utf8');
        const pause = readFileSync(join(RACINE, 'styles', 'ecran-pause.css'), 'utf8');
        expect(objectifs).toMatch(/max-width:\s*768px\),\s*\(max-height:\s*600px\)/);
        expect(histoire).toMatch(/max-width:\s*768px\),\s*\(max-height:\s*600px\)/);
        expect(objectifs).toMatch(/orientation:\s*landscape/);
        expect(objectifs).toMatch(/var\(--safe-top\)/);
        expect(histoire).toMatch(/var\(--safe-top\)/);
        expect(cutscenesFrom(RACINE)).toMatch(/max-width:\s*319px/);
        expect(archi).toMatch(/var\(--safe-top\)/);
        expect(archi).toMatch(/overflow-y:\s*auto/);
        expect(archi).toMatch(/#controles-archi \.btn-tactile/);
        expect(pause).toMatch(/orientation:\s*landscape/);
        expect(pause).toMatch(/var\(--safe-top\)/);
    });

    it('n utilise env(safe-area-inset) que dans variables.css', () => {
        const cssRacine = join(RACINE, 'styles');
        const cutscenesDir = join(RACINE, 'assets', 'cutscenes');
        const fichiers = [
            ...lireFichiersCssRecursif(cssRacine),
            ...lireFichiersCssRecursif(cutscenesDir),
        ];
        const variables = join(RACINE, 'styles', 'variables.css');
        for (const fichier of fichiers) {
            if (fichier === variables) continue;
            const contenu = readFileSync(fichier, 'utf8');
            expect(contenu, fichier).not.toMatch(/env\(safe-area-inset/);
        }
    });
});

function cutscenesFrom(racine) {
    return readFileSync(join(racine, 'assets', 'cutscenes', 'cutscenes.css'), 'utf8');
}
