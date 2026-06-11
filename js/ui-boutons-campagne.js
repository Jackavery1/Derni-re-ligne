import { afficherEcran } from './ecrans-ui.js';
import { afficherOngletOptions } from './options-ui.js';
import { ECRANS } from './store-jeu.js';
import {
    nouvellePartieNecessiteConfirmation,
    demanderConfirmationNouvellePartie,
    mettreAJourMenuCampagneTitre,
} from './menu-titre-campagne.js';
async function continuerCampagne() {
    const { ouvrirModeHistoireDepuisMenu } = await import('./histoire-intro.js');
    return ouvrirModeHistoireDepuisMenu();
}

async function demarrerNouvelleCampagne() {
    if (nouvellePartieNecessiteConfirmation()) {
        const confirme = await demanderConfirmationNouvellePartie();
        if (!confirme) return;
        const { reinitialiserCampagneComplete } = await import('./reinitialiser-campagne.js');
        reinitialiserCampagneComplete();
    }
    const { ouvrirModeHistoireDepuisMenu } = await import('./histoire-intro.js');
    return ouvrirModeHistoireDepuisMenu();
}

export function initialiserBoutonsCampagne() {
    document.getElementById('btn-continuer')?.addEventListener('click', () => {
        void continuerCampagne();
    });
    document.getElementById('btn-nouvelle-partie')?.addEventListener('click', () => {
        void demarrerNouvelleCampagne();
    });
    document.getElementById('btn-options-titre')?.addEventListener('click', () => {
        afficherOngletOptions('reglages');
        afficherEcran(ECRANS.OPTIONS);
    });
    mettreAJourMenuCampagneTitre();
}
