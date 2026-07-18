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
        expect(incl).toContain('logique/partie-fin-commun.js');
        const config = readFileSync(join(racine, 'vitest.config.mjs'), 'utf8');
        expect(config).toMatch(/branches:\s*80/);
    });

    it('exclut modules etendus hors seuil 80 % (chemins complets)', () => {
        const incl = new Set(lireConfigCoverage());
        const exclusEtendu = [
            'rendu/rendu-fx.js',
            'ui/charger-ecrans.js',
            'ui/navigation-ecrans.js',
            'rendu/boucle-jeu.js',
            'logique/effets-partie.js',
        ];
        for (const mod of exclusEtendu) {
            expect(incl.has(mod), mod).toBe(false);
        }
        expect(incl.has('rendu/rendu-plateau-pieces.js')).toBe(true);
        expect(incl.has('histoire/histoire-map-rendu.js')).toBe(true);
    });

    it('modules exclus restent testes hors metrique coverage', () => {
        const tests = readFileSync(join(racine, 'tests', 'effets-partie.test.mjs'), 'utf8');
        expect(tests).toMatch(/initialiserEffetsPartie/);
        const incl = new Set(lireConfigCoverage());
        expect(incl.has('logique/effets-partie.js')).toBe(false);
    });

    it('chiffre le perimetre etendu (hors seuil 80 %)', () => {
        const config = readFileSync(join(racine, 'vitest.config.mjs'), 'utf8');
        const etendu = readFileSync(join(racine, 'vitest.config.etendu.mjs'), 'utf8');
        const blocEtendu =
            config.match(/COVERAGE_ETENDU_EXCLUS_SEUIL_80 = \[([\s\S]*?)\];/)?.[1] ?? '';
        const exclus = [...blocEtendu.matchAll(/'js\/([^']+)'/g)].map((m) => m[1]);
        expect(exclus.length).toBeGreaterThanOrEqual(5);
        expect(etendu).toMatch(/COVERAGE_ETENDU_EXCLUS_SEUIL_80/);
        expect(etendu).toMatch(/COVERAGE_LOGIC/);
        const incl = lireConfigCoverage();
        expect(incl.length).toBeGreaterThanOrEqual(20);
        const totalModulesJs = readFileSync(
            join(racine, 'scripts', 'generer-precache.mjs'),
            'utf8'
        );
        expect(totalModulesJs).toMatch(/listerJsRecursif/);
    });
});
