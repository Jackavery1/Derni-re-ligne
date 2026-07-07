/** @typedef {{ palette: (string|null)[], grille: string[] }} IconePixel */

const _cache = new Map();

/** @type {Record<string, IconePixel>} */
let ICONES_PIXEL = {};

/** @type {Promise<Record<string, IconePixel>> | null} */
let chargePromise = null;

/**
 * @returns {Promise<Record<string, IconePixel>>}
 */
export async function chargerIconesPixel() {
    if (Object.keys(ICONES_PIXEL).length > 0) return ICONES_PIXEL;
    if (chargePromise) return chargePromise;
    chargePromise = fetch('./data/icones-pixel.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`icones-pixel.json : ${reponse.status}`);
            return reponse.json();
        })
        .then((donnees) => {
            ICONES_PIXEL = donnees;
            return donnees;
        });
    return chargePromise;
}

/** @returns {boolean} */
export function iconesPixelChargees() {
    return Object.keys(ICONES_PIXEL).length > 0;
}

/**
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexVersRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * @param {string} hex
 * @param {number} alpha
 * @returns {string}
 */
function rgbaHex(hex, alpha) {
    const { r, g, b } = hexVersRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {IconePixel} icone
 * @param {number} x
 * @param {number} y
 * @param {number} taillePixel
 * @param {{ silhouette?: boolean, accent?: string, taillePixel?: number }} [options]
 */
function dessinerGrille(ctx, icone, x, y, taillePixel, options = {}) {
    const { silhouette = false, accent = '#ffffff' } = options;
    const tons = [null, rgbaHex(accent, 0.12), rgbaHex(accent, 0.2), rgbaHex(accent, 0.28)];

    for (let lig = 0; lig < icone.grille.length; lig++) {
        const ligne = icone.grille[lig];
        for (let col = 0; col < ligne.length; col++) {
            const idx = Number(ligne[col]);
            if (!idx) continue;
            let couleur;
            if (silhouette) {
                couleur = tons[Math.min(idx, 3)] ?? tons[2];
            } else {
                couleur = icone.palette[idx];
            }
            if (!couleur) continue;
            ctx.fillStyle = couleur;
            ctx.fillRect(x + col * taillePixel, y + lig * taillePixel, taillePixel, taillePixel);
        }
    }
}

/**
 * @param {string} idIcone
 * @param {number} taillePixel
 * @param {{ silhouette?: boolean, accent?: string }} options
 * @returns {string}
 */
function cleCache(idIcone, taillePixel, options) {
    return `${idIcone}-${taillePixel}-${options.silhouette ? 1 : 0}-${options.accent ?? ''}`;
}

/**
 * @param {string} idIcone
 * @param {number} taillePixel
 * @param {{ silhouette?: boolean, accent?: string }} options
 * @returns {OffscreenCanvas | HTMLCanvasElement | null}
 */
function obtenirSurfaceCachee(idIcone, taillePixel, options) {
    const icone = ICONES_PIXEL[idIcone];
    if (!icone) return null;

    const cle = cleCache(idIcone, taillePixel, options);
    if (_cache.has(cle)) return _cache.get(cle);

    const taille = 16 * taillePixel;
    let surface = null;
    let ctx = null;
    if (typeof OffscreenCanvas !== 'undefined') {
        try {
            const oc = new OffscreenCanvas(taille, taille);
            if (typeof oc.getContext === 'function') {
                const ocCtx = oc.getContext('2d');
                if (ocCtx) {
                    surface = oc;
                    ctx = ocCtx;
                }
            }
        } catch {
            surface = null;
            ctx = null;
        }
    }
    if (!ctx && typeof document !== 'undefined' && typeof document.createElement === 'function') {
        try {
            const el = document.createElement('canvas');
            if (typeof el.getContext === 'function') {
                el.width = taille;
                el.height = taille;
                ctx = el.getContext('2d');
                if (ctx) surface = el;
            }
        } catch {
            ctx = null;
            surface = null;
        }
    }
    if (!ctx || !surface) return null;

    ctx.imageSmoothingEnabled = false;
    ctx.filter = 'none';
    dessinerGrille(
        /** @type {CanvasRenderingContext2D} */ (ctx),
        icone,
        0,
        0,
        taillePixel,
        options
    );
    _cache.set(cle, surface);
    return surface;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} idIcone
 * @param {number} x
 * @param {number} y
 * @param {number} taillePixel
 * @param {{ silhouette?: boolean, accent?: string, taillePixel?: number }} [options]
 */
export function dessinerIconePixel(ctx, idIcone, x, y, taillePixel, options = {}) {
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.filter = 'none';

    const surface = obtenirSurfaceCachee(idIcone, taillePixel, options);
    if (surface) {
        const taille = 16 * taillePixel;
        ctx.drawImage(surface, x, y, taille, taille);
        return;
    }

    const icone = ICONES_PIXEL[idIcone];
    if (!icone) return;
    dessinerGrille(ctx, icone, x, y, taillePixel, options);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} idIcone
 * @param {{ silhouette?: boolean, accent?: string, taillePixel?: number }} [options]
 */
export function rendreIconeSurCanvas(canvas, idIcone, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const taillePixel = canvas.width / 16;
    dessinerIconePixel(ctx, idIcone, 0, 0, taillePixel, options);
}

/**
 * @param {string} seedId
 * @returns {number}
 */
function hashId(seedId) {
    let s = 0;
    for (let i = 0; i < seedId.length; i++) {
        s = (Math.imul(s, 31) + seedId.charCodeAt(i)) >>> 0;
    }
    return s;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} idIcone
 * @param {number} x
 * @param {number} y
 * @param {number} taillePixel
 * @param {{ accent?: string, seedId?: string }} [options]
 */
export function dessinerIconePixelGlitch(ctx, idIcone, x, y, taillePixel, options = {}) {
    const { accent = '#ffffff', seedId = idIcone } = options;
    const icone = ICONES_PIXEL[idIcone];
    if (!icone || !ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.filter = 'none';

    dessinerGrille(ctx, icone, x, y, taillePixel, { silhouette: true, accent });

    const seed = hashId(seedId);
    const shiftCols = 2 + (seed % 2);
    const rowGlitch = 5 + (seed % 6);
    const offsetX = shiftCols * taillePixel;
    const tons = [null, rgbaHex(accent, 0.1), rgbaHex(accent, 0.18)];

    for (let lig = rowGlitch; lig < icone.grille.length; lig++) {
        const ligne = icone.grille[lig];
        for (let col = 0; col < ligne.length; col++) {
            const idx = Number(ligne[col]);
            if (!idx) continue;
            const couleur = tons[Math.min(idx, 2)] ?? tons[1];
            if (!couleur) continue;
            ctx.fillStyle = couleur;
            ctx.fillRect(
                x + col * taillePixel + offsetX,
                y + lig * taillePixel,
                taillePixel,
                taillePixel
            );
        }
    }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} idIcone
 * @param {{ accent?: string, seedId?: string }} [options]
 */
export function rendreIconeGlitchSurCanvas(canvas, idIcone, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const taillePixel = canvas.width / 16;
    dessinerIconePixelGlitch(ctx, idIcone, 0, 0, taillePixel, options);
}
