import { LAYOUT } from './config.js';
import { calculerEchelleInterface } from './layout-calcul.js';
import { lireInsetsSafeArea } from './safe-area.js';

export { calculerEchelleInterface } from './layout-calcul.js';
import { obtenirCanvasMenuFond, menuAnimActif } from './menu-fond.js';
import { modeArchiEnCours } from './registre-modes.js';
import { obtenirIdBiomeFond } from './biome-fond.js';
import { demarrerFondBiome, invaliderCacheFond } from './rendu-fond-biome.js';
import { etat } from './store-jeu.js';

const SEUIL_PAYSAGE_COMPACT = 768;

/** @returns {{ largeur: number, hauteur: number }} */
function obtenirDimensionsViewport() {
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
        return LAYOUT.hauteurControles + lireInsetsSafeArea().bottom;
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

function bonusHauteurTimerMarathon() {
    if (typeof document === 'undefined') return 0;
    const section = document.getElementById('section-timer-niveau');
    if (!section || section.classList.contains('element-masque')) return 0;
    return 36;
}

export function obtenirHauteurInterface() {
    const estPaysageMobile = estPaysageCompact();
    const timerBonus = bonusHauteurTimerMarathon();
    const statsH = estPaysageMobile ? 200 : LAYOUT.statsHauteur;
    const hGauche = LAYOUT.holdHauteur + 20 + statsH + 30 + timerBonus;
    const hMascotte = estPaysageMobile ? 72 : LAYOUT.mascotteHauteur;
    const hDroite = 210 + 20 + hMascotte + 20 + LAYOUT.pauseHauteur + 20;
    return Math.max(hGauche, hDroite, LAYOUT.plateauHauteur) + LAYOUT.paddingVertical;
}

export function adapterInterface() {
    const echelle = document.getElementById('interface-echelle');
    const iface = document.getElementById('interface-jeu');
    if (!echelle || !iface) return;

    const largeurTotale = LAYOUT.panneauLargeur * 2 + LAYOUT.gap * 2 + LAYOUT.plateauLargeur;
    const hauteurTotale = obtenirHauteurInterface();

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
        void import('./constellation.js').then(({ redimensionnerConstellation }) =>
            redimensionnerConstellation()
        );
        void import('./histoire-map.js').then((m) => m.redimensionnerCarteHistoire());
        invaliderCacheFond();
        if (etat.estEnCours) {
            demarrerFondBiome(obtenirIdBiomeFond());
        }
    });
}
