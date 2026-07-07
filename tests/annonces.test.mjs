import { describe, it, expect, beforeEach, vi } from 'vitest';
import { etat } from '../js/etat/store-jeu.js';
import { annoncer, annoncerPieceActive, annoncerPieceCourante } from '../js/annonces.js';

describe('annonces', () => {
    /** @type {{ textContent: string } | null} */
    let zone;

    beforeEach(() => {
        zone = { textContent: '' };
        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'annonce-jeu') return zone;
            return null;
        });
    });

    it('annoncer met à jour la zone live', () => {
        annoncer('Combo x3');
        expect(zone.textContent).toBe('Combo x3');
    });

    it('annoncerPieceActive inclut colonne et ligne', () => {
        annoncerPieceActive({ type: 'T', x: 4, y: 2 });
        expect(zone.textContent).toBe('Piece T, colonne 5, ligne 3');
    });

    it('annoncerPieceActive sans position utilise le libellé générique', () => {
        annoncerPieceActive({ type: 'I' });
        expect(zone.textContent).toBe('Nouvelle piece barre');
    });

    it('annoncerPieceCourante lit la pièce active du store', () => {
        etat.pieceActuelle = { type: 'O', x: 0, y: 0 };
        annoncerPieceCourante();
        expect(zone.textContent).toBe('Piece carre, colonne 1, ligne 1');
    });
});
