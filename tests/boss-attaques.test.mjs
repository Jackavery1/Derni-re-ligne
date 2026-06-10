import { describe, it, expect } from 'vitest';
import { CONFIG } from '../js/config.js';
import { creerPlateau } from '../js/piece-jeu.js';
import {
    attaqueRangeeBraise,
    attaqueColonneGelee,
    degelColonnes,
    hauteurEmpilement,
    COULEUR_GLACE_B,
} from '../js/boss-attaques.js';

describe('boss-attaques', () => {
    it('hauteurEmpilement compte les lignes occupees', () => {
        const plateau = creerPlateau();
        plateau[CONFIG.lignes - 1][0] = '#ff0000';
        expect(hauteurEmpilement(plateau)).toBe(1);
    });

    it('attaqueRangeeBraise refuse un stack deja trop haut', () => {
        const plateau = creerPlateau();
        for (let lig = 0; lig < CONFIG.lignes - 1; lig++) {
            plateau[lig] = Array(CONFIG.colonnes).fill('#ff0000');
        }
        expect(attaqueRangeeBraise(plateau)).toBe(false);
    });

    it('degelColonnes ne retire la glace que sur les colonnes actives', () => {
        const plateau = creerPlateau();
        const lig = CONFIG.lignes - 1;
        plateau[lig][0] = COULEUR_GLACE_B;
        plateau[lig][5] = COULEUR_GLACE_B;
        const effets = { colonnesGelees: [0], timerDegelMs: 1000 };
        degelColonnes(plateau, effets);
        expect(plateau[lig][0]).toBe(0);
        expect(plateau[lig][5]).toBe(COULEUR_GLACE_B);
        expect(effets.colonnesGelees).toEqual([]);
    });

    it('attaqueColonneGelee renseigne les colonnes gelees', () => {
        const plateau = creerPlateau();
        const effets = { colonnesGelees: [], timerDegelMs: 0 };
        const cols = attaqueColonneGelee(plateau, effets, 2, 5000);
        expect(cols).toHaveLength(2);
        expect(effets.timerDegelMs).toBe(5000);
    });
});
