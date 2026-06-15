import { describe, it, expect } from 'vitest';
import ICONES_PIXEL from '../data/icones-pixel.json';
import {
    ICONE_BIOME,
    ICONE_MONDE_HISTOIRE,
    obtenirIdIconeBiome,
    obtenirIdIconeMondeHistoire,
} from '../js/biome-icones-map.js';

describe('biome-icones-map', () => {
    it('mappe chaque biome vers une icone pixel valide', () => {
        for (const [biome, idIcone] of Object.entries(ICONE_BIOME)) {
            expect(ICONES_PIXEL[idIcone], `${biome} → ${idIcone}`).toBeTruthy();
            expect(obtenirIdIconeBiome(biome)).toBe(idIcone);
        }
    });

    it('mappe chaque monde histoire vers une icone pixel valide', () => {
        for (const [mondeId, idIcone] of Object.entries(ICONE_MONDE_HISTOIRE)) {
            expect(ICONES_PIXEL[idIcone], `${mondeId} → ${idIcone}`).toBeTruthy();
            expect(obtenirIdIconeMondeHistoire(mondeId)).toBe(idIcone);
        }
    });

    it('retombe sur chronique_architecte pour un biome inconnu', () => {
        expect(obtenirIdIconeBiome('inconnu')).toBe('chronique_architecte');
    });
});
