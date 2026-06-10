import { describe, it, expect } from 'vitest';
import { _invaliderCacheGradientsPlateau } from '../js/rendu-plateau.js';

describe('rendu-plateau cache gradients', () => {
    it('_invaliderCacheGradientsPlateau reinitialise sans erreur', () => {
        _invaliderCacheGradientsPlateau();
        expect(() => _invaliderCacheGradientsPlateau()).not.toThrow();
    });
});
