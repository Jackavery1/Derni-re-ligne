import { describe, it, expect } from 'vitest';
import { RELIQUES, ORDRE_BIOMES } from '../js/config.js';

describe('reliques', () => {
    for (const id of ORDRE_BIOMES) {
        describe(id, () => {
            it('relique définie', () => {
                expect(RELIQUES[id]).toBeTruthy();
            });
            it('effet présent', () => {
                expect(typeof RELIQUES[id].effet).toBe('string');
            });
            it('forme non vide', () => {
                expect(RELIQUES[id].forme?.length).toBeGreaterThan(0);
            });
        });
    }

    it('9 effets distincts', () => {
        const effets = new Set(ORDRE_BIOMES.map((id) => RELIQUES[id].effet));
        expect(effets.size).toBe(9);
    });
});
