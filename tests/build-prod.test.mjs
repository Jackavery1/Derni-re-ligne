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
    });
});
