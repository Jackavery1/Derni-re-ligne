import { chargerEtatHistoire } from './progression-histoire.js';
import { lireStockage } from './progression-stockage.js';
import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { sansAccentsE } from './texte-jeu.js';

function introHistoireDejaVue() {
    return lireStockage('derniereLigne_introHistoireVue', '0') === '1';
}

/**
 * @param {import('./histoire-donnees.js').EtatHistoire} etat
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
    return new Promise((resolve) => {
        const dialog = document.getElementById('dialog-nouvelle-partie');
        const btnOui = document.getElementById('btn-confirm-nouvelle-partie');
        const btnNon = document.getElementById('btn-annuler-nouvelle-partie');
        if (!dialog || !btnOui || !btnNon) {
            resolve(
                window.confirm(
                    'Recommencer toute la campagne ? La progression actuelle sera effacee.'
                )
            );
            return;
        }

        const fermer = (valeur) => {
            dialog.classList.add('element-masque');
            dialog.setAttribute('aria-hidden', 'true');
            btnOui.removeEventListener('click', surOui);
            btnNon.removeEventListener('click', surNon);
            document.removeEventListener('keydown', surEchap);
            resolve(valeur);
        };

        const surOui = () => fermer(true);
        const surNon = () => fermer(false);
        const surEchap = (e) => {
            if (e.key === 'Escape') fermer(false);
        };

        btnOui.addEventListener('click', surOui);
        btnNon.addEventListener('click', surNon);
        document.addEventListener('keydown', surEchap);

        dialog.classList.remove('element-masque');
        dialog.setAttribute('aria-hidden', 'false');
        btnOui.focus({ preventScroll: true });
    });
}
