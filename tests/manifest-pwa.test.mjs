import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));

describe('manifest PWA', () => {
    it('expose scope, short_name et screenshots', () => {
        expect(manifest.scope).toBe('./');
        expect(manifest.short_name).toBe('DLigne');
        expect(Array.isArray(manifest.screenshots)).toBe(true);
        expect(manifest.screenshots.length).toBeGreaterThan(0);
    });

    it('icones maskable et any presentes', () => {
        const purposes = manifest.icons.map((i) => i.purpose);
        expect(purposes).toContain('any');
        expect(purposes).toContain('maskable');
    });
});
