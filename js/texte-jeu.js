/** Normalise e accentues pour l'affichage UI (hors bulles dialogue / narration). */
export function sansAccentsE(texte) {
    if (texte == null) return texte;
    return String(texte).replace(/[éèê]/g, 'e').replace(/[ÉÈÊ]/g, 'E');
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
