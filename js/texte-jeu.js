/** Normalise e accentues pour l'affichage UI (hors bulles dialogue / narration). */
export function sansAccentsE(texte) {
    if (texte == null) return texte;
    return String(texte).replace(/[éèê]/g, 'e').replace(/[ÉÈÊ]/g, 'E');
}
