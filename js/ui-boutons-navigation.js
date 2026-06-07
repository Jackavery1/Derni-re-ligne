import { etat, ECRANS } from './store-jeu.js';
import { afficherEcran } from './ecrans-ui.js';
import { afficherOngletOptions } from './options-ui.js';
import { jouerMelodie } from './melodie.js';
import { AudioMoteur } from './audio.js';
import { lancerBiomeSelectionne } from './constellation.js';
import { basculerOracle } from './oracle-jeu.js';
import { basculerModeCoop } from './coop-jeu.js';
import { archi_afficherSelection } from './archi-jeu.js';
import { afficherTutorielContextuel } from './tutoriel.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';

export function initialiserBoutonsNavigation() {
    document
        .getElementById('btn-jouer')
        ?.addEventListener('click', () => afficherEcran(ECRANS.SELECTION));
    document.getElementById('btn-architecte')?.addEventListener('click', () => {
        afficherTutorielContextuel('architecte');
        archi_afficherSelection();
    });
    document.getElementById('btn-mode-histoire')?.addEventListener('click', () => {
        void import('./histoire-intro.js').then(
            ({ introHistoireDejaVue, marquerIntroHistoireVue, obtenirSequenceIntro }) => {
                if (!introHistoireDejaVue()) {
                    marquerIntroHistoireVue();
                    void import('./histoire-manager.js').then(({ afficherCutsceneHistoire }) => {
                        const seq = obtenirSequenceIntro();
                        afficherCutsceneHistoire(seq.lignes, seq.personnages, () => {
                            afficherEcran(ECRANS.HISTOIRE_MAP);
                        });
                    });
                } else {
                    afficherEcran(ECRANS.HISTOIRE_MAP);
                }
            }
        );
    });
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
        .getElementById('btn-selection-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document.getElementById('sel-btn-jouer')?.addEventListener('click', lancerBiomeSelectionne);
    document.getElementById('toggle-oracle')?.addEventListener('click', basculerOracle);
    document.getElementById('toggle-coop')?.addEventListener('click', () => {
        basculerModeCoop();
        if (document.getElementById('toggle-coop')?.classList.contains('actif')) {
            afficherTutorielContextuel('coop');
        }
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

    mettreAJourVisibiliteModesDebloques();
}
