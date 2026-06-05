import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config.js';
import {
    archi,
    archi_parserSilhouette,
    archi_calculerScoreTempsReel,
    archi_calculerEtoiles,
} from '../js/archi-logique.js';
import { creerPlateau } from '../js/piece-jeu.js';

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
