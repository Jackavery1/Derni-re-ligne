import { JOURNAUX_VERA, SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './progression.js';
import { store } from './store-core.js';

export const SEUILS_COMPLETION = {
    classique: 8,
    lave: 10,
    rouille: 9,
    ocean: 10,
    foret: 10,
    glace: 10,
    desert: 11,
    eclipse: 10,
    cyber: 12,
    fuochi: 12,
    cosmos: 12,
    vide: 9,
    miroir: 12,
    trame: 14,
};

/** @returns {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} */
export function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

export function rafraichirEtatHistoire() {
    store.histoire.etat = chargerEtatHistoire();
    return store.histoire.etat;
}

/**
 * @param {string} mondeId
 * @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} [etatHist]
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
 * @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} [etatHist]
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

/** @param {string} mondeId @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etat */
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

/** @param {import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist */
export function sauvegarderEtatHistoireStore(etatHist) {
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}
