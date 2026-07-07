import {
    nouvellePartieNecessiteConfirmation,
    demanderConfirmationNouvellePartie,
    mettreAJourMenuCampagneTitre,
} from '../menu-titre-campagne.js';
import { lierBouton } from './ui-lier-bouton.js';
import { vibrerUi } from '../audio/haptique.js';

async function continuerCampagne() {
    const { ouvrirModeHistoireDepuisMenu } = await import('../histoire/histoire-intro.js');
    return ouvrirModeHistoireDepuisMenu();
}

async function demarrerNouvelleCampagne() {
    if (nouvellePartieNecessiteConfirmation()) {
        const confirme = await demanderConfirmationNouvellePartie();
        if (!confirme) return;
        const { reinitialiserCampagneComplete } = await import('../reinitialiser-campagne.js');
        reinitialiserCampagneComplete();
    }
    const { ouvrirModeHistoireDepuisMenu } = await import('../histoire/histoire-intro.js');
    return ouvrirModeHistoireDepuisMenu();
}

export function initialiserBoutonsCampagne() {
    lierBouton('btn-continuer', () => {
        vibrerUi();
        void continuerCampagne();
    });
    lierBouton('btn-nouvelle-partie', () => {
        vibrerUi();
        void demarrerNouvelleCampagne();
    });
    mettreAJourMenuCampagneTitre();
}
