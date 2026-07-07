import { lireInsetsSafeArea } from './safe-area.js';

/** @returns {{ largeur: number, hauteur: number }} */
export function obtenirDimensionsViewport() {
    const insets = lireInsetsSafeArea();
    const vv = window.visualViewport;
    if (vv) {
        return {
            largeur: Math.max(0, vv.width - insets.left - insets.right),
            hauteur: Math.max(0, vv.height - insets.top - insets.bottom),
        };
    }
    return {
        largeur: Math.max(0, window.innerWidth - insets.left - insets.right),
        hauteur: Math.max(0, window.innerHeight - insets.top - insets.bottom),
    };
}

export function estViewportPortrait() {
    const vv = window.visualViewport;
    const largeur = vv?.width ?? window.innerWidth;
    const hauteur = vv?.height ?? window.innerHeight;
    return hauteur > largeur;
}
