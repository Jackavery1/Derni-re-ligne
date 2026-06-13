export const LARGEUR_PANNEAU_SEL_DESKTOP = 380;
export const SEUIL_PANNEAU_SEL_MOBILE = 768;

/**
 * @param {boolean} panneauOuvert
 * @param {number} [largeurViewport]
 * @returns {number}
 */
export function obtenirDecalageCentreConstellation(panneauOuvert, largeurViewport = 0) {
    if (!panneauOuvert || largeurViewport < SEUIL_PANNEAU_SEL_MOBILE) return 0;
    return -LARGEUR_PANNEAU_SEL_DESKTOP / 2;
}
