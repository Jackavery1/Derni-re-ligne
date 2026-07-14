import { describe, it, expect, beforeEach } from 'vitest';
import { BIOMES } from '../js/config/biomes.js';
import { store } from '../js/etat/store-jeu.js';
import { etat, definirBiomeActif } from '../js/etat/store-jeu.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import { demarrerSuiviMonde } from '../js/logique/gestionnaire-difficulte.js';
import {
    demarrerBoss,
    arreterBoss,
    mettreAJourBoss,
    bossEstActif,
} from '../js/logique/boss-jeu.js';
import { annulerTimersVivant } from '../js/logique/vivant.js';
import { dessinerSignesVie } from '../js/rendu/rendu-vivant.js';
import {
    tickConditionTrame,
    reinitialiserConditionsRuntime,
} from '../js/histoire/conditions-secrets.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

describe('entrée partie distorsion (monde_finale)', () => {
    beforeEach(() => {
        arreterBoss();
        store.histoire.actif = false;
        store.histoire.mondeActuel = null;
        store.histoire.difficulte = null;
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.plateau = creerPlateau();
        etat.estEnCours = false;
        etat.estEnPause = false;
        annulerTimersVivant();
        reinitialiserConditionsRuntime();
    });

    it('demarrerSuiviMonde + demarrerBoss distorsion sans erreur', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_finale';
        definirBiomeActif('cosmos');

        demarrerSuiviMonde('monde_finale');
        demarrerBoss('distorsion');

        expect(bossEstActif()).toBe(true);
        expect(store.histoire.difficulte?.boss).toBe(true);
        expect(store.histoire.boss.pv).toBe(32);
    });

    it('mettreAJourBoss distorsion ne plante pas sans conditionsTrame', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_finale';
        store.histoire.etat = {
            ...structuredClone(ETAT_HISTOIRE_VIDE),
            conditionsTrame: undefined,
        };
        demarrerBoss('distorsion');

        expect(() => mettreAJourBoss(16)).not.toThrow();
    });

    it('tickConditionTrame tolère conditionsTrame absentes', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_finale';
        store.histoire.etat = {
            ...structuredClone(ETAT_HISTOIRE_VIDE),
            conditionsTrame: undefined,
        };
        demarrerBoss('distorsion');

        expect(() => tickConditionTrame(16)).not.toThrow();
    });

    it('dessinerSignesVie cosmos en histoire sans plateau vivant initialisé', () => {
        store.histoire.actif = true;
        definirBiomeActif('cosmos');
        annulerTimersVivant();
        expect(BIOMES.cosmos).toBeTruthy();

        expect(() => dessinerSignesVie()).not.toThrow();
    });

    it('simule une frame de jeu boss après annulerTimersVivant', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_finale';
        definirBiomeActif('cosmos');
        etat.estEnCours = true;
        etat.estEnPause = false;

        demarrerSuiviMonde('monde_finale');
        demarrerBoss('distorsion');
        annulerTimersVivant();

        for (let i = 0; i < 10; i++) {
            mettreAJourBoss(16);
        }
        expect(store.histoire.boss.pv).toBe(32);
    });
});
