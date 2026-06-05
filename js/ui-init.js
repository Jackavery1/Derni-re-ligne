import { lancerBiomeSelectionne } from './constellation.js';
import { AudioMoteur } from './audio.js';
import { etat, ECRANS } from './contexte-jeu.js';
import { afficherEcran } from './ecrans-ui.js';
import { afficherOngletOptions } from './options-ui.js';
import { obtenirActions } from './actions-jeu.js';
import { jouerMelodie } from './melodie.js';
import { basculerOracle } from './oracle-jeu.js';
import {
    basculerModeCoop,
    demarrerCooperatif,
    basculerPauseCoop,
    quitterModeCoop,
    utiliserPasserelle,
} from './coop-jeu.js';
import { coop_dessinerPreview } from './coop-rendu.js';

export function initialiserBoutons() {
    document
        .getElementById('btn-jouer')
        ?.addEventListener('click', () => afficherEcran(ECRANS.SELECTION));
    document
        .getElementById('btn-achievements')
        ?.addEventListener('click', () => afficherEcran(ECRANS.ACHIEVEMENTS));
    document
        .getElementById('btn-codex')
        ?.addEventListener('click', () => afficherEcran(ECRANS.CODEX));
    document
        .getElementById('btn-codex-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-achievements-codex')
        ?.addEventListener('click', () => afficherEcran(ECRANS.CODEX));
    document
        .getElementById('btn-profil-codex')
        ?.addEventListener('click', () => afficherEcran(ECRANS.CODEX));
    document
        .getElementById('btn-achievements-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-profil')
        ?.addEventListener('click', () => afficherEcran(ECRANS.PROFIL));
    document
        .getElementById('btn-profil-gameover')
        ?.addEventListener('click', () => afficherEcran(ECRANS.PROFIL));
    document
        .getElementById('btn-profil-menu')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-profil-achievements')
        ?.addEventListener('click', () => afficherEcran(ECRANS.ACHIEVEMENTS));
    document
        .getElementById('btn-rejouer')
        ?.addEventListener('click', () => obtenirActions().demarrerJeu?.());
    document.getElementById('btn-reecouter')?.addEventListener('click', () => jouerMelodie());
    document
        .getElementById('btn-selection-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document.getElementById('sel-btn-jouer')?.addEventListener('click', lancerBiomeSelectionne);
    document.getElementById('toggle-oracle')?.addEventListener('click', basculerOracle);
    document.getElementById('toggle-coop')?.addEventListener('click', basculerModeCoop);
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
    document.getElementById('btn-options')?.addEventListener('click', () => {
        afficherOngletOptions('reglages');
        afficherEcran(ECRANS.OPTIONS);
    });
    document
        .getElementById('btn-options-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('tab-reglages')
        ?.addEventListener('click', () => afficherOngletOptions('reglages'));
    document
        .getElementById('tab-controles')
        ?.addEventListener('click', () => afficherOngletOptions('controles'));
    document
        .getElementById('btn-menu')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-pause')
        ?.addEventListener('click', () => obtenirActions().basculerPause?.());
    document
        .getElementById('btn-reprendre')
        ?.addEventListener('click', () => obtenirActions().basculerPause?.());
    document
        .getElementById('btn-recommencer')
        ?.addEventListener('click', () => obtenirActions().confirmerRecommencer?.());
    document
        .getElementById('btn-pause-quitter')
        ?.addEventListener('click', () => obtenirActions().quitterVersMenu?.());
    document
        .getElementById('btn-mute')
        ?.addEventListener('click', () => AudioMoteur.basculerMute());

    document.querySelectorAll('.bouton-mode').forEach((btn) => {
        btn.addEventListener('click', () => {
            etat.modeJeu = btn.dataset.mode;
            document.querySelectorAll('.bouton-mode').forEach((b) => b.classList.remove('actif'));
            btn.classList.add('actif');
        });
    });
}
