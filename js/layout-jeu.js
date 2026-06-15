import { LAYOUT } from './config.js';
import { calculerEchelleInterface } from './layout-calcul.js';

export { calculerEchelleInterface } from './layout-calcul.js';
import { redimensionnerConstellation } from './constellation.js';
import { redimensionnerCarteHistoire } from './histoire-map.js';
import { obtenirCanvasMenuFond, menuAnimActif } from './menu-fond.js';
import { modeArchiEnCours } from './registre-modes.js';
import { obtenirIdBiomeFond } from './biome-fond.js';
import { demarrerFondBiome, invaliderCacheFond } from './rendu-fond-biome.js';
import { etat } from './store-jeu.js';

const SEUIL_PAYSAGE_COMPACT = 768;

/** @returns {{ largeur: number, hauteur: number }} */
function obtenirDimensionsViewport() {
    const vv = window.visualViewport;
    if (vv) return { largeur: vv.width, hauteur: vv.height };
    return { largeur: window.innerWidth, hauteur: window.innerHeight };
}

function ecouterViewport(callback) {
    window.addEventListener('resize', callback);
    window.visualViewport?.addEventListener('resize', callback);
    window.visualViewport?.addEventListener('scroll', callback);
}

const LAYOUT_ARCHI = {
    panneauLargeur: 120,
    gap: 10,
    plateauLargeur: LAYOUT.plateauLargeur,
    plateauHauteur: LAYOUT.plateauHauteur,
    paddingVertical: 16,
    margeScale: 20,
    hauteurControles: LAYOUT.hauteurControles,
};

function estPaysageCompact() {
    const { largeur, hauteur } = obtenirDimensionsViewport();
    return hauteur <= SEUIL_PAYSAGE_COMPACT && largeur > hauteur;
}

function hauteurControlesTactiles() {
    const { largeur, hauteur } = obtenirDimensionsViewport();
    if (estPaysageCompact()) return 0;
    if (largeur <= SEUIL_PAYSAGE_COMPACT || hauteur <= 600) {
        return LAYOUT.hauteurControles;
    }
    return 0;
}

/**
 * @param {HTMLElement} echelle
 * @param {HTMLElement} iface
 * @param {number} largeurTotale
 * @param {number} hauteurTotale
 * @param {number} scale
 */
function appliquerEchelleInterface(echelle, iface, largeurTotale, hauteurTotale, scale) {
    echelle.style.setProperty('--iface-echelle-w', `${largeurTotale * scale}px`);
    echelle.style.setProperty('--iface-echelle-h', `${hauteurTotale * scale}px`);
    iface.style.setProperty('--iface-w', `${largeurTotale}px`);
    iface.style.setProperty('--iface-scale', String(scale));
}

export function obtenirHauteurInterface() {
    const estPaysageMobile = estPaysageCompact();
    const hGauche = LAYOUT.holdHauteur + 20 + LAYOUT.statsHauteur + 30;
    const hMascotte = estPaysageMobile ? 72 : LAYOUT.mascotteHauteur;
    const hDroite = 210 + 20 + hMascotte + 20 + LAYOUT.pauseHauteur + 20;
    return Math.max(hGauche, hDroite, LAYOUT.plateauHauteur) + LAYOUT.paddingVertical;
}

export function adapterInterface() {
    const echelle = document.getElementById('interface-echelle');
    const iface = document.getElementById('interface-jeu');
    if (!echelle || !iface) return;

    const estPaysageMobile = estPaysageCompact();

    const largeurTotale = LAYOUT.panneauLargeur * 2 + LAYOUT.gap * 2 + LAYOUT.plateauLargeur;
    const hauteurTotale = estPaysageMobile
        ? Math.max(LAYOUT.plateauHauteur, LAYOUT.mascotteHauteur + 280) + LAYOUT.paddingVertical
        : obtenirHauteurInterface();

    const mobileControles = hauteurControlesTactiles();

    const { largeur, hauteur } = obtenirDimensionsViewport();

    const scale = calculerEchelleInterface(largeur, hauteur, largeurTotale, hauteurTotale, {
        margeScale: LAYOUT.margeScale,
        hauteurControles: mobileControles,
        scaleMax: 2.2,
    });

    appliquerEchelleInterface(echelle, iface, largeurTotale, hauteurTotale, scale);

    const canvasMenuFond = obtenirCanvasMenuFond();
    if (canvasMenuFond && menuAnimActif) {
        canvasMenuFond.width = largeur;
        canvasMenuFond.height = hauteur;
    }
}

export function adapterInterfaceArchi() {
    const echelle = document.getElementById('interface-echelle-archi');
    const iface = document.getElementById('interface-jeu-archi');
    if (!echelle || !iface) return;

    const estPaysageMobile = estPaysageCompact();
    const largeurTotale =
        LAYOUT_ARCHI.panneauLargeur * 2 + LAYOUT_ARCHI.gap * 2 + LAYOUT_ARCHI.plateauLargeur;
    const hauteurTotale = estPaysageMobile
        ? Math.max(LAYOUT_ARCHI.plateauHauteur, 280) + LAYOUT_ARCHI.paddingVertical
        : LAYOUT_ARCHI.plateauHauteur + LAYOUT_ARCHI.paddingVertical;

    const mobileControles = hauteurControlesTactiles();

    const { largeur, hauteur } = obtenirDimensionsViewport();

    const scale = calculerEchelleInterface(largeur, hauteur, largeurTotale, hauteurTotale, {
        margeScale: LAYOUT_ARCHI.margeScale,
        hauteurControles: mobileControles,
        scaleMax: 2.2,
    });

    appliquerEchelleInterface(echelle, iface, largeurTotale, hauteurTotale, scale);
}

export function initialiserLayout() {
    ecouterViewport(() => {
        adapterInterface();
        if (modeArchiEnCours()) adapterInterfaceArchi();
        redimensionnerConstellation();
        redimensionnerCarteHistoire();
        invaliderCacheFond();
        if (etat.estEnCours) {
            demarrerFondBiome(obtenirIdBiomeFond());
        }
    });
}
