import { JOURNAUX_VERA, ETAT_HISTOIRE_VIDE, SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirCutsceneEntree, afficherJournalVera } from './histoire-narratif.js';
import { store } from './store-core.js';
import { definirBiomeActif } from './store-etat-partie.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import {
    sauvegarderBiomeActif,
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
} from './progression.js';
import { obtenirActions } from './actions-jeu.js';
import { afficherEcran, cacherEcrans } from './navigation-ecrans.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { arreterBoss } from './boss-jeu.js';
import { paradoxeEstDebloque, demarrerParadoxe } from './monde-paradoxe.js';
import { arreterFondFin } from './fin-bg-rendu.js';
import { afficherTutorielPrologueApresCutscene } from './tutoriel.js';
import { afficherBoutonCarteGameOver, afficherCutsceneHistoire } from './histoire-manager-ui.js';
import { surFinDeMondeHistoire } from './histoire-manager-completion.js';

export {
    afficherCutsceneHistoire,
    afficherFinHistoire,
    afficherJournalHistoire,
    avancerCutscene,
    fermerJournalHistoire,
    passerCutscene,
} from './histoire-manager-ui.js';
export { SEUILS_COMPLETION, surFinDeMondeHistoire } from './histoire-manager-completion.js';

/** @returns {typeof ETAT_HISTOIRE_VIDE} */
export function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

export function rafraichirEtatHistoire() {
    store.histoire.etat = chargerEtatHistoire();
    return store.histoire.etat;
}

/**
 * @param {string} mondeId
 * @param {typeof ETAT_HISTOIRE_VIDE} [etatHist]
 * @returns {'verrouille'|'disponible'|'complete'}
 */
export function obtenirEtatMonde(mondeId, etatHist) {
    const etat = etatHist ?? obtenirEtatHistoire();
    if (etat.mondesCompletes.includes(mondeId)) return 'complete';
    if (mondePeutEtreJoue(mondeId, etat)) return 'disponible';
    return 'verrouille';
}

/**
 * @param {string} mondeId
 * @param {typeof ETAT_HISTOIRE_VIDE} [etatHist]
 * @returns {boolean}
 */
export function mondePeutEtreJoue(mondeId, etatHist) {
    const etat = etatHist ?? obtenirEtatHistoire();
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) return false;

    if (monde.estCache) return mondeSecretEstDebloque(mondeId, etat);

    if (monde.ordreGlobal === 1) return true;

    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);
    const indexMonde = sequencePrincipale.findIndex((m) => m.id === mondeId);
    if (indexMonde <= 0) return true;

    const mondePrecedent = sequencePrincipale[indexMonde - 1];
    return etat.mondesCompletes.includes(mondePrecedent.id);
}

/** @param {string} mondeId @param {typeof ETAT_HISTOIRE_VIDE} etat */
function mondeSecretEstDebloque(mondeId, etat) {
    switch (mondeId) {
        case 'monde_miroir':
            return (
                etat.conditionsMiroir.bossArchivisteVaincu &&
                etat.conditionsMiroir.tetrisTriplesCyber >= 3
            );
        case 'monde_trame':
            return (
                etat.conditionsTrame.miroirComplete &&
                etat.conditionsTrame.tousJournauxTrouves &&
                etat.conditionsTrame.tousBossSansContinue &&
                etat.conditionsTrame.actionDistorsionFaite
            );
        case 'monde_paradoxe':
            return (
                etat.conditionsParadoxe.finSecreteObtenue &&
                etat.conditionsParadoxe.topsVolontairesPrologue >= 3
            );
        default:
            return false;
    }
}

/** @param {string} mondeId */
export function demarrerMondeHistoire(mondeId) {
    if (mondeId === 'monde_paradoxe') {
        demarrerMondeHistoireCache(mondeId);
        return;
    }

    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) {
        logger.warn('Monde histoire introuvable:', mondeId);
        return;
    }

    const etat = obtenirEtatHistoire();
    if (!mondePeutEtreJoue(mondeId, etat)) {
        logger.warn('Monde verrouillé:', mondeId);
        return;
    }

    masquerPanneauDetails();

    const dejaJoue =
        etat.mondesCompletes.includes(mondeId) || (etat.mondesDejaMontres ?? []).includes(mondeId);

    const cutscene = obtenirCutsceneEntree(mondeId, !dejaJoue);
    if (cutscene) {
        if (!etat.mondesDejaMontres) etat.mondesDejaMontres = [];
        if (!etat.mondesDejaMontres.includes(mondeId)) {
            etat.mondesDejaMontres.push(mondeId);
            sauvegarderEtatHistoire(etat);
        }
        afficherCutsceneHistoire(cutscene.lignes, cutscene.personnages, () =>
            _apresPresentationMonde(monde)
        );
    } else {
        _apresPresentationMonde(monde);
    }
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _apresPresentationMonde(monde) {
    if (monde.id === 'monde_prologue') {
        afficherTutorielPrologueApresCutscene(() => _lancerPartieHistoire(monde));
        return;
    }
    _lancerPartieHistoire(monde);
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _lancerPartieHistoire(monde) {
    void import('./histoire-map.js').then(({ arreterCarteHistoire }) => arreterCarteHistoire());

    store.histoire.actif = true;
    store.histoire.mondeActuel = monde.id;

    definirBiomeActif(monde.biomeId);
    sauvegarderBiomeActif(monde.biomeId);

    cacherEcrans();
    document.body.classList.add('histoire-active');

    obtenirActions().demarrerJeu?.();
}

export function retournerACarte() {
    store.histoire.actif = false;
    store.histoire.mondeActuel = null;
    store.histoire.etat = null;
    document.body.classList.remove('histoire-active');
    arreterBoss();
    arreterFondFin();
    afficherBoutonCarteGameOver(false);

    if (store.histoire.dernierJournal) {
        const journal = store.histoire.dernierJournal;
        store.histoire.dernierJournal = null;
        afficherJournalVera(journal, () => afficherEcran(ECRANS.HISTOIRE_MAP));
    } else {
        afficherEcran(ECRANS.HISTOIRE_MAP);
    }
}

export function retournerAuMondeActuel() {
    const mondeId = store.histoire.mondeActuel;
    if (mondeId) {
        document.body.classList.remove('histoire-active');
        demarrerMondeHistoire(mondeId);
    } else {
        retournerACarte();
    }
}

/** @param {string} mondeId */
export function demarrerMondeHistoireCache(mondeId) {
    if (mondeId === 'monde_paradoxe') {
        if (paradoxeEstDebloque()) demarrerParadoxe();
        return;
    }
    demarrerMondeHistoire(mondeId);
}

export function masquerPanneauDetails() {
    const panneau = document.getElementById('histoire-monde-details');
    panneau?.classList.add('histoire-panneau-masque');
}

export function obtenirProgressionGlobale() {
    const etat = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);
    const nbTotal = sequencePrincipale.length;
    const nbCompletes = sequencePrincipale.filter((m) =>
        etat.mondesCompletes.includes(m.id)
    ).length;
    const nbJournaux = etat.journauxTrouves.length;
    const nbJournauxTotal = JOURNAUX_VERA.length;
    return { nbCompletes, nbTotal, nbJournaux, nbJournauxTotal };
}

/** @param {typeof ETAT_HISTOIRE_VIDE} etatHist */
export function sauvegarderEtatHistoireStore(etatHist) {
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}
