/** Normalise e accentues pour l'affichage UI (hors bulles dialogue / narration). */
import { lireStockage, ecrireStockage } from '../io/progression-stockage.js';

const CLE_ACCENTS_UI = 'derniereLigne_accentsUi';

let accentsUiActifs = false;

export function obtenirAccentsUi() {
    return accentsUiActifs;
}

export function chargerAccentsUiDepuisStockage() {
    accentsUiActifs = lireStockage(CLE_ACCENTS_UI, 'false') === 'true';
}

export function persisterAccentsUi(actif) {
    accentsUiActifs = actif;
    ecrireStockage(CLE_ACCENTS_UI, actif.toString());
}

export function sansAccentsE(texte) {
    if (texte == null) return texte;
    const source = String(texte);
    if (accentsUiActifs) return source;
    return source.replace(/[éèê]/g, 'e').replace(/[ÉÈÊ]/g, 'E');
}

/** Affichage sans accents visuels, nom accessible avec accents pour lecteurs d'ecran. */
export function definirTexteUi(element, texte) {
    if (!element) return;
    const source = texte == null ? '' : String(texte);
    element.textContent = sansAccentsE(source);
    if (source) {
        element.setAttribute('aria-label', source);
    } else {
        element.removeAttribute('aria-label');
    }
}
