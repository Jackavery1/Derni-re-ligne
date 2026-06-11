import { readFileSync, readdirSync } from 'fs';
import { describe, expect, it } from 'vitest';

describe('decoupage main.css', () => {
    it('main.css agrège les modules via @import', () => {
        const main = readFileSync('styles/main.css', 'utf8');
        const imports = main.match(/@import url\('([^']+)'\)/g) ?? [];
        expect(imports.length).toBeGreaterThanOrEqual(20);
        expect(main.split('\n').length).toBeLessThan(30);
    });

    it('chaque module @import existe sur disque', () => {
        const main = readFileSync('styles/main.css', 'utf8');
        const fichiers = [...main.matchAll(/@import url\('([^']+)'\)/g)].map((m) => m[1]);
        for (const f of fichiers) {
            expect(readdirSync('styles')).toContain(f);
        }
    });
});
