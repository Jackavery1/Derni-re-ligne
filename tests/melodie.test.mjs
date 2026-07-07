import { describe, it, expect, beforeEach } from 'vitest';
import {
    melodie,
    ligneVersFrequence,
    couleurVersTimbre,
    genererTitreMelodie,
    reinitialiserMelodie,
    audioMelodieDisponible,
} from '../js/audio/melodie.js';

describe('melodie', () => {
    beforeEach(() => {
        reinitialiserMelodie();
    });

    it('ligneVersFrequence : ligne haute plus aiguë que ligne basse', () => {
        melodie.biome = 'classique';
        const haut = ligneVersFrequence(0);
        const bas = ligneVersFrequence(19);
        expect(haut).toBeGreaterThan(bas);
    });

    it('ligneVersFrequence : ocean plus grave que glace', () => {
        melodie.biome = 'ocean';
        const freqOcean = ligneVersFrequence(10);
        melodie.biome = 'glace';
        const freqGlace = ligneVersFrequence(10);
        expect(freqOcean).toBeLessThan(freqGlace);
    });

    it('couleurVersTimbre mappe les couleurs connues', () => {
        expect(couleurVersTimbre('#00f5ff')).toBe('sine');
        expect(couleurVersTimbre('#ff006e')).toBe('square');
    });

    it('genererTitreMelodie retourne vide sans notes', () => {
        expect(genererTitreMelodie()).toBe('');
    });

    it('genererTitreMelodie produit un titre avec OP.', () => {
        melodie.notes = [
            { frequence: 440, timbre: 'sine', couleur: '#00f5ff', duree: 0.35, ligne: 5 },
            { frequence: 330, timbre: 'triangle', couleur: '#ffe600', duree: 0.35, ligne: 10 },
        ];
        const titre = genererTitreMelodie();
        expect(titre).toMatch(/OP\.002/);
    });

    it('reinitialiserMelodie vide les notes', () => {
        melodie.notes.push({ frequence: 220, timbre: 'sine' });
        reinitialiserMelodie();
        expect(melodie.notes).toHaveLength(0);
    });

    it('audioMelodieDisponible détecte Web Audio', () => {
        expect(typeof audioMelodieDisponible()).toBe('boolean');
    });
});
