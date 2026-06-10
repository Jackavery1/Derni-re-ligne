import { describe, it, expect } from 'vitest';
import { appliquerScoreLignes } from '../js/score-partie.js';

function etatPartie() {
    return { score: 0, lignes: 0, niveau: 1, combo: 0, dernierEtaitTetris: false };
}

describe('score-partie', () => {
    it('applique un Tetris et le back-to-back', () => {
        const etat = etatPartie();
        etat.dernierEtaitTetris = true;
        const result = appliquerScoreLignes(etat, 4);
        expect(result.tetris).toBe(true);
        expect(result.backToBack).toBe(true);
        expect(etat.score).toBeGreaterThan(0);
    });

    it('remet le combo a zero sans ligne', () => {
        const etat = etatPartie();
        etat.combo = 3;
        appliquerScoreLignes(etat, 0);
        expect(etat.combo).toBe(0);
    });

    it('utilise le palier histoire pour le score sans level up solo', () => {
        const etat = etatPartie();
        etat.lignes = 9;
        const result = appliquerScoreLignes(etat, 1, null, {
            niveauScore: 8,
            ignorerLevelUp: true,
        });
        expect(result.levelUp).toBe(false);
        expect(etat.niveau).toBe(1);
        expect(etat.lignes).toBe(10);
        expect(etat.score).toBe(800);
    });
});
