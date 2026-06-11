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
    basculerOracle,
    afficherFeedbackOracle,
} from '../js/oracle-jeu.js';
import { etat } from '../js/store-jeu.js';
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

    it('calculerMeilleurPlacement tient compte des wall kicks SRS', () => {
        const plateau = creerPlateau();
        for (let lig = CONFIG.lignes - 4; lig < CONFIG.lignes; lig++) {
            for (let col = 0; col < CONFIG.colonnes; col++) {
                if (col !== 9) plateau[lig][col] = '#888888';
            }
        }
        const piece = { type: 'T', rotation: 0, x: 8, y: 0 };
        const resultat = calculerMeilleurPlacement(piece, plateau);
        expect(resultat.rotation).toBeGreaterThanOrEqual(0);
        expect(resultat.x).toBeLessThan(CONFIG.colonnes);
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

    it('reinitialiserOraclePartie remet les compteurs à zéro', () => {
        oracle.actif = true;
        oracle.multiplicateur = 3.2;
        oracle.scoreBonus = 900;
        oracle.piecesSuivies = 4;
        oracle.piecesIgnorees = 2;
        reinitialiserOraclePartie();
        expect(oracle.multiplicateur).toBe(1);
        expect(oracle.scoreBonus).toBe(0);
        expect(oracle.piecesSuivies).toBe(0);
        expect(oracle.piecesIgnorees).toBe(0);
    });

    it('basculerOracle verrouille le bouton coop quand actif', () => {
        const coopBtn = { disabled: false, classList: { add: () => {}, remove: () => {} } };
        const label = { textContent: '' };
        const desc = { textContent: '' };
        document.getElementById = (id) => {
            if (id === 'toggle-oracle') return { classList: { add: () => {}, remove: () => {} } };
            if (id === 'oracle-toggle-label') return label;
            if (id === 'oracle-toggle-desc') return desc;
            if (id === 'toggle-coop') return coopBtn;
            if (id === 'coop-toggle-label') return { textContent: '' };
            return null;
        };
        oracle.actif = false;
        basculerOracle();
        expect(oracle.actif).toBe(true);
        expect(coopBtn.disabled).toBe(true);
        basculerOracle();
        expect(coopBtn.disabled).toBe(false);
    });

    it('basculerOracle met à jour le libellé du bouton', () => {
        const label = { textContent: '' };
        const desc = { textContent: '' };
        document.getElementById = (id) => {
            if (id === 'toggle-oracle') return { classList: { add: () => {}, remove: () => {} } };
            if (id === 'oracle-toggle-label') return label;
            if (id === 'oracle-toggle-desc') return desc;
            return null;
        };
        oracle.actif = false;
        basculerOracle();
        expect(oracle.actif).toBe(true);
        expect(label.textContent).toBe('ORACLE : ON');
        basculerOracle();
        expect(label.textContent).toBe('ORACLE : OFF');
    });

    it('afficherFeedbackOracle affiche succès ou reset', () => {
        const notif = {
            textContent: '',
            classList: { add: () => {}, remove: () => {} },
            offsetWidth: 0,
        };
        document.getElementById = (id) => (id === 'notif-oracle' ? notif : null);
        afficherFeedbackOracle(true, 2.4);
        expect(notif.textContent).toContain('DÉVIATION');
        afficherFeedbackOracle(false, 1.1);
        expect(notif.textContent).toContain('RESET');
    });
});
