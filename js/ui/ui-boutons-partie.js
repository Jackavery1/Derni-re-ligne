import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { modeArchiActif } from '../etat/registre-modes.js';
import { afficherEcranDiffere as afficherEcran } from './navigation-lazy.js';
import { obtenirActions } from '../actions-jeu.js';
import { ECRANS } from '../etat/store-jeu.js';
import { retournerAuMondeActuel } from '../histoire/histoire-manager.js';
import { quitterVersCarteHistoire } from '../partie.js';
import { assurerInputArchi, assurerInputCoop } from '../modes-input-lazy.js';
import { lierBouton } from './ui-lier-bouton.js';

async function avecCoop() {
    await assurerInputCoop();
    return import('../coop-jeu.js');
}

async function avecCoopRendu() {
    await assurerInputCoop();
    return import('../coop-rendu.js');
}

async function avecArchi() {
    await assurerInputArchi();
    return import('../archi-jeu.js');
}

export function initialiserBoutonsPartie() {
    lierBouton('btn-rejouer', () => {
        if (modeHistoireEnCours()) {
            retournerAuMondeActuel();
        } else {
            obtenirActions().demarrerJeu?.();
        }
    });
    lierBouton('btn-pause-coop', () => {
        void avecCoop().then((m) => m.basculerPauseCoop());
    });
    lierBouton('btn-pause-coop-mobile', () => {
        void avecCoop().then((m) => m.basculerPauseCoop());
    });
    lierBouton('btn-coop-reprendre', () => {
        void avecCoop().then((m) => m.basculerPauseCoop());
    });
    lierBouton('btn-coop-rejouer', () => {
        void avecCoop().then((m) => m.demarrerCooperatif());
    });
    lierBouton('btn-coop-quitter', () => {
        void avecCoop().then((m) => m.quitterModeCoop());
    });
    lierBouton('btn-coop-go-rejouer', () => {
        void avecCoop().then((m) => m.demarrerCooperatif());
    });
    lierBouton('btn-coop-go-menu', () => {
        void avecCoop().then((m) => m.quitterModeCoop());
    });
    lierBouton('btn-pause-archi', () => {
        void avecArchi().then((m) => m.archi_basculerPause());
    });
    lierBouton('btn-reinit-archi', () => {
        void avecArchi().then((m) => m.archi_reinitialiserNiveau());
    });
    lierBouton('archi-sel-retour', () => afficherEcran(ECRANS.TITRE));
    lierBouton('archi-res-niveaux', () => {
        void avecArchi().then((m) => m.archi_afficherSelection());
    });
    lierBouton('archi-res-menu', () => {
        void avecArchi().then((m) => m.quitterModeArchi());
    });
    lierBouton('btn-passerelle-j1', () => {
        void Promise.all([avecCoop(), avecCoopRendu()]).then(([coop, rendu]) => {
            coop.utiliserPasserelle('j1');
            rendu.coop_dessinerPreview('j1');
            rendu.coop_dessinerPreview('j2');
        });
    });
    lierBouton('btn-passerelle-j2', () => {
        void Promise.all([avecCoop(), avecCoopRendu()]).then(([coop, rendu]) => {
            coop.utiliserPasserelle('j2');
            rendu.coop_dessinerPreview('j1');
            rendu.coop_dessinerPreview('j2');
        });
    });
    lierBouton('btn-pause', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_basculerPause());
        else obtenirActions().basculerPause?.();
    });
    lierBouton('btn-pause-mobile', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_basculerPause());
        else obtenirActions().basculerPause?.();
    });
    lierBouton('btn-reprendre', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_basculerPause());
        else obtenirActions().basculerPause?.();
    });
    lierBouton('btn-recommencer', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_reinitialiserNiveau());
        else obtenirActions().confirmerRecommencer?.();
    });
    lierBouton('btn-pause-carte', () => {
        quitterVersCarteHistoire();
    });
    lierBouton('btn-pause-quitter', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.quitterModeArchi());
        else obtenirActions().quitterVersMenu?.();
    });
}
