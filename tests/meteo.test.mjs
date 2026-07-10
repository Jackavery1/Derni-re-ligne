import { describe, it, expect } from 'vitest';
import { METEO_BIOMES } from '../js/config/contenu-jeu.js';
import { ORDRE_BIOMES } from '../js/config/biomes.js';

describe('météo', () => {
    for (const id of ORDRE_BIOMES) {
        describe(id, () => {
            it('événement météo défini', () => {
                expect(METEO_BIOMES[id]).toBeTruthy();
            });
            it('effet présent', () => {
                expect(typeof METEO_BIOMES[id].effet).toBe('string');
            });
            it('durée numérique', () => {
                expect(typeof METEO_BIOMES[id].duree).toBe('number');
            });
        });
    }

    it('9 effets météo distincts', () => {
        const effets = new Set(ORDRE_BIOMES.map((id) => METEO_BIOMES[id].effet));
        expect(effets.size).toBe(9);
    });
});
