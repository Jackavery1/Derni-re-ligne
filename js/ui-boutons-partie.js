import { modeHistoireEnCours } from './mode-histoire.js';
import { modeArchiActif } from './registre-modes.js';
import { afficherEcran } from './ecrans-ui.js';
import { obtenirActions } from './actions-jeu.js';
import { ECRANS } from './store-jeu.js';
import { retournerAuMondeActuel } from './histoire-manager.js';
import { quitterVersCarteHistoire } from './partie.js';
import { assurerInputArchi, assurerInputCoop } from './modes-input-lazy.js';

async function avecCoop() {
    await assurerInputCoop();
    return import('./coop-jeu.js');
}

async function avecCoopRendu() {
    await assurerInputCoop();
    return import('./coop-rendu.js');
}

async function avecArchi() {
    await assurerInputArchi();
    return import('./archi-jeu.js');
}

export function initialiserBoutonsPartie() {
    document.getElementById('btn-rejouer')?.addEventListener('click', () => {
        if (modeHistoireEnCours()) {
            retournerAuMondeActuel();
        } else {
            obtenirActions().demarrerJeu?.();
        }
    });
    document.getElementById('btn-pause-coop')?.addEventListener('click', () => {
        void avecCoop().then((m) => m.basculerPauseCoop());
    });
    document.getElementById('btn-coop-reprendre')?.addEventListener('click', () => {
        void avecCoop().then((m) => m.basculerPauseCoop());
    });
    document
        .getElementById('btn-coop-rejouer')
        ?.addEventListener('click', () => void avecCoop().then((m) => m.demarrerCooperatif()));
    document.getElementById('btn-coop-quitter')?.addEventListener('click', () => {
        void avecCoop().then((m) => m.quitterModeCoop());
    });
    document
        .getElementById('btn-coop-go-rejouer')
        ?.addEventListener('click', () => void avecCoop().then((m) => m.demarrerCooperatif()));
    document.getElementById('btn-coop-go-menu')?.addEventListener('click', () => {
        void avecCoop().then((m) => m.quitterModeCoop());
    });
    document.getElementById('btn-pause-archi')?.addEventListener('click', () => {
        void avecArchi().then((m) => m.archi_basculerPause());
    });
    document
        .getElementById('btn-reinit-archi')
        ?.addEventListener(
            'click',
            () => void avecArchi().then((m) => m.archi_reinitialiserNiveau())
        );
    document
        .getElementById('archi-sel-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('archi-res-niveaux')
        ?.addEventListener(
            'click',
            () => void avecArchi().then((m) => m.archi_afficherSelection())
        );
    document.getElementById('archi-res-menu')?.addEventListener('click', () => {
        void avecArchi().then((m) => m.quitterModeArchi());
    });
    document.getElementById('btn-passerelle-j1')?.addEventListener('click', () => {
        void Promise.all([avecCoop(), avecCoopRendu()]).then(([coop, rendu]) => {
            coop.utiliserPasserelle('j1');
            rendu.coop_dessinerPreview('j1');
            rendu.coop_dessinerPreview('j2');
        });
    });
    document.getElementById('btn-passerelle-j2')?.addEventListener('click', () => {
        void Promise.all([avecCoop(), avecCoopRendu()]).then(([coop, rendu]) => {
            coop.utiliserPasserelle('j2');
            rendu.coop_dessinerPreview('j1');
            rendu.coop_dessinerPreview('j2');
        });
    });
    document.getElementById('btn-pause')?.addEventListener('click', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_basculerPause());
        else obtenirActions().basculerPause?.();
    });
    document.getElementById('btn-reprendre')?.addEventListener('click', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_basculerPause());
        else obtenirActions().basculerPause?.();
    });
    document.getElementById('btn-recommencer')?.addEventListener('click', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.archi_reinitialiserNiveau());
        else obtenirActions().confirmerRecommencer?.();
    });
    document.getElementById('btn-pause-carte')?.addEventListener('click', () => {
        quitterVersCarteHistoire();
    });
    document.getElementById('btn-pause-quitter')?.addEventListener('click', () => {
        if (modeArchiActif()) void avecArchi().then((m) => m.quitterModeArchi());
        else obtenirActions().quitterVersMenu?.();
    });
}
