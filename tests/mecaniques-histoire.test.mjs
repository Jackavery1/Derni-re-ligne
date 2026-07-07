import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BIOMES } from '../js/config/config.js';
import { store } from '../js/etat/store-jeu.js';
import { etat, definirBiomeActif } from '../js/etat/store-jeu.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { supprimerLignesDuPlateauExcluantRouille } from '../js/logique/logique-pure.js';
import {
    biomeActuelMecanique,
    biomeActuelEstMiroir,
    actionMiroir,
    obtenirVitesseChuteModifiee,
    obtenirLigneEclipse,
    celluleEstRouillee,
    enregistrerTimestampCellules,
    mettreAJourMecaniquesHistoire,
    pieceEstInvisible,
    opacitePieceCourante,
    ghostEstDesactive,
    onGameOverHistoire,
    initialiserMecaniquesHistoire,
    arreterMecaniquesHistoire,
    reinitialiserMatricesRouille,
    obtenirLibelleModificateurBiomeHud,
} from '../js/mecaniques-histoire.js';

describe('mecaniques-histoire', () => {
    beforeEach(() => {
        store.histoire.actif = false;
        store.histoire.mondeActuel = null;
        store.histoire.mecaniques.plateauTimestamps = null;
        store.histoire.mecaniques.plateauRouille = null;
        store.histoire.mecaniques.eclipseLigne = 10;
        store.histoire.mecaniques.videInvisible = false;
        store.histoire.mecaniques.cyberTetrisConsecutifs = 0;
        store.histoire.prologueTopsVolontaires = 0;
        store.histoire.etat = null;
        etat.estEnPause = false;
        etat.pieceActuelle = null;
        etat.plateau = creerPlateau();
        definirBiomeActif('classique');
    });

    afterEach(() => {
        arreterMecaniquesHistoire();
    });

    it('biomeActuelMecanique retourne null hors mode histoire', () => {
        definirBiomeActif('miroir');
        expect(biomeActuelMecanique()).toBeNull();
    });

    it('biomeActuelMecanique retourne la mécanique du biome actif', () => {
        store.histoire.actif = true;
        definirBiomeActif('eclipse');
        expect(biomeActuelMecanique()).toBe('eclipse');
        expect(biomeActuelEstMiroir()).toBe(false);
    });

    it('actionMiroir inverse bas et chute en biome miroir', () => {
        store.histoire.actif = true;
        definirBiomeActif('miroir');
        expect(actionMiroir('bas')).toBe('chute');
        expect(actionMiroir('chute')).toBe('bas');
        expect(actionMiroir('gauche')).toBe('gauche');
    });

    it('obtenirVitesseChuteModifiee accélère au-dessus de la ligne éclipse', () => {
        store.histoire.actif = true;
        definirBiomeActif('eclipse');
        store.histoire.mecaniques.eclipseLigne = 10;
        etat.pieceActuelle = { type: 'I', rotation: 0, x: 4, y: 5 };
        const vitesseBase = 500;
        const modifiee = obtenirVitesseChuteModifiee(vitesseBase);
        expect(modifiee).toBeGreaterThan(vitesseBase);
    });

    it('obtenirVitesseChuteModifiee ralentit sous la ligne éclipse', () => {
        store.histoire.actif = true;
        definirBiomeActif('eclipse');
        store.histoire.mecaniques.eclipseLigne = 10;
        etat.pieceActuelle = { type: 'I', rotation: 0, x: 4, y: 15 };
        const vitesseBase = 500;
        const modifiee = obtenirVitesseChuteModifiee(vitesseBase);
        expect(modifiee).toBeLessThan(vitesseBase);
    });

    it('la rouille n’empêche plus l’effacement d’une ligne complète', () => {
        store.histoire.actif = true;
        definirBiomeActif('rouille');
        initialiserMecaniquesHistoire();
        const l = 19;
        for (let c = 0; c < 10; c++) etat.plateau[l][c] = '#cd6839';
        store.histoire.mecaniques.plateauRouille[19 * 10 + 3] = 1;

        const { nbSupprimees } = supprimerLignesDuPlateauExcluantRouille(
            etat.plateau,
            celluleEstRouillee
        );
        expect(nbSupprimees).toBe(1);
    });

    it('la rouille marque les cellules après le délai', () => {
        store.histoire.actif = true;
        definirBiomeActif('rouille');
        initialiserMecaniquesHistoire();

        const now = 1000;
        vi.spyOn(performance, 'now').mockReturnValue(now);
        enregistrerTimestampCellules([{ x: 3, y: 5 }]);

        const seuilMs = (BIOMES.rouille?.secondesAvantRouille ?? 18) * 1000;
        mettreAJourMecaniquesHistoire(16, now + seuilMs);

        expect(celluleEstRouillee(3, 5)).toBe(true);
        vi.restoreAllMocks();
    });

    it('le biome vide desactive le fantome de guidage', () => {
        store.histoire.actif = true;
        definirBiomeActif('vide');
        expect(ghostEstDesactive()).toBe(true);
        expect(pieceEstInvisible()).toBe(false);
        expect(opacitePieceCourante()).toBe(1);
    });

    it('la pièce vide devient translucide au lieu de disparaître', () => {
        store.histoire.actif = true;
        definirBiomeActif('vide');
        initialiserMecaniquesHistoire();
        store.histoire.mecaniques.videInvisible = true;
        expect(pieceEstInvisible()).toBe(true);
        expect(opacitePieceCourante()).toBe(0.35);
    });

    it('onGameOverHistoire compte les tops volontaires au prologue', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_prologue';
        const etatHist = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.etat = etatHist;

        onGameOverHistoire(0, 'monde_prologue');

        expect(etatHist.conditionsParadoxe.topsVolontairesPrologue).toBe(1);
        expect(store.histoire.prologueTopsVolontaires).toBe(1);
    });

    it('obtenirLigneEclipse expose la ligne courante', () => {
        store.histoire.mecaniques.eclipseLigne = 7;
        expect(obtenirLigneEclipse()).toBe(7);
    });

    it('la rouille effrite les blocs après le double délai', () => {
        store.histoire.actif = true;
        definirBiomeActif('rouille');
        initialiserMecaniquesHistoire();
        etat.plateau[5][3] = '#cd6839';

        const now = 1000;
        vi.spyOn(performance, 'now').mockReturnValue(now);
        enregistrerTimestampCellules([{ x: 3, y: 5 }]);

        const seuilMs = (BIOMES.rouille?.secondesAvantRouille ?? 18) * 1000;
        mettreAJourMecaniquesHistoire(16, now + seuilMs);
        expect(celluleEstRouillee(3, 5)).toBe(true);

        mettreAJourMecaniquesHistoire(16, now + seuilMs * 2);
        expect(etat.plateau[5][3]).toBe(0);
        expect(celluleEstRouillee(3, 5)).toBe(false);
        vi.restoreAllMocks();
    });

    it('obtenirLibelleModificateurBiomeHud affiche éclipse et surtension', () => {
        store.histoire.actif = true;
        definirBiomeActif('eclipse');
        store.histoire.mecaniques.eclipseLigne = 8;
        store.surtensionActive = true;
        expect(obtenirLibelleModificateurBiomeHud()).toBe('SURTENSION · ÉCLIPSE L8');
    });

    it('reinitialiserMatricesRouille vide les timestamps et flags', () => {
        store.histoire.actif = true;
        definirBiomeActif('rouille');
        initialiserMecaniquesHistoire();
        enregistrerTimestampCellules([{ x: 2, y: 4 }]);
        store.histoire.mecaniques.plateauRouille[4 * 10 + 2] = 1;

        reinitialiserMatricesRouille();

        expect(store.histoire.mecaniques.plateauTimestamps[4 * 10 + 2]).toBe(0);
        expect(store.histoire.mecaniques.plateauRouille[4 * 10 + 2]).toBe(0);
        expect(celluleEstRouillee(2, 4)).toBe(false);
    });

    it('obtenirFondTrame retourne le biome et alpha du cycle trame', async () => {
        const { obtenirFondTrame } = await import('../js/mecaniques-histoire-trame.js');
        store.histoire.mecaniques.trameBiomeIndex = 2;
        store.histoire.mecaniques.trameAlphaMorph = 0.75;
        const fond = obtenirFondTrame();
        expect(fond.biomeId).toBe('ocean');
        expect(fond.alpha).toBe(0.75);
    });

    it('tickTrame avance le cycle apres le fade', async () => {
        const { tickTrame, obtenirFondTrame } = await import('../js/mecaniques-histoire-trame.js');
        store.histoire.mecaniques.trameBiomeIndex = 0;
        store.histoire.mecaniques.trameEnTransition = true;
        store.histoire.mecaniques.trameAlphaMorph = 0.01;
        tickTrame(50);
        expect(store.histoire.mecaniques.trameBiomeIndex).toBe(1);
        expect(obtenirFondTrame().biomeId).toBe('lave');
    });
});
