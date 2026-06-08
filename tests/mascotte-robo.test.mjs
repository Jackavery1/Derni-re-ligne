import { describe, it, expect } from 'vitest';
import { determinerHumeurLignes } from '../js/mascotte-robo.js';
import { convertirHumeurVersCanvas } from '../js/mascotte-robo.js';

describe('mascotte-robo', () => {
    it('cartographie les lignes effacées vers la bonne humeur', () => {
        expect(determinerHumeurLignes(0)).toBeNull();
        expect(determinerHumeurLignes(1)).toBe('content');
        expect(determinerHumeurLignes(2)).toBe('heureux');
        expect(determinerHumeurLignes(3)).toBe('heureux');
        expect(determinerHumeurLignes(4)).toBe('excite');
        expect(determinerHumeurLignes(4, 2)).toBe('excite');
        expect(determinerHumeurLignes(1, 3)).toBe('excite-plus');
        expect(determinerHumeurLignes(4, 3)).toBe('excite-plus');
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
