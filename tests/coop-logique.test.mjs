import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from '../js/config/config.js';
import { etat } from '../js/etat/store-jeu.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import {
    coop,
    DEMI_LARGEUR,
    coop_nouvellePiece,
    coop_estPositionValide,
    coop_verifierLignes,
    coop_calculerScore,
    coop_vitesseChute,
    reinitialiserEtatCoop,
    coop_deplacerDroite,
    coop_deplacerBas,
    coop_tourner,
    coop_mettreAJourGravite,
    coop_verrouillerPiece,
    configurerCoopLogique,
} from '../js/logique/coop-logique.js';
import { initialiserChronometreCoop } from '../js/logique/coop-jeu.js';

describe('coop-logique', () => {
    beforeEach(() => {
        coop.actif = true;
        reinitialiserEtatCoop();
    });

    it('coop_nouvellePiece place J1 dans la moitié gauche', () => {
        const piece = coop_nouvellePiece('j1');
        expect(piece.joueur).toBe('j1');
        expect(piece.x).toBeGreaterThanOrEqual(0);
        expect(piece.x + 3).toBeLessThanOrEqual(DEMI_LARGEUR);
    });

    it('coop_nouvellePiece place J2 dans la moitié droite', () => {
        const piece = coop_nouvellePiece('j2');
        expect(piece.joueur).toBe('j2');
        expect(piece.x).toBeGreaterThanOrEqual(DEMI_LARGEUR);
        expect(piece.x).toBeLessThan(CONFIG.colonnes);
    });

    it('coop_estPositionValide empêche le débordement dans la zone adverse', () => {
        const pieceJ1 = { type: 'I', rotation: 0, x: 3, y: 10, joueur: 'j1' };
        expect(coop_estPositionValide(pieceJ1, 2, 0)).toBe(false);

        const pieceJ2 = { type: 'I', rotation: 0, x: 6, y: 10, joueur: 'j2' };
        expect(coop_estPositionValide(pieceJ2, -3, 0)).toBe(false);
    });

    it('coop_calculerScore applique combo et back-to-back', () => {
        coop.niveau = 1;
        coop.score = 0;
        coop.lignes = 0;
        coop.combo = 0;
        coop.dernierEtaitTetris = false;
        coop_calculerScore(4);
        const scoreTetris = coop.score;
        coop_calculerScore(4);
        expect(coop.score).toBeGreaterThan(scoreTetris * 1.4);
    });

    it("coop_verifierLignes n'efface que si les deux moitiés sont complètes", () => {
        const l = CONFIG.lignes - 1;
        for (let c = 0; c < DEMI_LARGEUR; c++) etat.plateau[l][c] = '#00f5ff';
        for (let c = DEMI_LARGEUR; c < CONFIG.colonnes; c++) etat.plateau[l][c] = '#ff006e';

        const lignesAvant = coop.lignes;
        const nb = coop_verifierLignes();
        coop_calculerScore(nb);
        expect(coop.lignes).toBe(lignesAvant + 1);
        expect(etat.plateau[0].every((c) => c === 0)).toBe(true);
    });

    it('coop_verifierLignes ignore une moitié seule complète', () => {
        const l = CONFIG.lignes - 1;
        for (let c = 0; c < DEMI_LARGEUR; c++) etat.plateau[l][c] = '#00f5ff';
        const lignesAvant = coop.lignes;
        coop_verifierLignes();
        expect(coop.lignes).toBe(lignesAvant);
        expect(coop.lignesEnAttenteJ1).toBe(l);
    });

    it('coop_estPositionValide fonctionne sur plateau vide', () => {
        etat.plateau = creerPlateau();
        const piece = coop_nouvellePiece('j1');
        expect(coop_estPositionValide(piece)).toBe(true);
    });

    it('coop_calculerScore incrémente le score coop', () => {
        const scoreAvant = coop.score;
        coop_calculerScore(2);
        expect(coop.score).toBeGreaterThan(scoreAvant);
    });

    it('coop_vitesseChute diminue avec le niveau coop', () => {
        coop.niveau = 1;
        const v1 = coop_vitesseChute();
        coop.niveau = 5;
        const v5 = coop_vitesseChute();
        expect(v5).toBeLessThan(v1);
    });

    it('coop_deplacerDroite déplace la pièce active du joueur', () => {
        coop.j1.pieceActuelle = coop_nouvellePiece('j1');
        const xAvant = coop.j1.pieceActuelle.x;
        coop_deplacerDroite('j1');
        expect(coop.j1.pieceActuelle.x).toBe(xAvant + 1);
    });

    it('coop_tourner change la rotation quand la position reste valide', () => {
        coop.j1.pieceActuelle = { type: 'T', rotation: 0, x: 1, y: 0, joueur: 'j1' };
        const rotAvant = coop.j1.pieceActuelle.rotation;
        coop_tourner('j1', 1);
        expect(coop.j1.pieceActuelle.rotation).not.toBe(rotAvant);
    });

    it('coop_mettreAJourGravite respecte le lock delay guideline', () => {
        etat.plateau = creerPlateau();
        const piecePosee = { type: 'O', rotation: 0, x: 1, y: CONFIG.lignes - 2, joueur: 'j1' };
        coop.j1.pieceActuelle = { ...piecePosee };
        coop_mettreAJourGravite('j1', 16);
        expect(coop.j1.pieceAuSol).toBe(true);
        expect(coop.j1.lockDelayRestant).toBe(CONFIG.lockDelay);
        coop_mettreAJourGravite('j1', CONFIG.lockDelay);
        expect(coop.j1.pieceActuelle).not.toEqual(piecePosee);
        expect(coop.j1.pieceAuSol).toBe(false);
    });

    it('coop_calculerScore(0) remet le combo à zéro', () => {
        coop.combo = 4;
        coop_calculerScore(0);
        expect(coop.combo).toBe(0);
    });

    it('coop_verrouillerPiece remet le combo sans ligne effacée', () => {
        coop.combo = 3;
        coop.j1.pieceActuelle = {
            type: 'O',
            rotation: 0,
            x: 1,
            y: CONFIG.lignes - 2,
            joueur: 'j1',
        };
        coop_verrouillerPiece('j1');
        expect(coop.combo).toBe(0);
    });

    it('coop_deplacerBas crédite 1 point par descente', () => {
        coop.j1.pieceActuelle = coop_nouvellePiece('j1');
        const scoreAvant = coop.score;
        coop_deplacerBas('j1');
        expect(coop.score).toBe(scoreAvant + 1);
    });

    it('coop_calculerScore applique le bonus T-Spin', () => {
        const scoreAvant = coop.score;
        const result = coop_calculerScore(1, 'full');
        expect(result.tSpin).toBe('full');
        expect(coop.score).toBeGreaterThan(scoreAvant);
    });

    it('coop_tourner marque la pièce pour un T-Spin potentiel', () => {
        etat.plateau = creerPlateau();
        coop.j1.pieceActuelle = { type: 'T', rotation: 0, x: 1, y: 0, joueur: 'j1' };
        coop_tourner('j1', 1);
        expect(coop.j1.poseApresRotation).toBe(true);
        coop_deplacerDroite('j1');
        expect(coop.j1.poseApresRotation).toBe(false);
    });

    it('initialiserChronometreCoop initialise tempsDebut', () => {
        etat.tempsDebut = null;
        initialiserChronometreCoop();
        expect(etat.tempsDebut).toBeGreaterThan(0);
        expect(etat.tempsPauseAccumule).toBe(0);
        expect(etat.tempsPauseDebut).toBeNull();
    });

    it('grace spawn au démarrage coop', () => {
        expect(coop.j1.spawnGraceRestant).toBe(CONFIG.spawnGraceMs);
        expect(coop.j2.spawnGraceRestant).toBe(CONFIG.spawnGraceMs);
    });

    it('ARE bloque la gravité coop', () => {
        coop.j1.areRestant = CONFIG.areMs;
        coop.j1.pieceActuelle = { type: 'I', rotation: 0, x: 0, y: 0, joueur: 'j1' };
        const yAvant = coop.j1.pieceActuelle.y;
        coop_mettreAJourGravite('j1', 100);
        expect(coop.j1.pieceActuelle.y).toBe(yAvant);
    });

    it('bufferise rotation pendant ARE puis consomme', () => {
        etat.plateau = creerPlateau();
        coop.j1.areRestant = 10;
        coop.j1.pieceActuelle = { type: 'T', rotation: 0, x: 1, y: 0, joueur: 'j1' };
        coop_tourner('j1', 1);
        expect(coop.j1.inputBuffer).toEqual(['tourner_cw']);
        coop.j1.areRestant = 0;
        coop_mettreAJourGravite('j1', 16);
        expect(coop.j1.pieceActuelle.rotation).not.toBe(0);
    });

    it('grace spawn retarde le top-out après verrouillage', () => {
        const terminer = vi.fn();
        configurerCoopLogique({ terminerCooperatif: terminer });
        etat.plateau = creerPlateau();
        for (let c = 0; c < CONFIG.colonnes; c++) etat.plateau[0][c] = 1;
        coop.j1.pieceActuelle = { type: 'O', rotation: 0, x: 1, y: 0, joueur: 'j1' };
        coop.j1.prochainePiece = { type: 'O', rotation: 0, x: 1, y: 0, joueur: 'j1' };
        coop.j1.spawnGraceRestant = CONFIG.spawnGraceMs;
        coop_verrouillerPiece('j1');
        expect(terminer).not.toHaveBeenCalled();
        coop.j1.spawnGraceRestant = 0;
        coop_mettreAJourGravite('j1', 16);
        expect(terminer).toHaveBeenCalledWith('j1');
    });
});
