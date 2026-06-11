import { etat, ECRANS } from './store-jeu.js';
import { afficherEcran } from './ecrans-ui.js';
import { afficherOngletOptions } from './options-ui.js';
import { jouerMelodie } from './melodie.js';
import { AudioMoteur } from './audio.js';
import { lancerBiomeSelectionne } from './constellation.js';
import { basculerOracle } from './oracle-jeu.js';
import { basculerModeCoop } from './coop-jeu.js';
import { basculerModeSprint, mettreAJourToggleSprint } from './mode-sprint.js';
import { basculerDefiJour, mettreAJourToggleDefiJour } from './mode-defi-jour.js';
import { archi_afficherSelection } from './archi-jeu.js';
import { afficherTutorielContextuel } from './tutoriel.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';

export function initialiserBoutonsNavigation() {
    _lierBoutonsMenuPrincipal();
    _lierBoutonsRetour();
    _lierSelectionEtModes();
    mettreAJourVisibiliteModesDebloques();
    mettreAJourToggleDefiJour();
}

function _lierBoutonsMenuPrincipal() {
    document
        .getElementById('btn-jouer')
        ?.addEventListener('click', () => afficherEcran(ECRANS.SELECTION));
    document.getElementById('btn-architecte')?.addEventListener('click', () => {
        afficherTutorielContextuel('architecte');
        archi_afficherSelection();
    });
    document.getElementById('btn-mode-histoire')?.addEventListener('click', () => {
        void import('./histoire-intro.js').then(({ ouvrirModeHistoireDepuisMenu }) =>
            ouvrirModeHistoireDepuisMenu()
        );
    });
    document
        .getElementById('btn-achievements')
        ?.addEventListener('click', () => afficherEcran(ECRANS.ACHIEVEMENTS));
    document
        .getElementById('btn-codex')
        ?.addEventListener('click', () => afficherEcran(ECRANS.CODEX));
    document
        .getElementById('btn-profil')
        ?.addEventListener('click', () => afficherEcran(ECRANS.PROFIL));
}

function _lierBoutonsRetour() {
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
        .getElementById('btn-profil-gameover')
        ?.addEventListener('click', () => afficherEcran(ECRANS.PROFIL));
    document
        .getElementById('btn-profil-menu')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-profil-achievements')
        ?.addEventListener('click', () => afficherEcran(ECRANS.ACHIEVEMENTS));
    document
        .getElementById('btn-selection-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-options-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document
        .getElementById('btn-menu')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
}

function _lierSelectionEtModes() {
    document.getElementById('sel-btn-histoire')?.addEventListener('click', () => {
        void import('./histoire-intro.js').then(({ ouvrirModeHistoireDepuisMenu }) =>
            ouvrirModeHistoireDepuisMenu()
        );
    });
    document.getElementById('sel-btn-jouer')?.addEventListener('click', lancerBiomeSelectionne);
    document.getElementById('toggle-oracle')?.addEventListener('click', basculerOracle);
    document.getElementById('toggle-coop')?.addEventListener('click', () => {
        basculerModeCoop();
        mettreAJourToggleSprint();
        if (document.getElementById('toggle-coop')?.classList.contains('actif')) {
            afficherTutorielContextuel('coop');
        }
    });
    document.getElementById('toggle-sprint')?.addEventListener('click', basculerModeSprint);
    document.getElementById('toggle-defi-jour')?.addEventListener('click', basculerDefiJour);
    const ouvrirOptionsControles = () => {
        afficherOngletOptions('controles');
        afficherEcran(ECRANS.OPTIONS);
    };
    document
        .getElementById('btn-controles-rapides')
        ?.addEventListener('click', ouvrirOptionsControles);
    document
        .getElementById('btn-aller-controles')
        ?.addEventListener('click', ouvrirOptionsControles);
    document.getElementById('btn-options')?.addEventListener('click', () => {
        afficherOngletOptions('reglages');
        afficherEcran(ECRANS.OPTIONS);
    });
    document
        .getElementById('tab-reglages')
        ?.addEventListener('click', () => afficherOngletOptions('reglages'));
    document
        .getElementById('tab-controles')
        ?.addEventListener('click', () => afficherOngletOptions('controles'));
    document
        .getElementById('btn-mute')
        ?.addEventListener('click', () => AudioMoteur.basculerMute());
    document.getElementById('btn-reecouter')?.addEventListener('click', () => jouerMelodie());

    document.querySelectorAll('.bouton-mode').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!(btn instanceof HTMLElement)) return;
            etat.modeJeu = btn.dataset.mode;
            document.querySelectorAll('.bouton-mode').forEach((b) => b.classList.remove('actif'));
            btn.classList.add('actif');
        });
    });
}
