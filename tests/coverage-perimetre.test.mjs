import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const racine = join(import.meta.dirname, '..');

function lireConfigCoverage() {
    const source = readFileSync(join(racine, 'vitest.config.mjs'), 'utf8');
    const bloc = source.match(/const COVERAGE_LOGIC = \[([\s\S]*?)\];/)?.[1] ?? '';
    return [...bloc.matchAll(/'js\/([^']+)'/g)].map((m) => m[1]).sort();
}

describe('coverage-perimetre', () => {
    it('liste blanche logique domaine avec seuils 80 %', () => {
        const incl = lireConfigCoverage();
        expect(incl.length).toBeGreaterThanOrEqual(20);
        expect(incl).toContain('logique/logique-pure.js');
        expect(incl).toContain('logique/score-partie.js');
        const config = readFileSync(join(racine, 'vitest.config.mjs'), 'utf8');
        expect(config).toMatch(/branches:\s*80/);
    });

    it('exclut rendu canvas et navigation (couverts E2E)', () => {
        const incl = new Set(lireConfigCoverage());
        const exclus = [
            'rendu-plateau-pieces.js',
            'rendu-fx.js',
            'charger-ecrans.js',
            'navigation-ecrans.js',
            'histoire-map-rendu.js',
            'boucle-jeu.js',
        ];
        for (const mod of exclus) {
            expect(incl.has(mod), mod).toBe(false);
        }
    });

    it('modules exclus restent testes hors metrique coverage', () => {
        const tests = readFileSync(join(racine, 'tests', 'effets-partie.test.mjs'), 'utf8');
        expect(tests).toMatch(/initialiserEffetsPartie/);
        const incl = new Set(lireConfigCoverage());
        expect(incl.has('effets-partie.js')).toBe(false);
    });

    it('chiffre le perimetre etendu (hors seuil 80 %)', () => {
        const config = readFileSync(join(racine, 'vitest.config.mjs'), 'utf8');
        const blocEtendu =
            config.match(/COVERAGE_ETENDU_EXCLUS_SEUIL_80 = \[([\s\S]*?)\];/)?.[1] ?? '';
        const exclus = [...blocEtendu.matchAll(/'js\/([^']+)'/g)].map((m) => m[1]);
        expect(exclus.length).toBeGreaterThanOrEqual(6);
        const incl = lireConfigCoverage();
        expect(incl.length).toBeGreaterThanOrEqual(20);
        const totalModulesJs = readFileSync(
            join(racine, 'scripts', 'generer-precache.mjs'),
            'utf8'
        );
        expect(totalModulesJs).toMatch(/listerJsRecursif/);
    });
});
