import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

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
        expect(exclus.length).toBeGreaterThan(1);
    }, 15000);
});
