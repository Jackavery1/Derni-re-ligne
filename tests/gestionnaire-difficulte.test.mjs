import { describe, it, expect, beforeEach } from 'vitest';
import { reinitialiserBusJeu, emettre } from '../js/etat/bus-jeu.js';
import { store } from '../js/etat/store-jeu.js';
import { activerModeHistoire, desactiverModeHistoire } from '../js/etat/mode-histoire.js';
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
} from '../js/logique/gestionnaire-difficulte.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import { PALIERS_VITESSE_MS, DIFFICULTE_MONDES } from '../js/io/difficulte-mondes-chargement.js';

describe('gestionnaire-difficulte', () => {
    beforeEach(() => {
        reinitialiserBusJeu();
        desactiverModeHistoire();
        activerModeHistoire();
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

    it('notifie la phase boss 2 sous 25% PV restants', () => {
        demarrerSuiviMonde('monde_boss_1');
        notifierPhaseBossParPv('brasier', 20);
        expect(store.histoire.difficulte?.phasesBossAppliquees).toContain(2);
        expect(store.histoire.difficulte?.palierEnAttente).not.toBeNull();
    });

    it('monde boss ignore la victoire par lignes effacees', () => {
        demarrerSuiviMonde('monde_boss_1');
        enregistrerProgression({ nbLignes: 50, estTetris: true, combo: 4 });
        expect(store.histoire.difficulte?.lignesEffacees).toBe(50);
        expect(store.histoire.difficulte?.victoireDeclenchee).toBe(false);
    });

    it('retarde la montee de palier en surtension jusqu a musique:section', () => {
        demarrerSuiviMonde('monde_prologue');
        store.surtensionActive = true;
        enregistrerProgression({ nbLignes: 6, estTetris: false, combo: 1 });
        expect(store.histoire.difficulte?.palierEnAttente).toBeNull();
        emettre('musique:section');
        expect(store.histoire.difficulte?.palierEnAttente).toBe(2);
    });

    it('arreterSuiviMonde detache l ecouteur surtension', () => {
        demarrerSuiviMonde('monde_prologue');
        store.surtensionActive = true;
        enregistrerProgression({ nbLignes: 6, estTetris: false, combo: 1 });
        expect(store.histoire.difficulte?.ecouteurSurtension).toBeTruthy();
        arreterSuiviMonde();
        emettre('musique:section');
        expect(store.histoire.difficulte).toBeNull();
    });

    it('vitesseHistoireMs applique multGraviteMusique', () => {
        demarrerSuiviMonde('monde_prologue');
        store.multGraviteMusique = 2;
        const vitesseBase = PALIERS_VITESSE_MS[1];
        expect(vitesseHistoireMs()).toBe(Math.max(120, vitesseBase / 2));
    });

    it('demarre un monde inconnu avec objectif depuis SEUILS_COMPLETION', () => {
        demarrerSuiviMonde('monde_inexistant_audit');
        expect(store.histoire.difficulte?.lignesObjectif).toBeGreaterThan(0);
        expect(store.histoire.difficulte?.palierCourant).toBe(5);
    });

    it('evaluerDefi couvre les types d etoiles principaux', () => {
        demarrerSuiviMonde('monde_lave');
        const etatHist = structuredClone(ETAT_HISTOIRE_VIDE);
        etatHist.continuesParBoss.monde_lave = 1;
        etatHist.conditionsTrame.actionDistorsionFaite = true;
        etatHist.conditionsParadoxe.topsVolontairesPrologue = 3;

        enregistrerProgression({ nbLignes: 4, estTetris: true, combo: 3 });
        enregistrerPosePiece();
        enregistrerPosePiece();

        const cfg = DIFFICULTE_MONDES.monde_lave;
        expect(calculerEtoiles('monde_lave', etatHist)[1]).toBe(true);

        demarrerSuiviMonde('monde_lave');
        enregistrerTopOut();
        expect(calculerEtoiles('monde_lave', etatHist)[1]).toBe(false);

        expect(libelleEtoile(cfg?.etoile2)).toBeTruthy();
        expect(libelleEtoile({ type: 'sans_continue' })).toContain('échec');
        expect(libelleEtoile({ type: 'tetris', valeur: 2 })).toContain('2');
        expect(libelleEtoile({ type: 'combo', valeur: 4 })).toContain('4');
        expect(libelleEtoile({ type: 'pieces_max', valeur: 40 })).toContain('40');
        expect(libelleEtoile({ type: 'tops_volontaires', valeur: 3 })).toContain('3');
    });

    it('monde_lave — profil vitesse sans deceleration a 65%', () => {
        const profil = DIFFICULTE_MONDES.monde_lave.profilVitesse;
        const a35 = profil.find((v) => v.a === 0.35);
        const a65 = profil.find((v) => v.a === 0.65);
        expect(a35).toBeTruthy();
        expect(a65).toBeTruthy();
        expect(a65.palier).toBeGreaterThan(a35.palier);
        expect(PALIERS_VITESSE_MS[a65.palier]).toBeLessThan(PALIERS_VITESSE_MS[a35.palier]);
    });
});
