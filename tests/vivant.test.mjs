import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config.js';
import { etat, definirBiomeActif } from '../js/store-jeu.js';
import { creerPlateau } from '../js/piece-jeu.js';
import {
    COMPORTEMENTS_VIVANT,
    vivant,
    initialiserVivant,
    vivant_supprimerCellule,
    vivant_poserCellule,
    vivant_recompenserActivite,
    vivant_synchroniserApresLignes,
    calculerCellulesAffectees,
    mettreAJourVivant,
    declencherComportementVivant,
} from '../js/vivant.js';

describe('vivant', () => {
    beforeEach(() => {
        etat.plateau = creerPlateau();
        definirBiomeActif('lave');
        initialiserVivant();
    });

    it('classique n’a aucun comportement', () => {
        definirBiomeActif('classique');
        initialiserVivant();
        expect(COMPORTEMENTS_VIVANT.classique).toBeNull();
        mettreAJourVivant(60000);
        expect(vivant.phase).toBe('repos');
    });

    it('vivant_supprimerCellule respecte les bornes du plateau', () => {
        etat.plateau[5][4] = '#ff0000';
        vivant.plateauTemps[5][4] = Date.now();
        vivant_supprimerCellule(-1, 5);
        vivant_supprimerCellule(4, CONFIG.lignes);
        expect(etat.plateau[5][4]).toBe('#ff0000');
        vivant_supprimerCellule(4, 5);
        expect(etat.plateau[5][4]).toBe(0);
        expect(vivant.plateauTemps[5][4]).toBe(0);
    });

    it('vivant_poserCellule n’écrase pas une cellule existante', () => {
        etat.plateau[10][3] = '#abc';
        vivant_poserCellule(3, 10, '#fff');
        expect(etat.plateau[10][3]).toBe('#abc');
        vivant_poserCellule(3, 11, '#fff');
        expect(etat.plateau[11][3]).toBe('#fff');
    });

    it('vivant_recompenserActivite remet le timer à zéro', () => {
        vivant.timer = 15000;
        vivant.phase = 'alerte';
        vivant.cellulesAlerte = [{ x: 1, y: 1 }];
        vivant_recompenserActivite();
        expect(vivant.timer).toBe(0);
        expect(vivant.phase).toBe('repos');
        expect(vivant.cellulesAlerte).toEqual([]);
    });

    it('vivant_synchroniserApresLignes aligne plateauTemps', () => {
        etat.plateau[CONFIG.lignes - 1].fill('#00f5ff');
        vivant.plateauTemps[CONFIG.lignes - 1].fill(Date.now());
        vivant_synchroniserApresLignes([CONFIG.lignes - 1]);
        expect(vivant.plateauTemps[0].every((t) => t === 0)).toBe(true);
        expect(etat.plateau[0].every((c) => c === 0)).toBe(true);
    });

    it('respecte delaiMinimum avant alerte', () => {
        definirBiomeActif('lave');
        initialiserVivant();
        mettreAJourVivant(25000);
        expect(vivant.phase).toBe('repos');
        mettreAJourVivant(10000);
        expect(vivant.tempsJeu).toBeGreaterThanOrEqual(30000);
    });

    it('passe en alerte avant l’intervalle complet', () => {
        definirBiomeActif('cyber');
        initialiserVivant();
        vivant.tempsJeu = COMPORTEMENTS_VIVANT.cyber.delaiMinimum;
        mettreAJourVivant(COMPORTEMENTS_VIVANT.cyber.intervalle - vivant.DUREE_ALERTE);
        expect(vivant.phase).toBe('alerte');
        expect(vivant.cellulesAlerte.length).toBeGreaterThanOrEqual(0);
    });

    it('cosmos ne monte jamais au-dessus de la ligne 0', () => {
        definirBiomeActif('cosmos');
        etat.plateau[1][4] = '#aa44ff';
        vivant.plateauTemps[1][4] = Date.now();
        declencherComportementVivant('cosmos');
        expect(etat.plateau[0][4]).toBe('#aa44ff');
        expect(etat.plateau[1][4]).toBe(0);
    });

    it('calculerCellulesAffectees lave prend les blocs les plus anciens', () => {
        const maintenant = Date.now();
        etat.plateau[18][2] = '#111';
        etat.plateau[18][5] = '#222';
        vivant.plateauTemps[18][2] = maintenant - 20000;
        vivant.plateauTemps[18][5] = maintenant - 5000;
        const cellules = calculerCellulesAffectees('lave');
        expect(cellules.some((c) => c.x === 2 && c.y === 18)).toBe(true);
        expect(cellules.some((c) => c.x === 5 && c.y === 18)).toBe(false);
    });

    it('plateauTemps reste synchronisé avec les cellules vides', () => {
        etat.plateau[10][4] = '#fff';
        vivant.plateauTemps[10][4] = Date.now();
        vivant_supprimerCellule(4, 10);
        for (let l = 0; l < CONFIG.lignes; l++) {
            for (let c = 0; c < CONFIG.colonnes; c++) {
                if (etat.plateau[l][c] === 0) {
                    expect(vivant.plateauTemps[l][c]).toBe(0);
                }
            }
        }
    });
});
