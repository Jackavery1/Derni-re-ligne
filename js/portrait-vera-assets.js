import { logger } from './logger.js';

export const PORTRAIT_VERA_SRC = 'assets/portraits/vera-base.png';

/** @type {HTMLImageElement | null} */
let _image = null;
/** @type {Promise<HTMLImageElement | null> | null} */
let _promesse = null;

export function prechargerPortraitVera() {
    if (_image) return Promise.resolve(_image);
    if (_promesse) return _promesse;

    _promesse = new Promise((resolve) => {
        if (typeof Image === 'undefined') {
            resolve(null);
            return;
        }
        const img = new Image();
        img.onload = () => {
            _image = img;
            resolve(img);
        };
        img.onerror = () => {
            logger.warn('[portrait-vera] échec chargement', PORTRAIT_VERA_SRC);
            resolve(null);
        };
        img.src = PORTRAIT_VERA_SRC;
    });

    return _promesse;
}

export function obtenirImagePortraitVera() {
    return _image;
}

export function reinitialiserCachePortraitVeraAssets() {
    _image = null;
    _promesse = null;
}

/**
 * @param {number} w
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
