import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config.js';
import { etat } from '../js/store-jeu.js';
import { creerPlateau } from '../js/piece-jeu.js';
import { REGISTRE_CALCUL_VIVANT, configurerStrategiesVivant } from '../js/vivant-strategies.js';

describe('vivant-strategies', () => {
    const plateauTemps = Array.from({ length: CONFIG.lignes }, () =>
        Array(CONFIG.colonnes).fill(0)
    );

    beforeEach(() => {
        etat.plateau = creerPlateau();
        plateauTemps.forEach((ligne) => ligne.fill(0));
        configurerStrategiesVivant({
            vivant: { plateauTemps, directionCourant: 1 },
            comportements: { ocean: { directionActuelle: 1 } },
        });
    });

    it('calculerLave cible les blocs les plus anciens', () => {
        const now = Date.now();
        etat.plateau[18][3] = '#ff4500';
        etat.plateau[10][5] = '#ff4500';
        plateauTemps[18][3] = now - 5000;
        plateauTemps[10][5] = now - 500;

        const orig = globalThis.Date.now;
        globalThis.Date.now = () => now;
        const cellules = REGISTRE_CALCUL_VIVANT.lave({ seuilAge: 1000, nbBlocs: 1 });
        globalThis.Date.now = orig;

        expect(cellules).toHaveLength(1);
        expect(cellules[0]).toEqual({ x: 3, y: 18 });
    });

    it('calculerOcean retourne toutes les cellules occupées', () => {
        etat.plateau[5][2] = '#00f5ff';
        etat.plateau[8][7] = '#00f5ff';
        const cellules = REGISTRE_CALCUL_VIVANT.ocean({});
        expect(cellules.length).toBe(2);
    });

    it('calculerGlace cible les trous dans les lignes partielles', () => {
        const l = CONFIG.lignes - 3;
        for (let c = 0; c < CONFIG.colonnes - 2; c++) etat.plateau[l][c] = '#aaeeff';
        const cellules = REGISTRE_CALCUL_VIVANT.glace({ nbGivre: 2 });
        expect(cellules.length).toBeGreaterThan(0);
        expect(cellules.every(({ y }) => y === l)).toBe(true);
    });

    it('calculerDesert cible les cellules sous des colonnes occupées', () => {
        etat.plateau[5][4] = '#ffaa00';
        const cellules = REGISTRE_CALCUL_VIVANT.desert({ nbGrains: 3 });
        expect(cellules.length).toBeGreaterThan(0);
        expect(cellules.every(({ x }) => x === 4)).toBe(true);
        expect(cellules.every(({ y }) => y > 5)).toBe(true);
    });

    it('calculerCosmos retourne les blocs flottants', () => {
        etat.plateau[12][3] = '#b400ff';
        etat.plateau[11][3] = 0;
        const cellules = REGISTRE_CALCUL_VIVANT.cosmos();
        expect(cellules).toContainEqual({ x: 3, y: 12 });
    });
});
