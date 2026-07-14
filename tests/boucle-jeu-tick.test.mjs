import { describe, it, expect } from 'vitest';
import { effetsVisuelsActifs } from '../js/logique/boucle-jeu-tick.js';

describe('boucle-jeu-tick', () => {
    it('effetsVisuelsActifs retourne un booléen', () => {
        expect(typeof effetsVisuelsActifs()).toBe('boolean');
    });
});
