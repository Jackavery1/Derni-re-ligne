import { LAYOUT } from './config.js';
import { redimensionnerConstellation } from './constellation.js';
import { redimensionnerCarteHistoire } from './histoire-map.js';
import { obtenirCanvasMenuFond, menuAnimActif } from './menu-fond.js';
import { archi } from './archi-logique.js';

const LAYOUT_ARCHI = {
    panneauLargeur: 120,
    gap: 10,
    plateauLargeur: LAYOUT.plateauLargeur,
    plateauHauteur: LAYOUT.plateauHauteur,
    paddingVertical: 16,
    margeScale: 20,
    hauteurControles: 0,
};

export function obtenirHauteurInterface() {
    const estPaysageMobile = window.innerHeight < 500 && window.innerWidth > window.innerHeight;
    const hGauche = LAYOUT.holdHauteur + 20 + LAYOUT.statsHauteur + 30;
    const hMascotte = estPaysageMobile ? 72 : LAYOUT.mascotteHauteur;
    const hDroite = 210 + 20 + hMascotte + 20 + LAYOUT.pauseHauteur + 20;
    return Math.max(hGauche, hDroite, LAYOUT.plateauHauteur) + LAYOUT.paddingVertical;
}

export function adapterInterface() {
    const echelle = document.getElementById('interface-echelle');
    const iface = document.getElementById('interface-jeu');
    if (!echelle || !iface) return;

    const estPaysageMobile = window.innerHeight < 500 && window.innerWidth > window.innerHeight;

    const largeurTotale = LAYOUT.panneauLargeur * 2 + LAYOUT.gap * 2 + LAYOUT.plateauLargeur;
    const hauteurTotale = estPaysageMobile
        ? Math.max(LAYOUT.plateauHauteur, LAYOUT.mascotteHauteur + 280) + LAYOUT.paddingVertical
        : obtenirHauteurInterface();

    let mobileControles = 0;
    if (!estPaysageMobile && (window.innerWidth <= 768 || window.innerHeight <= 600)) {
        mobileControles = LAYOUT.hauteurControles;
    }

    const scaleW = (window.innerWidth - LAYOUT.margeScale) / largeurTotale;
    const scaleH = (window.innerHeight - mobileControles - LAYOUT.margeScale) / hauteurTotale;

    const scale = Math.min(scaleW, scaleH, 2.2);

    echelle.style.width = `${largeurTotale * scale}px`;
    echelle.style.height = `${hauteurTotale * scale}px`;
    iface.style.width = `${largeurTotale}px`;
    iface.style.transform = `scale(${scale})`;
    iface.style.transformOrigin = 'top left';

    const canvasMenuFond = obtenirCanvasMenuFond();
    if (canvasMenuFond && menuAnimActif) {
        canvasMenuFond.width = window.innerWidth;
        canvasMenuFond.height = window.innerHeight;
    }
}

export function adapterInterfaceArchi() {
    const echelle = document.getElementById('interface-echelle-archi');
    const iface = document.getElementById('interface-jeu-archi');
    if (!echelle || !iface) return;

    const largeurTotale =
        LAYOUT_ARCHI.panneauLargeur * 2 + LAYOUT_ARCHI.gap * 2 + LAYOUT_ARCHI.plateauLargeur;
    const hauteurTotale = LAYOUT_ARCHI.plateauHauteur + LAYOUT_ARCHI.paddingVertical;

    const scaleW = (window.innerWidth - LAYOUT_ARCHI.margeScale) / largeurTotale;
    const scaleH = (window.innerHeight - LAYOUT_ARCHI.margeScale) / hauteurTotale;
    const scale = Math.min(scaleW, scaleH, 2.2);

    echelle.style.width = `${largeurTotale * scale}px`;
    echelle.style.height = `${hauteurTotale * scale}px`;
    iface.style.width = `${largeurTotale}px`;
    iface.style.transform = `scale(${scale})`;
    iface.style.transformOrigin = 'top left';
}

export function initialiserLayout() {
    window.addEventListener('resize', () => {
        adapterInterface();
        if (archi.actif) adapterInterfaceArchi();
        redimensionnerConstellation();
        redimensionnerCarteHistoire();
    });
}
