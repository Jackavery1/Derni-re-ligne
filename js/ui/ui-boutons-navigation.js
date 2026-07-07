import { etat, ECRANS } from '../etat/store-jeu.js';
import { afficherEcranDiffere as afficherEcran } from './navigation-lazy.js';
import { jouerMelodie } from '../audio/melodie.js';
import { AudioMoteur } from '../audio/audio.js';
import { basculerOracle } from '../logique/oracle-jeu.js';
import { basculerModeSprint, mettreAJourToggleSprint } from '../logique/mode-sprint.js';
import { basculerDefiJour, mettreAJourToggleDefiJour } from '../logique/mode-defi-jour.js';
import { afficherTutorielContextuel } from './tutoriel.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { initialiserBoutonsCampagne } from './ui-boutons-campagne.js';
import { assurerInputArchi, assurerInputCoop } from '../modes-input-lazy.js';
import { lierBouton, lierBoutonsSelecteur } from './ui-lier-bouton.js';
import { vibrerUi } from '../audio/haptique.js';

function navVers(handler) {
    return () => {
        vibrerUi();
        handler();
    };
}

async function ouvrirOptions(onglet) {
    const { afficherOngletOptions } = await import('./options-ui.js');
    afficherOngletOptions(onglet);
    afficherEcran(ECRANS.OPTIONS);
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
            const { archi_afficherSelection } = await import('../logique/archi-jeu.js');
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
            const { basculerModeCoop } = await import('../logique/coop-jeu.js');
            basculerModeCoop();
            mettreAJourToggleSprint();
            if (document.getElementById('toggle-coop')?.classList.contains('actif')) {
                afficherTutorielContextuel('coop');
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
        void ouvrirOptions('controles');
    });
    lierBouton('btn-aller-controles', ouvrirOptionsControles);
    lierBouton(
        'btn-options',
        navVers(() => {
            void ouvrirOptions('reglages');
        })
    );
    lierBouton(
        'tab-reglages',
        navVers(() => {
            void ouvrirOptions('reglages');
        })
    );
    lierBouton(
        'tab-controles',
        navVers(() => {
            void ouvrirOptions('controles');
        })
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
