/** Surfaces offscreen mises en cache pour le rendu du plateau (vignette, ambiance, météo). */
import { CONFIG } from '../config/config.js';

/** @type {HTMLCanvasElement | OffscreenCanvas | null} */
let cacheVignette = null;
let cacheVignetteCle = '';
/** @type {HTMLCanvasElement | OffscreenCanvas | null} */
let cacheAmbBas = null;
let cacheAmbBasCle = '';
/** @type {HTMLCanvasElement | OffscreenCanvas | null} */
let cacheMasqueMeteo = null;
let cacheMasqueMeteoCle = '';

function creerSurfaceCache(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(w, h);
    }
    const surface = document.createElement('canvas');
    surface.width = w;
    surface.height = h;
    return surface;
}

function obtenirCacheVignette(w, h) {
    const cle = `${w}x${h}`;
    if (cacheVignette && cacheVignetteCle === cle) return cacheVignette;
    const surface = creerSurfaceCache(w, h);
    const ctx = /** @type {CanvasRenderingContext2D} */ (surface.getContext('2d'));
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    cacheVignette = surface;
    cacheVignetteCle = cle;
    return cacheVignette;
}

function obtenirCacheAmbBas(w, h, r, g, b) {
    const cle = `${w}x${h}x${r},${g},${b}`;
    if (cacheAmbBas && cacheAmbBasCle === cle) return cacheAmbBas;
    const surface = creerSurfaceCache(w, h);
    const ctx = /** @type {CanvasRenderingContext2D} */ (surface.getContext('2d'));
    const amb = `rgba(${r},${g},${b}`;
    const gradBas = ctx.createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, w * 0.9);
    gradBas.addColorStop(0, `${amb},0.11)`);
    gradBas.addColorStop(1, `${amb},0)`);
    ctx.fillStyle = gradBas;
    ctx.fillRect(0, 0, w, h);
    cacheAmbBas = surface;
    cacheAmbBasCle = cle;
    return cacheAmbBas;
}

export function obtenirCacheMasqueMeteo(w, h) {
    const yMasque = (CONFIG.lignes - 4) * CONFIG.taille;
    const cle = `${w}x${h}x${yMasque}`;
    if (cacheMasqueMeteo && cacheMasqueMeteoCle === cle) return cacheMasqueMeteo;
    const surface = creerSurfaceCache(w, h);
    const ctx = /** @type {CanvasRenderingContext2D} */ (surface.getContext('2d'));
    const grad = ctx.createLinearGradient(0, yMasque, 0, h);
    grad.addColorStop(0, 'rgba(180,230,255,0)');
    grad.addColorStop(0.4, 'rgba(180,230,255,0.55)');
    grad.addColorStop(1, 'rgba(180,230,255,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, yMasque, w, h - yMasque);
    cacheMasqueMeteo = surface;
    cacheMasqueMeteoCle = cle;
    return cacheMasqueMeteo;
}

/** Visible en tests uniquement. */
export function _invaliderCacheGradientsPlateau() {
    cacheVignette = null;
    cacheVignetteCle = '';
    cacheAmbBas = null;
    cacheAmbBasCle = '';
    cacheMasqueMeteo = null;
    cacheMasqueMeteoCle = '';
}

export function dessinerAmbiancePlateauCache(ctx, w, h, couleurAmbRgb, pieceX) {
    const r = Math.round(couleurAmbRgb[0]);
    const g = Math.round(couleurAmbRgb[1]);
    const b = Math.round(couleurAmbRgb[2]);
    const amb = `rgba(${r},${g},${b}`;

    const cacheBas = obtenirCacheAmbBas(w, h, r, g, b);
    if (cacheBas) ctx.drawImage(cacheBas, 0, 0);

    if (pieceX !== null) {
        const gradHaut = ctx.createRadialGradient(pieceX, 0, 0, pieceX, 0, w * 0.7);
        gradHaut.addColorStop(0, `${amb},0.07)`);
        gradHaut.addColorStop(1, `${amb},0)`);
        ctx.fillStyle = gradHaut;
        ctx.fillRect(0, 0, w, h);
    }
}

export function dessinerVignettePlateauCache(ctx, w, h) {
    const cache = obtenirCacheVignette(w, h);
    if (cache) ctx.drawImage(cache, 0, 0);
}
