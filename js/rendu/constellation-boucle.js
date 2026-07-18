import {
    dessinerFondBiomeConstellationCache,
    dessinerLignesConstellation as dessinerLignesRendu,
    dessinerNoeudBiome as dessinerNoeudRendu,
} from './constellation-rendu.js';
import {
    constellationEtoiles,
    constellationNoeuds,
    obtenirBiomeChoisi,
    obtenirCanvasConstellation,
    obtenirCtxConstellation,
    obtenirPanConstellationX,
    obtenirPanConstellationY,
    obtenirSourisCX,
    obtenirSourisCY,
    obtenirBiomeHover,
} from '../logique/constellation-etat.js';
import {
    abonnerBoucleMenuUnifiee,
    desabonnerBoucleMenuUnifiee,
} from '../logique/planificateur-raf.js';
import { ecouter } from '../etat/bus-jeu.js';

export function boucleConstellation(timestamp) {
    const ctxConst = obtenirCtxConstellation();
    const canvasConst = obtenirCanvasConstellation();
    if (!ctxConst || !canvasConst) return;

    const ecranSelection = document.getElementById('ecran-selection');
    if (!ecranSelection?.classList.contains('actif') || document.hidden) return;

    const w = canvasConst.width;
    const h = canvasConst.height;
    const parallax = window.innerWidth <= 768 ? 36 : 18;
    const offsetCamX = (obtenirSourisCX() / w - 0.5) * parallax + obtenirPanConstellationX();
    const offsetCamY = (obtenirSourisCY() / h - 0.5) * parallax + obtenirPanConstellationY();

    dessinerFondBiomeConstellationCache(ctxConst, w, h, obtenirBiomeChoisi() ?? 'classique');

    ctxConst.save();
    ctxConst.translate(offsetCamX, offsetCamY);

    const t = timestamp / 1000;
    for (const etoile of constellationEtoiles) {
        const scintil = 0.5 + 0.5 * Math.sin(t * etoile.vitesseTwinkle * 60 + etoile.phase);
        ctxConst.fillStyle = `rgba(255,255,255,${etoile.opaciteBase * scintil})`;
        ctxConst.beginPath();
        ctxConst.arc(etoile.x, etoile.y, etoile.rayon, 0, Math.PI * 2);
        ctxConst.fill();
    }

    dessinerLignesRendu(ctxConst, constellationNoeuds);

    for (const noeud of constellationNoeuds) {
        dessinerNoeudRendu(ctxConst, noeud, timestamp, obtenirBiomeHover(), obtenirBiomeChoisi());
    }

    ctxConst.restore();
}

let constellationBoucleBusInitialise = false;

export function initialiserConstellationBoucleBus() {
    if (constellationBoucleBusInitialise) return;
    constellationBoucleBusInitialise = true;
    ecouter('constellation:demarrer', () => {
        abonnerBoucleMenuUnifiee(boucleConstellation);
    });
    ecouter('constellation:arreter', () => {
        desabonnerBoucleMenuUnifiee(boucleConstellation);
    });
}
