import { describe, it, expect, beforeEach } from 'vitest';
import {
    aProgressionCampagne,
    campagnePeutEtreContinuee,
    nouvellePartieNecessiteConfirmation,
    obtenirResumeCampagne,
} from '../js/histoire/menu-titre-campagne.js';
import { reinitialiserCampagneComplete } from '../js/histoire/reinitialiser-campagne.js';
import {
    ecrireStockage,
    ecrireStockageJson,
    lireStockage,
    lireStockageJson,
    estCleProgression,
    estClePreference,
} from '../js/io/progression.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { introHistoireDejaVue } from '../js/histoire/histoire-intro.js';

describe('menu-titre-campagne', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('sans sauvegarde : pas de continuation ni confirmation', () => {
        expect(campagnePeutEtreContinuee()).toBe(false);
        expect(nouvellePartieNecessiteConfirmation()).toBe(false);
    });

    it('intro vue seule : continuation et confirmation', () => {
        ecrireStockage('derniereLigne_introHistoireVue', '1');
        expect(campagnePeutEtreContinuee()).toBe(true);
        expect(nouvellePartieNecessiteConfirmation()).toBe(true);
        expect(obtenirResumeCampagne()).toMatch(/prologue|carte/i);
    });

    it('progression mondes : continuation active', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = ['monde_prologue'];
        ecrireStockageJson('derniereLigne_histoire', etat);
        expect(aProgressionCampagne(etat)).toBe(true);
        expect(campagnePeutEtreContinuee()).toBe(true);
    });

    it('reinitialiserCampagneComplete efface la progression et conserve les prefs', () => {
        ecrireStockage('derniereLigne_volume', '0.5');
        ecrireStockage('derniereLigne_introHistoireVue', '1');
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = ['monde_prologue'];
        ecrireStockageJson('derniereLigne_histoire', etat);
        reinitialiserCampagneComplete();

        expect(lireStockage('derniereLigne_volume', '')).toBe('0.5');
        expect(introHistoireDejaVue()).toBe(false);
        expect(campagnePeutEtreContinuee()).toBe(false);
        expect(lireStockageJson('derniereLigne_histoire', null)?.mondesCompletes ?? []).toEqual([]);
    });

    it('estCleProgression distingue prefs et progression', () => {
        expect(estClePreference('derniereLigne_volume')).toBe(true);
        expect(estCleProgression('derniereLigne_volume')).toBe(false);
        expect(estCleProgression('derniereLigne_histoire')).toBe(true);
        expect(estCleProgression('derniereLigne_record_classique')).toBe(true);
    });
});
