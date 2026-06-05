import { describe, it, expect, beforeEach } from 'vitest';
import { jouable, appliquerScoreLignes, vitesseChute } from '../js/logique-partie.js';
import { etat } from '../js/store-jeu.js';
import { CONFIG } from '../js/config.js';
import { supprimerLignesDuPlateau } from '../js/logique-pure.js';
import { creerPlateau } from '../js/piece-jeu.js';

describe('logique-partie', () => {
    beforeEach(() => {
        etat.estEnCours = false;
        etat.estEnPause = false;
        etat.pieceActuelle = null;
        etat.score = 0;
        etat.lignes = 0;
        etat.niveau = 1;
        etat.combo = 0;
        etat.dernierEtaitTetris = false;
    });

    it('jouable exige une partie en cours', () => {
        expect(jouable()).toBe(false);
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        expect(jouable()).toBe(true);
    });

    it('jouable refuse la pause', () => {
        etat.estEnCours = true;
        etat.estEnPause = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        expect(jouable()).toBe(false);
    });

    it('jouable exige une pièce active', () => {
        etat.estEnCours = true;
        expect(jouable()).toBe(false);
    });

    it('vitesseChute diminue avec le niveau', () => {
        etat.niveau = 1;
        const v1 = vitesseChute();
        etat.niveau = 5;
        const v5 = vitesseChute();
        expect(v5).toBeLessThan(v1);
        expect(v5).toBeGreaterThanOrEqual(CONFIG.vitesseMin);
    });

    it('appliquerScoreLignes ajoute les points Tetris', () => {
        const partie = { score: 0, lignes: 0, niveau: 2, combo: 0, dernierEtaitTetris: false };
        const result = appliquerScoreLignes(partie, 4);
        expect(result.points).toBe(1600);
        expect(partie.score).toBe(1600);
        expect(partie.lignes).toBe(4);
        expect(result.tetris).toBe(true);
        expect(partie.combo).toBe(1);
    });

    it('appliquerScoreLignes détecte back-to-back Tetris', () => {
        const partie = { score: 1000, lignes: 4, niveau: 1, combo: 1, dernierEtaitTetris: true };
        const result = appliquerScoreLignes(partie, 4);
        expect(result.backToBack).toBe(true);
    });

    it('appliquerScoreLignes remet le combo à zéro sans ligne', () => {
        const partie = { score: 500, lignes: 10, niveau: 2, combo: 3, dernierEtaitTetris: false };
        appliquerScoreLignes(partie, 0);
        expect(partie.combo).toBe(0);
        expect(partie.score).toBe(500);
    });

    it('appliquerScoreLignes monte de niveau à 10 lignes', () => {
        const partie = { score: 0, lignes: 9, niveau: 1, combo: 0, dernierEtaitTetris: false };
        const result = appliquerScoreLignes(partie, 1);
        expect(result.levelUp).toBe(true);
        expect(partie.niveau).toBe(2);
    });

    it('supprimerLignesDuPlateau efface une ligne complète', () => {
        const plateau = creerPlateau();
        plateau[CONFIG.lignes - 1].fill('#00f5ff');
        const {
            plateau: nouveau,
            nbSupprimees,
            lignesEffacees,
        } = supprimerLignesDuPlateau(plateau);
        expect(nbSupprimees).toBe(1);
        expect(lignesEffacees).toEqual([CONFIG.lignes - 1]);
        expect(nouveau[0].every((c) => c === 0)).toBe(true);
        expect(nouveau[CONFIG.lignes - 1].every((c) => c === 0)).toBe(true);
    });
});
