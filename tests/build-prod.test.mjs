import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';

describe('build prod', () => {
    it('index.html dist inclut SRI sha384 sur bundle.js', () => {
        execSync('npm run build', { stdio: 'pipe' });
        const html = readFileSync('dist/index.html', 'utf8');
        expect(html).toMatch(
            /<script type="module" src="js\/bundle\.js" integrity="sha384-[^"]+" crossorigin="anonymous"><\/script>/
        );
        expect(html).not.toMatch(/neo-test-init\.js/);
        expect(readFileSync('dist/js/neo-test-init.js', 'utf8').length).toBeGreaterThan(100);
        const exclus = JSON.parse(readFileSync('dist/js/budget-exclus.json', 'utf8'));
        expect(exclus).toContain('neo-test-init.js');
        expect(exclus).toContain('dev-init.js');
        expect(exclus.length).toBeGreaterThan(2);
    }, 90_000);

    it('bundle cutscenes CSS et minifie les JSON data', () => {
        execSync('npm run build', { stdio: 'pipe' });
        const cutscenesDir = 'dist/assets/cutscenes';
        const css = readdirSync(cutscenesDir).filter((f) => f.endsWith('.css'));
        expect(css).toEqual(['cutscenes.css']);
        expect(readFileSync(`${cutscenesDir}/cutscenes.css`, 'utf8')).toMatch(
            /#ecran-histoire-cutscene/
        );
        expect(readFileSync('dist/data/histoire-textes.json', 'utf8')).not.toMatch(/\n {2}"/);
    }, 90_000);
});
