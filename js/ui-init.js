import { lancerBiomeSelectionne } from './constellation.js';
import { AudioMoteur } from './audio.js';
import { etat, ECRANS } from './contexte-jeu.js';
import { afficherEcran } from './ecrans-ui.js';
import { afficherOngletOptions } from './options-ui.js';
import { Registre } from './registre-jeu.js';

export function initialiserBoutons() {
    document
        .getElementById('btn-jouer')
        ?.addEventListener('click', () => afficherEcran(ECRANS.SELECTION));
    document
        .getElementById('btn-rejouer')
        ?.addEventListener('click', () => Registre.demarrerJeu?.());
    document
        .getElementById('btn-selection-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document.getElementById('sel-btn-jouer')?.addEventListener('click', lancerBiomeSelectionne);
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
        ?.addEventListener('click', () => Registre.basculerPause?.());
    document
        .getElementById('btn-reprendre')
        ?.addEventListener('click', () => Registre.basculerPause?.());
    document
        .getElementById('btn-recommencer')
        ?.addEventListener('click', () => Registre.confirmerRecommencer?.());
    document
        .getElementById('btn-pause-quitter')
        ?.addEventListener('click', () => Registre.quitterVersMenu?.());
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
