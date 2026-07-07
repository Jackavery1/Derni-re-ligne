import { describe, it, expect } from 'vitest';
import { determinerHumeurLignes } from '../js/ui/mascotte-robo.js';
import { convertirHumeurVersCanvas } from '../js/ui/mascotte-robo.js';

describe('mascotte-robo', () => {
    it('cartographie les lignes effacées vers la bonne humeur', () => {
        expect(determinerHumeurLignes(0)).toBeNull();
        expect(determinerHumeurLignes(1)).toEqual({ humeur: 'content', priorite: 1, duree: 1200 });
        expect(determinerHumeurLignes(2)).toEqual({ humeur: 'content', priorite: 1, duree: 1200 });
        expect(determinerHumeurLignes(3)).toEqual({ humeur: 'content', priorite: 1, duree: 1200 });
        expect(determinerHumeurLignes(4)).toEqual({ humeur: 'excite', priorite: 3, duree: 2500 });
        expect(determinerHumeurLignes(4, 2)).toEqual({
            humeur: 'excite',
            priorite: 3,
            duree: 2500,
        });
        expect(determinerHumeurLignes(1, 3)).toEqual({
            humeur: 'content',
            priorite: 2,
            duree: 2000,
        });
        expect(determinerHumeurLignes(4, 3)).toEqual({
            humeur: 'excite',
            priorite: 3,
            duree: 2500,
        });
    });

    it('convertit les humeurs jeu vers les 5 expressions canvas', () => {
        expect(convertirHumeurVersCanvas('neutre')).toBe('neutre');
        expect(convertirHumeurVersCanvas('heureux')).toBe('content');
        expect(convertirHumeurVersCanvas('excite-plus')).toBe('excite');
        expect(convertirHumeurVersCanvas('triomphal')).toBe('excite');
        expect(convertirHumeurVersCanvas('triste')).toBe('triste');
        expect(convertirHumeurVersCanvas('stresse')).toBe('alerte');
        expect(convertirHumeurVersCanvas('inquiet')).toBe('alerte');
    });
});
