import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/audio.js', () => ({
    AudioMoteur: { son: vi.fn() },
}));

vi.mock('../js/meteo.js', () => ({
    meteo: { decalageForce: 0, controleInverse: false, etat: 'inactif', evenementActuel: null },
    ETATS_METEO: { ACTIF: 'actif' },
}));

vi.mock('../js/reliques.js', () => ({
    appliquerEffetRelique: vi.fn(),
}));

vi.mock('../js/melodie.js', () => ({
    enregistrerNotesLignesCompletes: vi.fn(),
}));

vi.mock('../js/achievements.js', () => ({
    majStatsLignesEffacees: vi.fn(),
    majStatsScorePartie: vi.fn(),
}));

vi.mock('../js/profil-jeu.js', () => ({
    enregistrerDonneesVerrouillage: vi.fn(),
    signalerApparitionPiece: vi.fn(),
    compterRotation: vi.fn(),
    compterMouvementLateral: vi.fn(),
    compterHardDrop: vi.fn(),
    compterHold: vi.fn(),
    enregistrerLignesParNiveau: vi.fn(),
}));

vi.mock('../js/oracle-jeu.js', () => ({
    sauvegarderPlacementOracle: vi.fn(),
    declencherCalculOracle: vi.fn(),
}));

import {
    jouable,
    appliquerScoreLignes,
    vitesseChute,
    tourner,
    utiliserReserve,
    deplacerGauche,
    deplacerBas,
    verrouillerPiece,
} from '../js/logique-partie.js';
import { reinitialiserBusJeu, ecouter } from '../js/bus-jeu.js';
import { initialiserVivant } from '../js/vivant.js';
import { etat, definirRefsCanvas } from '../js/store-jeu.js';
import { CONFIG } from '../js/config.js';
import { supprimerLignesDuPlateau } from '../js/logique-pure.js';
import { creerPlateau, remplirSac } from '../js/piece-jeu.js';
import { reinitialiserGameFeel } from '../js/game-feel-jeu.js';

function creerCtxMock() {
    const gradient = { addColorStop: vi.fn() };
    return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        beginPath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        setTransform: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        createRadialGradient: vi.fn(() => gradient),
        measureText: vi.fn(() => ({ width: 10 })),
        fillStyle: '',
        strokeStyle: '',
        globalAlpha: 1,
        shadowBlur: 0,
        shadowColor: '',
        font: '',
        textAlign: 'left',
    };
}

function creerCanvasMock(largeur = 120, hauteur = 120) {
    return {
        width: largeur,
        height: hauteur,
        classList: { toggle: vi.fn() },
        getContext: () => creerCtxMock(),
    };
}

describe('logique-partie', () => {
    beforeEach(() => {
        reinitialiserBusJeu();
        reinitialiserGameFeel();
        initialiserVivant();
        etat.estEnCours = false;
        etat.estEnPause = false;
        etat.pieceActuelle = null;
        etat.pieceEnReserve = null;
        etat.reserveUtilisee = false;
        etat.filePieces = [];
        etat.score = 0;
        etat.lignes = 0;
        etat.niveau = 1;
        etat.combo = 0;
        etat.dernierEtaitTetris = false;
        etat.plateau = creerPlateau();
        remplirSac();
        definirRefsCanvas({
            canvasPlateau: creerCanvasMock(300, 600),
            ctx: creerCtxMock(),
            canvasPreview: creerCanvasMock(120, 360),
            ctxPreview: creerCtxMock(),
            canvasReserve: creerCanvasMock(80, 80),
            ctxReserve: creerCtxMock(),
        });
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

    it('tourner incrémente la rotation quand la position est valide', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'T', rotation: 0, x: 3, y: 0 };
        tourner(1);
        expect(etat.pieceActuelle.rotation).toBe(1);
    });

    it('utiliserReserve stocke la pièce courante et en sort une nouvelle', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.filePieces = [{ type: 'T', rotation: 0, x: 3, y: 0 }];
        utiliserReserve();
        expect(etat.pieceEnReserve.type).toBe('O');
        expect(etat.pieceActuelle.type).toBe('T');
        expect(etat.reserveUtilisee).toBe(true);
    });

    it('utiliserReserve échange avec la réserve existante', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.pieceEnReserve = { type: 'I', rotation: 0 };
        etat.filePieces = [{ type: 'T', rotation: 0, x: 3, y: 0 }];
        utiliserReserve();
        expect(etat.pieceActuelle.type).toBe('I');
        expect(etat.pieceEnReserve.type).toBe('O');
    });

    it('utiliserReserve ignore un second hold dans la même pièce', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.filePieces = [{ type: 'T', rotation: 0, x: 3, y: 0 }];
        utiliserReserve();
        etat.pieceActuelle = { type: 'T', rotation: 0, x: 3, y: 0 };
        utiliserReserve();
        expect(etat.pieceEnReserve.type).toBe('O');
    });

    it('utiliserReserve annule le flag T-Spin de la rotation precedente', () => {
        etat.estEnCours = true;
        etat.plateau = creerPlateau();
        etat.plateau[17][4] = 1;
        etat.plateau[17][6] = 1;
        etat.plateau[19][4] = 1;
        etat.pieceActuelle = { type: 'I', rotation: 0, x: 3, y: 0 };
        etat.filePieces = [{ type: 'T', rotation: 0 }];
        etat.pieceEnReserve = null;
        tourner(1);
        let dernierResult = null;
        const arret = ecouter('score:maj', ({ result }) => {
            dernierResult = result;
        });
        utiliserReserve();
        etat.pieceActuelle = { type: 'T', rotation: 0, x: 4, y: 17 };
        verrouillerPiece();
        arret();
        expect(dernierResult?.tSpin).toBeFalsy();
    });

    it('vitesseChute diminue avec le niveau', () => {
        etat.niveau = 1;
        const v1 = vitesseChute();
        etat.niveau = 5;
        const v5 = vitesseChute();
        expect(v5).toBeLessThan(v1);
        expect(v5).toBeGreaterThanOrEqual(CONFIG.vitesseMin);
    });

    it('appliquerScoreLignes ajoute les points Tetris', () => {
        const partie = { score: 0, lignes: 0, niveau: 2, combo: 0, dernierEtaitTetris: false };
        const result = appliquerScoreLignes(partie, 4);
        expect(result.points).toBe(1600);
        expect(partie.score).toBe(1600);
        expect(partie.lignes).toBe(4);
        expect(result.tetris).toBe(true);
        expect(partie.combo).toBe(1);
    });

    it('appliquerScoreLignes détecte back-to-back Tetris', () => {
        const partie = { score: 1000, lignes: 4, niveau: 1, combo: 1, dernierEtaitTetris: true };
        const result = appliquerScoreLignes(partie, 4);
        expect(result.backToBack).toBe(true);
    });

    it('appliquerScoreLignes remet le combo à zéro sans ligne', () => {
        const partie = { score: 500, lignes: 10, niveau: 2, combo: 3, dernierEtaitTetris: false };
        appliquerScoreLignes(partie, 0);
        expect(partie.combo).toBe(0);
        expect(partie.score).toBe(500);
    });

    it('appliquerScoreLignes applique le bonus combo', () => {
        const partie = { score: 0, lignes: 4, niveau: 2, combo: 1, dernierEtaitTetris: false };
        const result = appliquerScoreLignes(partie, 2);
        expect(result.points).toBe(750);
        expect(partie.score).toBe(750);
    });

    it('appliquerScoreLignes applique le bonus back-to-back Tetris', () => {
        const partie = { score: 0, lignes: 4, niveau: 2, combo: 1, dernierEtaitTetris: true };
        const result = appliquerScoreLignes(partie, 4);
        expect(result.backToBack).toBe(true);
        expect(result.points).toBe(3000);
    });

    it('appliquerScoreLignes monte de niveau à 15 lignes', () => {
        const partie = { score: 0, lignes: 14, niveau: 1, combo: 0, dernierEtaitTetris: false };
        const result = appliquerScoreLignes(partie, 1);
        expect(result.levelUp).toBe(true);
        expect(partie.niveau).toBe(2);
    });

    it('supprimerLignesDuPlateau efface une ligne complète', () => {
        const plateau = creerPlateau();
        plateau[CONFIG.lignes - 1].fill('#00f5ff');
        const {
            plateau: nouveau,
            nbSupprimees,
            lignesEffacees,
        } = supprimerLignesDuPlateau(plateau);
        expect(nbSupprimees).toBe(1);
        expect(lignesEffacees).toEqual([CONFIG.lignes - 1]);
        expect(nouveau[0].every((c) => c === 0)).toBe(true);
        expect(nouveau[CONFIG.lignes - 1].every((c) => c === 0)).toBe(true);
    });

    it('deplacerGauche déplace la pièce quand la position est valide', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        deplacerGauche();
        expect(etat.pieceActuelle.x).toBe(3);
    });

    it('deplacerBas incrémente le score', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.score = 0;
        deplacerBas();
        expect(etat.score).toBe(1);
        expect(etat.pieceActuelle.y).toBe(1);
    });

    it('verrouillerPiece pose la pièce et charge la suivante', () => {
        etat.estEnCours = true;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 18 };
        etat.filePieces = [{ type: 'T', rotation: 0, x: 3, y: 0 }];
        remplirSac();
        verrouillerPiece();
        expect(etat.pieceActuelle.type).toBe('T');
        expect(etat.plateau[18][4]).not.toBe(0);
        expect(etat.plateau[18][5]).not.toBe(0);
    });
});
