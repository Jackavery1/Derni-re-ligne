import { describe, it, expect, beforeEach } from 'vitest';
import { reinitialiserBusJeu } from '../js/bus-jeu.js';
import { store } from '../js/store-core.js';
import {
    demarrerSuiviMonde,
    arreterSuiviMonde,
    enregistrerProgression,
    enregistrerPosePiece,
    enregistrerTopOut,
    vitesseHistoireMs,
    fusionnerEtoilesPersistees,
    calculerEtoiles,
    libelleEtoile,
    libelleObjectifPrincipal,
    notifierPhaseBoss,
    notifierPhaseBossParPv,
    victoireObjectifDeclenchee,
    estMondeZenActif,
    obtenirEtoilesPersistees,
    obtenirSuiviDifficulte,
    suiviDifficulteActif,
} from '../js/gestionnaire-difficulte.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { PALIERS_VITESSE_MS, DIFFICULTE_MONDES } from '../js/difficulte-mondes-chargement.js';

describe('gestionnaire-difficulte', () => {
    beforeEach(() => {
        reinitialiserBusJeu();
        store.histoire.actif = true;
        arreterSuiviMonde();
    });

    it('demarre le prologue au palier 1', () => {
        demarrerSuiviMonde('monde_prologue');
        expect(vitesseHistoireMs()).toBe(PALIERS_VITESSE_MS[1]);
    });

    it('montee de vague a 55% puis pose piece suivante', () => {
        demarrerSuiviMonde('monde_prologue');
        enregistrerProgression({ nbLignes: 6, estTetris: false, combo: 1 });
        expect(store.histoire.difficulte?.palierCourant).toBe(1);
        expect(store.histoire.difficulte?.palierEnAttente).toBe(2);
        enregistrerPosePiece();
        expect(store.histoire.difficulte?.palierCourant).toBe(2);
    });

    it('declenche victoire objectif a 10 lignes prologue', () => {
        demarrerSuiviMonde('monde_prologue');
        enregistrerProgression({ nbLignes: 10, estTetris: false, combo: 1 });
        expect(store.histoire.difficulte?.victoireDeclenchee).toBe(true);
    });

    it('fusionne les etoiles persistees par OU logique', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        fusionnerEtoilesPersistees(etat, 'monde_lave', [true, false, false]);
        fusionnerEtoilesPersistees(etat, 'monde_lave', [true, true, false]);
        expect(etat.etoilesParMonde.monde_lave).toEqual([true, true, false]);
    });

    it('calculerEtoiles sans topout', () => {
        demarrerSuiviMonde('monde_prologue');
        const etoiles = calculerEtoiles('monde_prologue');
        expect(etoiles[0]).toBe(true);
        expect(etoiles[1]).toBe(true);
    });

    it('libelleEtoile decrit attente_sans_effacer avec le seuil de remplissage', () => {
        expect(libelleEtoile({ type: 'attente_sans_effacer', valeur: 30 })).toContain('≥50 %');
        expect(libelleEtoile({ type: 'attente_sans_effacer', valeur: 30 })).toContain('30 s');
    });

    it('libelleEtoile couvre les types principaux', () => {
        expect(libelleEtoile({ type: 'sans_topout' })).toContain('top-out');
        expect(libelleEtoile({ type: 'tetris_triple', valeur: 3 })).toContain('3');
        expect(libelleEtoile(null)).toBe('');
    });

    it('etoile 3 cyber basee sur les triples de la partie en cours', () => {
        demarrerSuiviMonde('monde_cyber');
        const etatHist = structuredClone(ETAT_HISTOIRE_VIDE);
        etatHist.conditionsMiroir.tetrisTriplesCyber = 3;
        expect(calculerEtoiles('monde_cyber', etatHist)[2]).toBe(false);
        enregistrerProgression({ nbLignes: 3, estTetris: false, combo: 1 });
        enregistrerProgression({ nbLignes: 3, estTetris: false, combo: 1 });
        expect(calculerEtoiles('monde_cyber', etatHist)[2]).toBe(false);
        enregistrerProgression({ nbLignes: 3, estTetris: false, combo: 1 });
        expect(calculerEtoiles('monde_cyber', etatHist)[2]).toBe(true);
    });

    it('notifie les phases boss par paliers de PV', () => {
        demarrerSuiviMonde('monde_boss_1');
        notifierPhaseBossParPv('brasier', 60);
        expect(store.histoire.difficulte?.palierEnAttente).toBeNull();
        notifierPhaseBossParPv('brasier', 40);
        expect(store.histoire.difficulte?.palierEnAttente).not.toBeNull();
    });

    it('enregistre top-out et etoile sans topout', () => {
        demarrerSuiviMonde('monde_lave');
        enregistrerTopOut();
        expect(calculerEtoiles('monde_lave')[1]).toBe(false);
    });

    it('libelleObjectifPrincipal distingue boss et lignes', () => {
        const cfgBoss = DIFFICULTE_MONDES.monde_boss_1;
        expect(libelleObjectifPrincipal(cfgBoss, { pvMax: 120 })).toContain('120');
        expect(libelleObjectifPrincipal(DIFFICULTE_MONDES.monde_prologue)).toContain('lignes');
    });

    it('expose le suivi actif et la victoire objectif', () => {
        demarrerSuiviMonde('monde_prologue');
        expect(suiviDifficulteActif()).toBe(true);
        expect(victoireObjectifDeclenchee()).toBe(false);
        enregistrerProgression({ nbLignes: 10, estTetris: false, combo: 1 });
        expect(victoireObjectifDeclenchee()).toBe(true);
        expect(obtenirSuiviDifficulte()?.mondeId).toBe('monde_prologue');
    });

    it('obtenirEtoilesPersistees retourne des etoiles par defaut', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        expect(obtenirEtoilesPersistees(etat, 'monde_lave')).toEqual([false, false, false]);
    });

    it('estMondeZenActif pour les mondes zen', () => {
        expect(estMondeZenActif()).toBe(false);
        demarrerSuiviMonde('monde_paradoxe');
        expect(estMondeZenActif()).toBe(true);
    });

    it('notifierPhaseBoss ignore les phases deja appliquees', () => {
        demarrerSuiviMonde('monde_boss_1');
        notifierPhaseBoss('brasier', 1);
        const palierApres = store.histoire.difficulte?.palierEnAttente;
        notifierPhaseBoss('brasier', 1);
        expect(store.histoire.difficulte?.palierEnAttente).toBe(palierApres);
    });
});
