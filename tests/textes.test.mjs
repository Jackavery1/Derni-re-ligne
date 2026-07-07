import { describe, it, expect } from 'vitest';
import { BIOMES, ORDRE_BIOMES } from '../js/config/config.js';

const CLES_REQUISES = [
    'score',
    'lignes',
    'niveau',
    'hold',
    'next',
    'gameOver',
    'pause',
    'robo',
    'record',
];

describe('textes biomes', () => {
    for (const id of ORDRE_BIOMES) {
        describe(id, () => {
            it('objet textes défini', () => {
                expect(BIOMES[id].textes).toBeTruthy();
            });
            for (const cle of CLES_REQUISES) {
                it(`clé "${cle}"`, () => {
                    const val = BIOMES[id].textes?.[cle];
                    expect(typeof val).toBe('string');
                    expect(val.length).toBeGreaterThan(0);
                });
            }
        });
    }

    it('Classique : libellé score', () => {
        expect(BIOMES.classique.textes.score).toBe('SCORE');
    });

    it('Cosmos : game over thématique', () => {
        expect(BIOMES.cosmos.textes.gameOver).toBe('SINGULARITÉ');
    });
});
