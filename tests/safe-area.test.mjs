import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = join(import.meta.dirname, '..');

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
        expect(iface).toMatch(/var\(--safe-top\)/);
        expect(tactiles).toMatch(/var\(--safe-bottom\)/);
    });
});
