import { chargerEtatHistoire } from '../io/progression-histoire.js';
import { lireStockage } from '../io/progression-stockage.js';
import { SEQUENCE_HISTOIRE } from '../histoire/histoire-donnees-exports.js';
import { sansAccentsE } from '../logique/texte-jeu.js';
import { demanderConfirmationDialog } from '../ui/dialog-confirmation.js';

function introHistoireDejaVue() {
    return lireStockage('derniereLigne_introHistoireVue', '0') === '1';
}

/**
 * @param {import('../histoire/histoire-donnees-exports.js').EtatHistoire} etat
 * @returns {boolean}
 */
export function aProgressionCampagne(etat) {
    return (
        (etat.mondesCompletes?.length ?? 0) > 0 ||
        (etat.bossVaincus?.length ?? 0) > 0 ||
        (etat.journauxTrouves?.length ?? 0) > 0 ||
        etat.finObtenue != null ||
        (etat.fragmentsVusIds?.length ?? 0) > 0 ||
        (etat.interludesVusIds?.length ?? 0) > 0 ||
        etat.outroVue === true ||
        (etat.toutesFinObtenues?.length ?? 0) > 0
    );
}

/** @returns {boolean} */
export function campagnePeutEtreContinuee() {
    if (introHistoireDejaVue()) return true;
    return aProgressionCampagne(chargerEtatHistoire());
}

/** @returns {boolean} */
export function nouvellePartieNecessiteConfirmation() {
    if (introHistoireDejaVue()) return true;
    return aProgressionCampagne(chargerEtatHistoire());
}

/** @returns {string} */
export function obtenirResumeCampagne() {
    const etat = chargerEtatHistoire();
    const nbMondes = etat.mondesCompletes?.length ?? 0;
    const chapitre = etat.chapitreActuel ?? 'prologue';

    if (etat.finObtenue) {
        return 'Campagne terminee — rejouer les mondes';
    }

    const mondeCourant = SEQUENCE_HISTOIRE.find(
        (m) => !etat.mondesCompletes.includes(m.id) && !m.estCache
    );
    if (mondeCourant?.nom) {
        return `${nbMondes} monde(s) — ${mondeCourant.nom}`;
    }

    if (nbMondes > 0) {
        return `${nbMondes} monde(s) complete(s)`;
    }

    if (introHistoireDejaVue()) {
        return chapitre === 'prologue' ? 'Prologue — carte histoire' : `Chapitre ${chapitre}`;
    }

    return 'La Fragmentation';
}

export function mettreAJourMenuCampagneTitre() {
    const btnContinuer = document.getElementById('btn-continuer');
    const btnNouvelle = document.getElementById('btn-nouvelle-partie');
    const sousContinuer = document.getElementById('btn-continuer-sous-titre');
    const peutContinuer = campagnePeutEtreContinuee();

    if (btnContinuer) {
        btnContinuer.classList.toggle('element-masque', !peutContinuer);
        btnContinuer.hidden = !peutContinuer;
        btnContinuer.setAttribute('aria-hidden', peutContinuer ? 'false' : 'true');
    }

    if (sousContinuer && peutContinuer) {
        sousContinuer.textContent = sansAccentsE(obtenirResumeCampagne());
    }

    if (btnNouvelle) {
        btnNouvelle.classList.toggle('btn-nouvelle-partie--seul', !peutContinuer);
    }
}

/**
 * @returns {Promise<boolean>}
 */
export function demanderConfirmationNouvellePartie() {
    return demanderConfirmationDialog({
        dialogId: 'dialog-nouvelle-partie',
        btnOuiId: 'btn-confirm-nouvelle-partie',
        btnNonId: 'btn-annuler-nouvelle-partie',
        fallbackMessage: 'Recommencer toute la campagne ? La progression actuelle sera effacee.',
    });
}
