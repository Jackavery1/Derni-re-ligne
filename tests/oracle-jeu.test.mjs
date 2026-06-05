import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config.js';
import {
    oracle,
    evaluerPlateau,
    calculerMeilleurPlacement,
    evaluerDecisionOracle,
    reinitialiserOraclePartie,
    obtenirScoreAffiche,
    obtenirScoreFinalOracle,
} from '../js/oracle-jeu.js';
import { etat } from '../js/contexte-jeu.js';
import { creerPlateau } from '../js/piece-jeu.js';

describe('oracle-jeu', () => {
    beforeEach(() => {
        oracle.actif = false;
        reinitialiserOraclePartie();
        etat.score = 0;
        etat.plateau = creerPlateau();
    });

    it('evaluerPlateau favorise les lignes complètes', () => {
        const vide = creerPlateau();
        const plein = creerPlateau();
        plein[CONFIG.lignes - 1] = Array(CONFIG.colonnes).fill('#ff0000');
        expect(evaluerPlateau(plein)).toBeGreaterThan(evaluerPlateau(vide));
    });

    it("calculerMeilleurPlacement ne lève pas d'exception sur plateau vide", () => {
        const piece = {
            type: 'T',
            rotation: 0,
            x: 3,
            y: 0,
        };
        expect(() => calculerMeilleurPlacement(piece, creerPlateau())).not.toThrow();
        const resultat = calculerMeilleurPlacement(piece, creerPlateau());
        expect(resultat).toHaveProperty('x');
        expect(resultat).toHaveProperty('rotation');
        expect(resultat).toHaveProperty('score');
    });

    it('evaluerDecisionOracle augmente le multiplicateur après déviation réussie', () => {
        oracle.actif = true;
        oracle.suggestionPrecedente = { x: 2, rotation: 0, score: 0 };
        oracle.placementPrecedent = { x: 5, rotation: 1 };
        evaluerDecisionOracle(2);
        expect(oracle.multiplicateur).toBeCloseTo(1.2);
        expect(oracle.piecesIgnorees).toBe(1);
        expect(oracle.scoreBonus).toBeGreaterThan(0);
    });

    it('evaluerDecisionOracle réduit le multiplicateur sans ligne effacée', () => {
        oracle.actif = true;
        oracle.multiplicateur = 1.4;
        oracle.suggestionPrecedente = { x: 2, rotation: 0, score: 0 };
        oracle.placementPrecedent = { x: 5, rotation: 1 };
        evaluerDecisionOracle(0);
        expect(oracle.multiplicateur).toBeCloseTo(1.1);
    });

    it('multiplicateur plafonné à 5.0', () => {
        oracle.actif = true;
        oracle.multiplicateur = 4.9;
        oracle.suggestionPrecedente = { x: 0, rotation: 0, score: 0 };
        oracle.placementPrecedent = { x: 3, rotation: 0 };
        evaluerDecisionOracle(1);
        expect(oracle.multiplicateur).toBe(5.0);
    });

    it('oracle désactivé : score affiché inchangé', () => {
        etat.score = 1200;
        oracle.actif = false;
        oracle.scoreBonus = 500;
        expect(obtenirScoreAffiche()).toBe(1200);
        expect(obtenirScoreFinalOracle()).toBe(1200);
    });

    it('oracle activé : score final inclut le bonus', () => {
        etat.score = 1200;
        oracle.actif = true;
        oracle.scoreBonus = 350;
        expect(obtenirScoreAffiche()).toBe(1550);
        expect(obtenirScoreFinalOracle()).toBe(1550);
    });

    it("suivre l'Oracle ne modifie pas le multiplicateur", () => {
        oracle.actif = true;
        oracle.multiplicateur = 1.6;
        oracle.suggestionPrecedente = { x: 4, rotation: 0, score: 0 };
        oracle.placementPrecedent = { x: 4, rotation: 0 };
        evaluerDecisionOracle(1);
        expect(oracle.multiplicateur).toBe(1.6);
        expect(oracle.piecesSuivies).toBe(1);
        expect(oracle.piecesIgnorees).toBe(0);
    });
});
