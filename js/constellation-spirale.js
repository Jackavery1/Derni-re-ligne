import { ORDRE_BIOMES_LIBRE } from './config/config.js';
import { obtenirDecalageCentreConstellation } from './constellation-zone.js';
import {
    constellationNoeuds,
    obtenirPanConstellationX,
    obtenirPanConstellationY,
    definirPanConstellation,
} from './constellation-etat.js';

/** @param {number} base */
export function parametresSpiraleConstellation(base) {
    const compact = base < 400;
    return {
        compact,
        rayonInit: base * (compact ? 0.05 : 0.12),
        croissance: base * (compact ? 0.022 : 0.06),
        angleIncr: compact ? 2.15 : 2.4,
    };
}

/** @param {() => boolean} panneauBiomeEstOuvert */
export function obtenirDecalageZoneActuel(panneauBiomeEstOuvert) {
    return obtenirDecalageCentreConstellation(panneauBiomeEstOuvert(), window.innerWidth);
}

export function bornesPanConstellation() {
    const max = window.innerWidth <= 768 ? 160 : 100;
    const x = Math.max(-max, Math.min(max, obtenirPanConstellationX()));
    definirPanConstellation(x, Math.max(-max, Math.min(max, obtenirPanConstellationY())));
}

/** @param {string} idBiome @param {HTMLCanvasElement} canvas @param {() => boolean} panneauBiomeEstOuvert */
export function centrerSurNoeud(idBiome, canvas, panneauBiomeEstOuvert) {
    const noeud = constellationNoeuds.find((n) => n.id === idBiome);
    if (!noeud || !canvas) return;
    const cx = canvas.width / 2 + obtenirDecalageZoneActuel(panneauBiomeEstOuvert);
    const cy = canvas.height / 2;
    definirPanConstellation(cx - noeud.x, cy - noeud.y);
    bornesPanConstellation();
}

/** @param {HTMLCanvasElement} canvas @param {() => boolean} panneauBiomeEstOuvert */
export function repositionnerNoeudsConstellation(canvas, panneauBiomeEstOuvert) {
    if (!canvas || !constellationNoeuds.length) return;
    const w = canvas.width;
    const h = canvas.height;
    const centreX = w / 2 + obtenirDecalageZoneActuel(panneauBiomeEstOuvert);
    const centreY = h / 2;
    const base = Math.min(w, h);
    const { rayonInit, croissance, angleIncr } = parametresSpiraleConstellation(base);

    ORDRE_BIOMES_LIBRE.forEach((id, index) => {
        const noeud = constellationNoeuds.find((n) => n.id === id);
        if (!noeud) return;
        const angle = index * angleIncr;
        const rayonSpirale = rayonInit + index * croissance;
        noeud.x = centreX + Math.cos(angle) * rayonSpirale;
        noeud.y = centreY + Math.sin(angle) * rayonSpirale;
    });
}
