import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from '../js/config/config-jeu.js';

vi.mock('../js/etat/bus-jeu.js', () => ({
    emettre: vi.fn(),
}));

import { emettre } from '../js/etat/bus-jeu.js';
import {
    archi,
    archi_parserSilhouette,
    archi_calculerScoreTempsReel,
    archi_calculerEtoiles,
    archi_prochainePiece,
    archi_estPositionValide,
    archi_verrouillerPiece,
    archi_annuler,
    archi_reinitialiserEtatNiveau,
} from '../js/logique/archi-logique.js';
import { NIVEAUX_ARCHI } from '../js/archi-donnees/assembleur-niveaux.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';

describe('archi_parserSilhouette', () => {
    it('centre la silhouette sur le plateau', () => {
        const niveau = {
            id: 'test',
            silhouette: ['....####..', '....####..', '....####..', '....####..'],
        };
        archi_parserSilhouette(niveau);
        expect(archi.silhouetteParsee.length).toBe(CONFIG.lignes);
        expect(archi.silhouetteParsee[0].length).toBe(CONFIG.colonnes);

        let compteur = 0;
        for (let l = 0; l < CONFIG.lignes; l++) {
            for (let c = 0; c < CONFIG.colonnes; c++) {
                if (archi.silhouetteParsee[l][c]) compteur++;
            }
        }
        expect(compteur).toBe(16);
    });
});

describe('archi_calculerScoreTempsReel', () => {
    beforeEach(() => {
        archi.plateau = creerPlateau();
        archi.niveauActuel = { parPieces: 4 };
        archi.piecesUtilisees = 4;
        archi_parserSilhouette({
            id: 'carre',
            silhouette: ['....####..', '....####..', '....####..', '....####..'],
        });
    });

    it('score parfait avec couverture complète sans débordement', () => {
        const offL = archi.offsetLigne;
        const offC = archi.offsetColonne;
        for (let l = 0; l < 4; l++) {
            for (let c = 0; c < 4; c++) {
                archi.plateau[offL + l][offC + 4 + c] = '#00ff88';
            }
        }
        archi_calculerScoreTempsReel();
        expect(archi.precisionActuelle).toBe(1);
        expect(archi.efficaciteActuelle).toBe(1);
        expect(archi.scorePartie).toBe(1000);
    });

    it('pénalise les cellules hors silhouette', () => {
        archi.plateau[0][0] = '#ff006e';
        archi_calculerScoreTempsReel();
        expect(archi.precisionActuelle).toBe(0);
    });
});

describe('archi_calculerEtoiles', () => {
    it('attribue les seuils définis', () => {
        expect(archi_calculerEtoiles(850)).toBe(3);
        expect(archi_calculerEtoiles(650)).toBe(2);
        expect(archi_calculerEtoiles(400)).toBe(1);
        expect(archi_calculerEtoiles(399)).toBe(0);
    });
});

describe('archi_prochainePiece', () => {
    beforeEach(() => {
        archi.inventaire = [
            { type: 'I', qteDispo: 1 },
            { type: 'O', qteDispo: 1 },
        ];
    });

    it('retourne la première pièce disponible de l’inventaire', () => {
        const piece = archi_prochainePiece();
        expect(piece?.type).toBe('I');
        expect(piece?.rotation).toBe(0);
    });

    it('retourne null si inventaire épuisé', () => {
        archi.inventaire = [{ type: 'I', qteDispo: 0 }];
        expect(archi_prochainePiece()).toBeNull();
    });
});

describe('archi_estPositionValide', () => {
    beforeEach(() => {
        archi.plateau = creerPlateau();
    });

    it('rejette une pièce hors plateau', () => {
        const piece = { type: 'I', rotation: 0, x: -5, y: 0 };
        expect(archi_estPositionValide(piece)).toBe(false);
    });
});

describe('archi_verrouillerPiece et archi_annuler', () => {
    beforeEach(() => {
        archi.niveauActuel = NIVEAUX_ARCHI[0];
        archi_reinitialiserEtatNiveau();
        archi_parserSilhouette(archi.niveauActuel);
    });

    it('verrouille une pièce et en propose une autre', () => {
        const resultat = archi_verrouillerPiece();
        expect(resultat).toBe('continue');
        expect(archi.piecesUtilisees).toBe(1);
        expect(archi.pieceActuelle).not.toBeNull();
        expect(archi.inventaire[0].qteDispo).toBe(3);
        expect(emettre).toHaveBeenCalledWith('piece:son', { type: 'verrou' });
    });

    it('archi_annuler restaure le snapshot précédent', () => {
        const pieceAvant = { ...archi.pieceActuelle };
        archi_verrouillerPiece();
        archi_annuler();
        expect(archi.pieceActuelle).toEqual(pieceAvant);
        expect(archi.piecesUtilisees).toBe(0);
    });
});
