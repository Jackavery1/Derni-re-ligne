import { etat, ECRANS } from './store-jeu.js';
import { afficherOngletOptions } from './options-ui.js';
import { afficherEcranDiffere as afficherEcran } from './navigation-lazy.js';
import { jouerMelodie } from './melodie.js';
import { AudioMoteur } from './audio.js';
import { basculerOracle } from './oracle-jeu.js';
import { basculerModeSprint, mettreAJourToggleSprint } from './mode-sprint.js';
import { basculerDefiJour, mettreAJourToggleDefiJour } from './mode-defi-jour.js';
import { afficherTutorielContextuel } from './tutoriel.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { initialiserBoutonsCampagne } from './ui-boutons-campagne.js';
import { assurerInputArchi, assurerInputCoop } from './modes-input-lazy.js';
import { lierBouton, lierBoutonsSelecteur } from './ui-lier-bouton.js';
import { vibrerUi } from './haptique.js';

function navVers(handler) {
    return () => {
        vibrerUi();
        handler();
    };
}

export function initialiserBoutonsNavigation() {
    initialiserBoutonsCampagne();
    _lierBoutonsMenuPrincipal();
    _lierBoutonsRetour();
    _lierSelectionEtModes();
    mettreAJourVisibiliteModesDebloques();
    mettreAJourToggleDefiJour();
}

function _lierBoutonsMenuPrincipal() {
    lierBouton(
        'btn-jouer',
        navVers(() => afficherEcran(ECRANS.SELECTION))
    );
    lierBouton('btn-architecte', () => {
        vibrerUi();
        void (async () => {
            afficherTutorielContextuel('architecte');
            await assurerInputArchi();
            const { archi_afficherSelection } = await import('./archi-jeu.js');
            await archi_afficherSelection();
        })();
    });
    lierBouton(
        'btn-achievements',
        navVers(() => afficherEcran(ECRANS.ACHIEVEMENTS))
    );
    lierBouton(
        'btn-codex',
        navVers(() => afficherEcran(ECRANS.CODEX))
    );
    lierBouton(
        'btn-profil',
        navVers(() => afficherEcran(ECRANS.PROFIL))
    );
}

function _lierBoutonsRetour() {
    lierBouton(
        'btn-codex-retour',
        navVers(() => afficherEcran(ECRANS.TITRE))
    );
    lierBouton(
        'btn-achievements-codex',
        navVers(() => afficherEcran(ECRANS.CODEX))
    );
    lierBouton(
        'btn-profil-codex',
        navVers(() => afficherEcran(ECRANS.CODEX))
    );
    lierBouton(
        'btn-achievements-retour',
        navVers(() => afficherEcran(ECRANS.TITRE))
    );
    lierBouton(
        'btn-profil-gameover',
        navVers(() => afficherEcran(ECRANS.PROFIL))
    );
    lierBouton(
        'btn-profil-menu',
        navVers(() => afficherEcran(ECRANS.TITRE))
    );
    lierBouton(
        'btn-profil-achievements',
        navVers(() => afficherEcran(ECRANS.ACHIEVEMENTS))
    );
    lierBouton(
        'btn-selection-retour',
        navVers(() => afficherEcran(ECRANS.TITRE))
    );
    lierBouton(
        'btn-options-retour',
        navVers(() => afficherEcran(ECRANS.TITRE))
    );
    lierBouton(
        'btn-menu',
        navVers(() => afficherEcran(ECRANS.TITRE))
    );
}

function _lierSelectionEtModes() {
    lierBouton('toggle-oracle', () => {
        vibrerUi();
        basculerOracle();
    });
    lierBouton('toggle-coop', () => {
        vibrerUi();
        void (async () => {
            await assurerInputCoop();
            const { basculerModeCoop } = await import('./coop-jeu.js');
            basculerModeCoop();
            mettreAJourToggleSprint();
            if (document.getElementById('toggle-coop')?.classList.contains('actif')) {
                afficherTutorielContextuel('coop');
                void import('./infobulles-contexte.js').then(({ proposerInfobulleModeJeu }) =>
                    proposerInfobulleModeJeu('coop')
                );
            }
        })();
    });
    lierBouton('toggle-sprint', () => {
        vibrerUi();
        basculerModeSprint();
    });
    lierBouton('toggle-defi-jour', () => {
        vibrerUi();
        basculerDefiJour();
    });
    const ouvrirOptionsControles = navVers(() => {
        afficherOngletOptions('controles');
        afficherEcran(ECRANS.OPTIONS);
    });
    lierBouton('btn-aller-controles', ouvrirOptionsControles);
    lierBouton(
        'btn-options',
        navVers(() => {
            afficherOngletOptions('reglages');
            afficherEcran(ECRANS.OPTIONS);
        })
    );
    lierBouton(
        'tab-reglages',
        navVers(() => afficherOngletOptions('reglages'))
    );
    lierBouton(
        'tab-controles',
        navVers(() => afficherOngletOptions('controles'))
    );
    lierBouton('btn-mute', () => {
        vibrerUi();
        AudioMoteur.basculerMute();
    });
    lierBouton('btn-reecouter', () => {
        vibrerUi();
        jouerMelodie();
    });

    lierBoutonsSelecteur('.bouton-mode', (btn) => {
        vibrerUi();
        etat.modeJeu = btn.dataset.mode;
        document.querySelectorAll('.bouton-mode').forEach((b) => b.classList.remove('actif'));
        btn.classList.add('actif');
    });
}
