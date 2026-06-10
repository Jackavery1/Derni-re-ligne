import { modeHistoireEnCours } from './mode-histoire.js';
import { modeArchiActif } from './registre-modes.js';
import { afficherEcran } from './ecrans-ui.js';
import { obtenirActions } from './actions-jeu.js';
import { ECRANS } from './store-jeu.js';
import {
    basculerPauseCoop,
    demarrerCooperatif,
    quitterModeCoop,
    utiliserPasserelle,
} from './coop-jeu.js';
import {
    archi_afficherSelection,
    archi_basculerPause,
    archi_reinitialiserNiveau,
    quitterModeArchi,
} from './archi-jeu.js';
import { retournerAuMondeActuel } from './histoire-manager.js';
import { coop_dessinerPreview } from './coop-rendu.js';

export function initialiserBoutonsPartie() {
    document.getElementById('btn-rejouer')?.addEventListener('click', () => {
        if (modeHistoireEnCours()) {
            retournerAuMondeActuel();
        } else {
            obtenirActions().demarrerJeu?.();
        }
    });
    document.getElementById('btn-pause-coop')?.addEventListener('click', basculerPauseCoop);
    document.getElementById('btn-coop-reprendre')?.addEventListener('click', basculerPauseCoop);
    document
        .getElementById('btn-coop-rejouer')
        ?.addEventListener('click', () => demarrerCooperatif());
    document.getElementById('btn-coop-quitter')?.addEventListener('click', quitterModeCoop);
    document
        .getElementById('btn-coop-go-rejouer')
        ?.addEventListener('click', () => demarrerCooperatif());
    document.getElementById('btn-coop-go-menu')?.addEventListener('click', quitterModeCoop);
    document.getElementById('btn-pause-archi')?.addEventListener('click', archi_basculerPause);
    document
        .getElementById('btn-reinit-archi')
        ?.addEventListener('click', archi_reinitialiserNiveau);
    document
        .getElementById('archi-sel-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('archi-res-niveaux')
        ?.addEventListener('click', archi_afficherSelection);
    document.getElementById('archi-res-menu')?.addEventListener('click', quitterModeArchi);
    document.getElementById('btn-passerelle-j1')?.addEventListener('click', () => {
        utiliserPasserelle('j1');
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');
    });
    document.getElementById('btn-passerelle-j2')?.addEventListener('click', () => {
        utiliserPasserelle('j2');
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');
    });
    document.getElementById('btn-pause')?.addEventListener('click', () => {
        if (modeArchiActif()) archi_basculerPause();
        else obtenirActions().basculerPause?.();
    });
    document.getElementById('btn-reprendre')?.addEventListener('click', () => {
        if (modeArchiActif()) archi_basculerPause();
        else obtenirActions().basculerPause?.();
    });
    document.getElementById('btn-recommencer')?.addEventListener('click', () => {
        if (modeArchiActif()) archi_reinitialiserNiveau();
        else obtenirActions().confirmerRecommencer?.();
    });
    document.getElementById('btn-pause-quitter')?.addEventListener('click', () => {
        if (modeArchiActif()) quitterModeArchi();
        else obtenirActions().quitterVersMenu?.();
    });
}
