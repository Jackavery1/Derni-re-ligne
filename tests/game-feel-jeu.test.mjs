import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from '../js/config/config.js';
import { store, etat } from '../js/etat/store-jeu.js';
import {
    reinitialiserGameFeel,
    demarrerAre,
    demarrerGraceSpawn,
    demarrerCoyote,
    areActive,
    coyoteActif,
    graceSpawnActive,
    bufferiserInput,
    consommerBufferInput,
    pieceControlesActifs,
    activerPieceAuSol,
    quitterSolPiece,
    verifierCollisionSpawn,
    mettreAJourGameFeel,
} from '../js/logique/game-feel-jeu.js';
import {
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
    obtenirLockDelayRestant,
    obtenirNbLockResets,
} from '../js/etat/store-etat-partie.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import { configurerActionsJeu, obtenirActions } from '../js/logique/actions-jeu.js';
import { modeHistoireEnCours } from '../js/etat/mode-histoire.js';
import { estMondeZenActif } from '../js/logique/gestionnaire-difficulte.js';

vi.mock('../js/etat/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => false),
}));

vi.mock('../js/logique/gestionnaire-difficulte.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        estMondeZenActif: vi.fn(() => false),
    };
});

describe('game-feel-jeu', () => {
    beforeEach(() => {
        reinitialiserGameFeel();
        etat.estEnCours = true;
        etat.estEnPause = false;
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau = creerPlateau();
        configurerActionsJeu({
            tourner: vi.fn(),
            utiliserReserve: vi.fn(),
            deplacerGauche: vi.fn(),
            deplacerDroite: vi.fn(),
            deplacerBas: vi.fn(),
            chuteRapide: vi.fn(),
            terminerPartie: vi.fn(),
        });
    });

    it('ARE bloque les controles sans masquer la piece', () => {
        demarrerAre();
        expect(areActive()).toBe(true);
        expect(pieceControlesActifs()).toBe(false);
        expect(etat.pieceActuelle).not.toBeNull();
    });

    it('bufferise puis consomme une rotation apres ARE', () => {
        demarrerAre();
        bufferiserInput('tourner_cw');
        expect(store.inputBuffer).toEqual(['tourner_cw']);
        store.areRestant = 0;
        consommerBufferInput();
        expect(obtenirActions().tourner).toHaveBeenCalledWith(1);
        expect(store.inputBuffer).toEqual([]);
    });

    it('conserve deux inputs rapides sans écrasement', () => {
        bufferiserInput('gauche');
        bufferiserInput('tourner_cw');
        expect(store.inputBuffer).toEqual(['gauche', 'tourner_cw']);
        consommerBufferInput();
        expect(obtenirActions().deplacerGauche).toHaveBeenCalled();
        expect(store.inputBuffer).toEqual(['tourner_cw']);
    });

    it('bufferise puis consomme un deplacement lateral apres pause', () => {
        etat.estEnPause = true;
        bufferiserInput('gauche');
        expect(store.inputBuffer).toEqual(['gauche']);
        etat.estEnPause = false;
        consommerBufferInput();
        expect(obtenirActions().deplacerGauche).toHaveBeenCalled();
        expect(store.inputBuffer).toEqual([]);
    });

    it('grace spawn retarde le game over sur collision', () => {
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau[0][4] = 1;
        etat.plateau[0][5] = 1;
        demarrerGraceSpawn();
        verifierCollisionSpawn();
        expect(obtenirActions().terminerPartie).not.toHaveBeenCalled();
        store.spawnGraceRestant = 0;
        verifierCollisionSpawn();
        expect(obtenirActions().terminerPartie).toHaveBeenCalled();
    });

    it('grace spawn sprint plus longue que marathon', () => {
        etat.modeJeu = 'sprint';
        demarrerGraceSpawn();
        const sprint = store.spawnGraceRestant;
        etat.modeJeu = 'marathon';
        demarrerGraceSpawn();
        expect(sprint).toBeGreaterThan(store.spawnGraceRestant);
        expect(sprint).toBe(CONFIG.sprintSpawnGraceMs);
    });

    it('coyote preserve le lock delay au retour au sol', () => {
        definirPieceAuSol(true);
        definirLockDelayRestant(250);
        definirNbLockResets(2);
        demarrerCoyote();
        quitterSolPiece();
        expect(coyoteActif()).toBe(true);
        expect(obtenirLockDelayRestant()).toBe(250);
        activerPieceAuSol();
        expect(obtenirLockDelayRestant()).toBe(250);
        expect(obtenirNbLockResets()).toBe(2);
    });

    it('sans coyote, retour au sol reinitialise le lock delay', () => {
        definirPieceAuSol(false);
        store.coyoteRestant = 0;
        activerPieceAuSol();
        expect(obtenirLockDelayRestant()).toBe(CONFIG.lockDelay);
        expect(obtenirNbLockResets()).toBe(0);
    });

    it('graceSpawnActive reflete le timer de grace', () => {
        expect(graceSpawnActive()).toBe(false);
        demarrerGraceSpawn();
        expect(graceSpawnActive()).toBe(true);
    });

    it('mettreAJourGameFeel decremente ARE puis consomme le buffer', () => {
        demarrerAre();
        bufferiserInput('gauche');
        mettreAJourGameFeel(100);
        expect(store.areRestant).toBe(CONFIG.areMs - 100);
        expect(obtenirActions().deplacerGauche).not.toHaveBeenCalled();
        mettreAJourGameFeel(100);
        expect(store.areRestant).toBe(0);
        expect(obtenirActions().deplacerGauche).toHaveBeenCalled();
    });

    it('mettreAJourGameFeel decremente coyote hors sol uniquement', () => {
        definirPieceAuSol(false);
        demarrerCoyote();
        mettreAJourGameFeel(40);
        expect(store.coyoteRestant).toBe(CONFIG.coyoteTimeMs - 40);
        definirPieceAuSol(true);
        mettreAJourGameFeel(40);
        expect(store.coyoteRestant).toBe(CONFIG.coyoteTimeMs - 40);
    });

    it('ignore le buffer quand la partie est terminee', () => {
        etat.estEnCours = false;
        bufferiserInput('gauche');
        consommerBufferInput();
        expect(obtenirActions().deplacerGauche).not.toHaveBeenCalled();
    });

    it('consomme toutes les actions du buffer', () => {
        const actions = [
            ['tourner_ccw', 'tourner', -1],
            ['hold', 'utiliserReserve'],
            ['droite', 'deplacerDroite'],
            ['bas', 'deplacerBas'],
            ['chute', 'chuteRapide'],
        ];
        for (const [input, methode, arg] of actions) {
            reinitialiserGameFeel();
            etat.estEnCours = true;
            bufferiserInput(input);
            consommerBufferInput();
            const spy = obtenirActions()[methode];
            if (arg !== undefined) {
                expect(spy).toHaveBeenCalledWith(arg);
            } else {
                expect(spy).toHaveBeenCalled();
            }
        }
    });

    it('mettreAJourGameFeel decremente grace spawn', () => {
        demarrerGraceSpawn();
        const avant = store.spawnGraceRestant;
        mettreAJourGameFeel(100);
        expect(store.spawnGraceRestant).toBe(avant - 100);
    });

    it('quitterSolPiece sans coyote reinitialise lock delay a zero', () => {
        definirPieceAuSol(false);
        definirLockDelayRestant(200);
        store.coyoteRestant = 0;
        quitterSolPiece();
        expect(obtenirLockDelayRestant()).toBe(0);
    });

    it('topout zen delegue au callback sans terminer la partie', () => {
        vi.mocked(modeHistoireEnCours).mockReturnValue(true);
        vi.mocked(estMondeZenActif).mockReturnValue(true);
        etat.pieceActuelle = { type: 'O', rotation: 0, x: 4, y: 0 };
        etat.plateau[0][4] = 1;
        etat.plateau[0][5] = 1;
        const recuperation = vi.fn();
        verifierCollisionSpawn(recuperation);
        expect(recuperation).toHaveBeenCalled();
        expect(obtenirActions().terminerPartie).not.toHaveBeenCalled();
    });
});
