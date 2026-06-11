import { describe, it, expect } from 'vitest';
import ICONES_PIXEL from '../data/icones-pixel.json';
import { ICONE_BIOME_ARCHI, obtenirIdIconeBiomeArchi } from '../js/archi-icones-map.js';

describe('archi-icones-map', () => {
    it('mappe chaque biome architecte vers une icone pixel valide', () => {
        for (const [biome, idIcone] of Object.entries(ICONE_BIOME_ARCHI)) {
            expect(ICONES_PIXEL[idIcone], `${biome} → ${idIcone}`).toBeTruthy();
            expect(obtenirIdIconeBiomeArchi(biome)).toBe(idIcone);
        }
    });

    it('retombe sur chronique_architecte pour un biome inconnu', () => {
        expect(obtenirIdIconeBiomeArchi('inconnu')).toBe('chronique_architecte');
    });
});
