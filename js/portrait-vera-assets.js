/** Sprite portrait VERA (cutscenes) — fallback canvas si chargement impossible. */

export const PORTRAIT_VERA_SRC = 'img/vera.png';

/** @type {HTMLImageElement | null} */
let cache = null;

/** @type {Promise<HTMLImageElement | null> | null} */
let chargement = null;

export function prechargerPortraitVera() {
    if (cache?.complete && cache.naturalWidth > 0) return Promise.resolve(cache);
    if (chargement) return chargement;
    if (typeof Image === 'undefined') return Promise.resolve(null);

    chargement = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            cache = img;
            resolve(img);
        };
        img.onerror = () => {
            cache = null;
            resolve(null);
        };
        img.src = PORTRAIT_VERA_SRC;
    });

    return chargement;
}

export function obtenirImagePortraitVera() {
    if (cache?.complete && cache.naturalWidth > 0) return cache;
    return null;
}

export function reinitialiserCachePortraitVeraAssets() {
    cache = null;
    chargement = null;
}

/**
 * @param {number} w
 * @param {number} h
 * @param {number} imgW
 * @param {number} imgH
 */
export function calculerCadrePortraitVera(w, h, imgW, imgH) {
    const margeBas = h * 0.04;
    const margeHaut = h * 0.02;
    const zoneH = h - margeBas - margeHaut;
    const scale = Math.min(w / imgW, zoneH / imgH) * 0.96;
    const dw = imgW * scale;
    const dh = imgH * scale;
    return {
        dx: (w - dw) / 2,
        dy: h - dh - margeBas,
        dw,
        dh,
        scale,
    };
}
