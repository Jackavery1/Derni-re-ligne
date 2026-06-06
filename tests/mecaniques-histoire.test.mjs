import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BIOMES } from '../js/config.js';
import { store } from '../js/store-core.js';
import { etat, definirBiomeActif } from '../js/store-jeu.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
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
    ghostEstDesactive,
    onGameOverHistoire,
    initialiserMecaniquesHistoire,
    arreterMecaniquesHistoire,
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

    it('le biome vide désactive le fantôme', () => {
        store.histoire.actif = true;
        definirBiomeActif('vide');
        expect(ghostEstDesactive()).toBe(true);
        expect(pieceEstInvisible()).toBe(false);
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
});
