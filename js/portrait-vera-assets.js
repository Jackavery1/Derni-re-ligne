/** Portrait VERA 100 % canvas — plus de sprite PNG requis. */

export const PORTRAIT_VERA_SRC = null;

export function prechargerPortraitVera() {
    return Promise.resolve(null);
}

export function obtenirImagePortraitVera() {
    return null;
}

export function reinitialiserCachePortraitVeraAssets() {}

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
