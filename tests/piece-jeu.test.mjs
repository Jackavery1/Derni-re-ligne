import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG, TETROMINOS } from '../js/config.js';
import {
    definirPieceAuSol,
    definirNbLockResets,
    definirLockDelayRestant,
    obtenirNbLockResets,
    obtenirLockDelayRestant,
    etat,
    obtenirSacPieces,
    touchesActives,
    dasEtat,
    definirBiomeActif,
    definirCompteurPieces,
    definirSeuilProchRelique,
} from '../js/store-jeu.js';
import {
    creerPlateau,
    reinitialiserLockDelay,
    estPositionValide,
    calculerDistanceChute,
    remplirSac,
    genererProchainePiece,
    obtenirForme,
    hexVersRgb,
    reinitialiserDas,
    obtenirCouleurPieceParType,
    obtenirCouleurPiece,
    creerPieceRelique,
    mettreAJourDas,
    lierCouleursTetrominos,
    mettreAJourIndicateurRelique,
} from '../js/piece-jeu.js';
import { TOUCHES_DEFAUT } from '../js/config.js';
import { configurerActionsJeu } from '../js/actions-jeu.js';

describe('piece-jeu', () => {
    beforeEach(() => {
        configurerActionsJeu({
            deplacerGauche: () => {},
            deplacerDroite: () => {},
            deplacerBas: () => {},
        });
        definirPieceAuSol(false);
        definirNbLockResets(0);
        definirLockDelayRestant(0);
        etat.plateau = creerPlateau();
        etat.pieceActuelle = null;
        obtenirSacPieces().length = 0;
    });

    it('creerPlateau a les bonnes dimensions', () => {
        const plateau = creerPlateau();
        expect(plateau).toHaveLength(CONFIG.lignes);
        expect(plateau[0]).toHaveLength(CONFIG.colonnes);
    });

    it('lock delay réinitialisé quand la pièce est au sol', () => {
        definirPieceAuSol(true);
        reinitialiserLockDelay();
        expect(obtenirLockDelayRestant()).toBe(CONFIG.lockDelay);
        expect(obtenirNbLockResets()).toBe(1);
    });

    it('lock delay ignoré si max resets atteint', () => {
        definirPieceAuSol(true);
        definirNbLockResets(CONFIG.maxLockResets);
        reinitialiserLockDelay();
        expect(obtenirNbLockResets()).toBe(CONFIG.maxLockResets);
        expect(obtenirLockDelayRestant()).toBe(0);
    });

    it('lock delay ignoré si la pièce n’est pas au sol', () => {
        definirPieceAuSol(false);
        reinitialiserLockDelay();
        expect(obtenirLockDelayRestant()).toBe(0);
        expect(obtenirNbLockResets()).toBe(0);
    });

    it('calculerDistanceChute sur plateau vide', () => {
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        expect(calculerDistanceChute(etat.pieceActuelle)).toBeGreaterThan(10);
    });

    it('estPositionValide refuse une collision', () => {
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau[1][4] = '#fff';
        expect(estPositionValide(etat.pieceActuelle, 0, 1)).toBe(false);
    });

    it('genererProchainePiece remplit le sac si vide', () => {
        const piece = genererProchainePiece();
        expect(piece.type).toBeTruthy();
        expect(obtenirSacPieces().length).toBeGreaterThanOrEqual(0);
    });

    it('remplirSac produit 7 pièces', () => {
        remplirSac();
        expect(obtenirSacPieces()).toHaveLength(7);
    });

    it('hexVersRgb convertit une couleur hex', () => {
        expect(hexVersRgb('#ff0000')).toEqual([255, 0, 0]);
        expect(hexVersRgb('#00ff88')).toEqual([0, 255, 136]);
    });

    it('obtenirForme utilise reliqueForme si présente', () => {
        const forme = [
            [1, 1],
            [1, 1],
        ];
        const piece = { type: 'O', rotation: 0, reliqueForme: forme };
        expect(obtenirForme(piece)).toBe(forme);
    });

    it('reinitialiserDas remet à zéro le DAS', () => {
        dasEtat[TOUCHES_DEFAUT.gauche] = { moment: 100, repete: true };
        reinitialiserDas(TOUCHES_DEFAUT.gauche);
        expect(dasEtat[TOUCHES_DEFAUT.gauche]).toEqual({ moment: 0, repete: false });
    });

    it('obtenirCouleurPieceParType retourne une couleur hex du biome actif', () => {
        definirBiomeActif('classique');
        const couleur = obtenirCouleurPieceParType('I');
        expect(couleur).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('obtenirCouleurPiece utilise la couleur relique', () => {
        const piece = { type: 'O', reliqueData: { couleur: '#aabbcc' } };
        expect(obtenirCouleurPiece(piece)).toBe('#aabbcc');
    });

    it('creerPieceRelique positionne au centre', () => {
        const relique = {
            forme: [
                [1, 1],
                [1, 1],
            ],
            couleur: '#ff0000',
            nom: 'Test',
            icone: '★',
        };
        const piece = creerPieceRelique(relique);
        expect(piece.reliqueForme).toEqual(relique.forme);
        expect(piece.reliqueData).toBe(relique);
        expect(piece.x).toBeGreaterThanOrEqual(0);
    });

    it('lierCouleursTetrominos expose couleur sur TETROMINOS', () => {
        definirBiomeActif('classique');
        lierCouleursTetrominos();
        expect(TETROMINOS.I.couleur).toMatch(/^#/);
    });

    it('mettreAJourDas déclenche action après délai DAS', () => {
        let appels = 0;
        configurerActionsJeu({ deplacerGauche: () => appels++ });
        dasEtat[TOUCHES_DEFAUT.gauche] = { moment: 0, repete: false };
        touchesActives[TOUCHES_DEFAUT.gauche] = true;
        mettreAJourDas(CONFIG.dasDelai + 1);
        expect(appels).toBe(1);
        touchesActives[TOUCHES_DEFAUT.gauche] = false;
    });

    it('mettreAJourIndicateurRelique affiche le compte a rebours', () => {
        const indic = {
            style: { display: 'none', color: '' },
            classList: { add: vi.fn(), remove: vi.fn() },
        };
        const nomEl = { textContent: '' };
        const iconeEl = { textContent: '' };
        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'indicateur-relique') return indic;
            if (id === 'relique-nom') return nomEl;
            if (id === 'relique-icone') return iconeEl;
            return null;
        });
        definirBiomeActif('classique');
        definirCompteurPieces(10);
        definirSeuilProchRelique(15);
        etat.filePieces = [null, null, null];
        mettreAJourIndicateurRelique();
        expect(indic.style.display).toBe('block');
        expect(nomEl.textContent).toContain('5');
    });
});
