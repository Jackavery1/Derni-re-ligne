import { LAYOUT } from '../config/config-jeu.js';
import { calculerEchelleInterface } from './layout-calcul.js';
import { lireInsetsSafeArea } from '../logique/safe-area.js';
import { estViewportPortrait, obtenirDimensionsViewport } from '../logique/viewport-dimensions.js';

export { obtenirDimensionsViewport, estViewportPortrait } from '../logique/viewport-dimensions.js';

export { calculerEchelleInterface } from './layout-calcul.js';
import { obtenirCanvasMenuFond, menuAnimActif } from '../menu-fond.js';
import { modeArchiEnCours, modeCoopEnCours } from '../etat/registre-modes.js';
import { obtenirIdBiomeFond } from './biome-fond.js';
import { demarrerFondBiome, invaliderCacheFond } from './rendu-fond-biome.js';
import { etat } from '../etat/store-jeu.js';

const SEUIL_PAYSAGE_COMPACT = 768;
const MARGE_COOP_COTES = 112;

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
    return hauteur <= SEUIL_PAYSAGE_COMPACT && largeur > hauteur && largeur <= 900;
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

const VARS_NOTIF = [
    '--notif-rail-left',
    '--notif-rail-top',
    '--notif-rail-width',
    '--notif-rail-height',
];

export function adapterNotifsJeu() {
    const zone = document.getElementById('zone-notifs-jeu');
    const root = document.documentElement;
    const body = document.body;
    if (!zone) return;
    if (!body?.classList.contains('partie-active')) {
        zone.removeAttribute('data-layout');
        body?.removeAttribute('data-notif-layout');
        VARS_NOTIF.forEach((p) => root.style.removeProperty(p));
        return;
    }
    const coop = document.body.classList.contains('coop-active');
    const archi = document.body.classList.contains('archi-active');
    const canvas = document.getElementById(
        coop ? 'zone-jeu-coop' : archi ? 'zone-jeu-archi' : 'zone-jeu'
    );
    const bloc = document.getElementById(
        coop ? 'interface-echelle-coop' : archi ? 'interface-echelle-archi' : 'interface-echelle'
    );
    if (!canvas || !bloc) return;
    const ins = lireInsetsSafeArea();
    const cr = canvas.getBoundingClientRect();
    const br = bloc.getBoundingClientRect();
    const portrait = estViewportPortrait();
    let left;
    let top;
    let width;
    let height;
    let layout;
    if (portrait) {
        top = ins.top + 4;
        left = cr.left;
        width = cr.width;
        height = Math.max(48, cr.top - top - 6);
        layout = 'above';
    } else {
        const sl = br.left - ins.left;
        const sr = window.innerWidth - br.right - ins.right;
        top = br.top;
        height = br.height;
        if (sl >= 128 && sl >= sr) {
            left = ins.left + 4;
            width = sl - 10;
            layout = 'beside-left';
        } else if (sr >= 128) {
            left = br.right + 6;
            width = sr - 10;
            layout = 'beside-right';
        } else {
            top = ins.top + 4;
            left = br.left;
            width = br.width;
            height = Math.max(48, br.top - top - 6);
            layout = 'above';
        }
    }
    zone.dataset.layout = layout;
    body.dataset.notifLayout = layout;
    root.style.setProperty('--notif-rail-left', `${left}px`);
    root.style.setProperty('--notif-rail-top', `${top}px`);
    root.style.setProperty('--notif-rail-width', `${width}px`);
    root.style.setProperty('--notif-rail-height', `${height}px`);
}

export function adapterInterface() {
    const echelle = document.getElementById('interface-echelle');
    const iface = document.getElementById('interface-jeu');
    if (!echelle || !iface) return;

    const { largeur, hauteur } = obtenirDimensionsViewport();
    const mobileControles = hauteurControlesTactiles();

    iface.style.flexDirection = 'row';
    iface.style.alignItems = 'flex-start';
    iface.style.justifyContent = 'center';
    const largeurTotale = LAYOUT.panneauLargeur * 2 + LAYOUT.gap * 2 + LAYOUT.plateauLargeur;
    const hauteurTotale = obtenirHauteurInterface();

    const scale = calculerEchelleInterface(largeur, hauteur, largeurTotale, hauteurTotale, {
        margeScale: LAYOUT.margeScale,
        hauteurControles: mobileControles,
        scaleMax: 2.2,
    });

    appliquerEchelleInterface(echelle, iface, largeurTotale, hauteurTotale, scale);
    adapterNotifsJeu();

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
    const mobileControles = hauteurControlesTactiles();
    const { largeur, hauteur } = obtenirDimensionsViewport();

    iface.style.flexDirection = 'row';
    iface.style.alignItems = 'flex-start';
    iface.style.justifyContent = 'center';
    const largeurTotale =
        LAYOUT_ARCHI.panneauLargeur * 2 + LAYOUT_ARCHI.gap * 2 + LAYOUT_ARCHI.plateauLargeur;
    const hauteurTotale = estPaysageMobile
        ? Math.max(LAYOUT_ARCHI.plateauHauteur, 280) + LAYOUT_ARCHI.paddingVertical
        : LAYOUT_ARCHI.plateauHauteur + LAYOUT_ARCHI.paddingVertical;

    const scale = calculerEchelleInterface(largeur, hauteur, largeurTotale, hauteurTotale, {
        margeScale: LAYOUT_ARCHI.margeScale,
        hauteurControles: mobileControles,
        scaleMax: 2.2,
    });

    appliquerEchelleInterface(echelle, iface, largeurTotale, hauteurTotale, scale);
    adapterNotifsJeu();
}

export function adapterInterfaceCoop() {
    const echelle = document.getElementById('interface-echelle-coop');
    const iface = document.getElementById('interface-jeu-coop');
    if (!echelle || !iface) return;

    const { largeur, hauteur } = obtenirDimensionsViewport();
    const mobileCoop = largeur <= SEUIL_PAYSAGE_COMPACT;

    let largeurTotale;
    let hauteurTotale;
    let margeScale = LAYOUT.margeScale;
    let hauteurControles = 0;

    if (mobileCoop) {
        iface.style.flexDirection = 'row';
        iface.style.alignItems = 'center';
        iface.style.justifyContent = 'center';
        largeurTotale = LAYOUT.plateauLargeur;
        hauteurTotale = LAYOUT.plateauHauteur + LAYOUT.paddingVertical;
        margeScale = MARGE_COOP_COTES + LAYOUT.margeScale;
        hauteurControles = 48;
    } else {
        iface.style.flexDirection = 'row';
        iface.style.alignItems = 'flex-start';
        iface.style.justifyContent = 'center';
        largeurTotale = LAYOUT.panneauLargeur * 2 + LAYOUT.gap * 2 + LAYOUT.plateauLargeur;
        hauteurTotale = Math.max(LAYOUT.plateauHauteur, 360) + LAYOUT.paddingVertical;
        hauteurControles = hauteurControlesTactiles();
    }

    const scale = calculerEchelleInterface(largeur, hauteur, largeurTotale, hauteurTotale, {
        margeScale,
        hauteurControles,
        scaleMax: 2.2,
    });

    appliquerEchelleInterface(echelle, iface, largeurTotale, hauteurTotale, scale);
    adapterNotifsJeu();
}

export function initialiserLayout() {
    ecouterViewport(() => {
        adapterInterface();
        if (modeArchiEnCours()) adapterInterfaceArchi();
        if (modeCoopEnCours()) adapterInterfaceCoop();
        void import('../logique/constellation.js').then(({ redimensionnerConstellation }) =>
            redimensionnerConstellation()
        );
        void import('../histoire/histoire-map.js').then((m) => m.redimensionnerCarteHistoire());
        invaliderCacheFond();
        if (etat.estEnCours) {
            demarrerFondBiome(obtenirIdBiomeFond());
        }
    });
}
