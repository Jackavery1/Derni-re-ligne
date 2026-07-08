/** Blocs verrouillés et overlays mécaniques sur le plateau. */
import { CONFIG } from '../config/config.js';
import { etat, obtenirCtx, obtenirCanvasPlateau } from '../etat/store-jeu.js';
import { dessinerCellule } from './rendu-cellule.js';
import { celluleEstRouillee } from '../histoire/mecaniques-histoire.js';

/** @type {HTMLCanvasElement | OffscreenCanvas | null} */
let cacheBlocs = null;
let cacheBlocsCle = '';

function creerSurfaceCache(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(w, h);
    }
    const surface = document.createElement('canvas');
    surface.width = w;
    surface.height = h;
    return surface;
}

function calculerClePlateauVerrouille() {
    let cle = '';
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            const v = etat.plateau[l][c];
            if (!v) continue;
            cle += `${c},${l},${v},${celluleEstRouillee(c, l) ? 1 : 0};`;
        }
    }
    return cle;
}

function dessinerOverlayRouille(ctx, c, l) {
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = '#5c2a00';
    ctx.fillRect(
        c * CONFIG.taille + 2,
        l * CONFIG.taille + 2,
        CONFIG.taille - 4,
        CONFIG.taille - 4
    );
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#8b3a00';
    const graine = c * 31 + l * 17;
    for (let i = 0; i < 4; i++) {
        const rx = (((graine + i * 13) % 7) / 7) * (CONFIG.taille - 6) + 1;
        const ry = (((graine + i * 19) % 7) / 7) * (CONFIG.taille - 6) + 1;
        ctx.fillRect(c * CONFIG.taille + rx, l * CONFIG.taille + ry, 3, 3);
    }
    ctx.restore();
}

function reconstruireCacheBlocs(w, h) {
    const surface = creerSurfaceCache(w, h);
    const ctxCache = /** @type {CanvasRenderingContext2D} */ (surface.getContext('2d'));
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (!etat.plateau[l][c]) continue;
            dessinerCellule(ctxCache, c, l, etat.plateau[l][c]);
            if (celluleEstRouillee(c, l)) {
                dessinerOverlayRouille(ctxCache, c, l);
            }
        }
    }
    cacheBlocs = surface;
    cacheBlocsCle = calculerClePlateauVerrouille();
}

/** Visible en tests uniquement. */
export function _invaliderCacheBlocsVerrouilles() {
    cacheBlocs = null;
    cacheBlocsCle = '';
}

export function dessinerBlocsVerrouilles() {
    const ctx = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const cle = calculerClePlateauVerrouille();
    if (!cacheBlocs || cacheBlocsCle !== cle || cacheBlocs.width !== w || cacheBlocs.height !== h) {
        reconstruireCacheBlocs(w, h);
    }
    if (cacheBlocs) ctx.drawImage(cacheBlocs, 0, 0);
}
