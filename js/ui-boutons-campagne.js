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
    mettreAJourMenuCampagneTitre();
}
