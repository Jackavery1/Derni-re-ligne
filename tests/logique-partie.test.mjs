import { describe, it, expect, beforeEach } from 'vitest';
import { jouable } from '../js/logique-partie.js';
import { etat } from '../js/contexte-jeu.js';

describe('logique-partie', () => {
    beforeEach(() => {
        etat.estEnCours = false;
        etat.estEnPause = false;
        etat.pieceActuelle = null;
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
});
