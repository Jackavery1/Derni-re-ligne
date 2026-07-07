import { describe, it, expect } from 'vitest';
import {
    invaliderDonneesEtoilesHistoire,
    obtenirCouchesFondHistoire,
} from '../js/histoire/histoire-map-fond-donnees.js';
import { FORMES_CONSTELLATION_HISTOIRE } from '../js/histoire/histoire-map-fond-formes.js';

describe('histoire-map-fond', () => {
    it('expose six formes de constellation', () => {
        expect(FORMES_CONSTELLATION_HISTOIRE).toHaveLength(6);
    });

    it('genere les couches fond pour une taille donnee', () => {
        invaliderDonneesEtoilesHistoire();
        const couches = obtenirCouchesFondHistoire(800, 600);
        expect(couches.etoiles.length).toBe(800);
        expect(couches.constellations.length).toBe(45);
        expect(couches.nebuleuses.length).toBe(5);
        expect(couches.planetes.length).toBe(22);
    });

    it('reutilise le cache pour la meme largeur', () => {
        invaliderDonneesEtoilesHistoire();
        const a = obtenirCouchesFondHistoire(640, 480);
        const b = obtenirCouchesFondHistoire(640, 520);
        expect(a.etoiles).toBe(b.etoiles);
    });
});
