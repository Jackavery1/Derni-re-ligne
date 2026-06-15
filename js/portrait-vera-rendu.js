import { seedFraction } from './portrait-rendu-utils.js';
import { calculerCadrePortraitVera, obtenirImagePortraitVera } from './portrait-vera-assets.js';

export { prechargerPortraitVera } from './portrait-vera-assets.js';

export const PALETTE_VERA = {
    COMBINAISON: '#e8edf5',
    COMBINAISON_OMBRE: '#b8c4d6',
    LISERES: '#3da8e0',
    CASQUE: '#9ecde8',
    ECRUTEURS: '#7ab4d8',
    VISIERE: '#7fd4f0',
    VISIERE_REFLET: '#c8ecf8',
    VISIERE_SOMBRE: '#3a7a96',
    MONTURE: '#f5f8fc',
    YEUX: '#4a90c8',
    YEUX_REFLET: '#a8d4f0',
    PEAU: '#e8b9a8',
    PEAU_OMBRE: '#c89484',
    CHEVEUX: '#8a4a3a',
    CHEVEUX_REFLET: '#a8604a',
    SOURCILS: '#6a4a3a',
    LEVRES: '#c8786a',
    HALO: '#ff2d78',
    HALO_DOUX: '#ff5a98',
};

export const PALETTE_VERA_DESAT = {
    COMBINAISON: '#b4b8c0',
    COMBINAISON_OMBRE: '#9098a4',
    LISERES: '#6a8ea8',
    VISIERE: '#8aa8b4',
    VISIERE_REFLET: '#b0c0c8',
    VISIERE_SOMBRE: '#687880',
    MONTURE: '#c8ccd0',
    YEUX: '#6888a0',
    YEUX_REFLET: '#98b0c0',
    PEAU: '#b09890',
    PEAU_OMBRE: '#988078',
    CHEVEUX: '#685040',
    CHEVEUX_REFLET: '#806050',
    HALO: '#b85878',
    HALO_DOUX: '#c07088',
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {HTMLImageElement} img
 * @param {{ desature?: boolean, alpha?: number, teinte?: 'cyan' | 'rose' | null }} opts
 */
function _dessinerSpriteVera(ctx, w, h, img, opts = {}) {
    const { dx, dy, dw, dh } = calculerCadrePortraitVera(w, h, img.width, img.height);
    ctx.save();
    ctx.globalAlpha = opts.alpha ?? 1;
    if (opts.desature) ctx.filter = 'saturate(0.35) brightness(0.88)';
    else if (opts.teinte === 'cyan')
        ctx.filter = 'brightness(1.08) saturate(1.15) hue-rotate(-8deg)';
    else if (opts.teinte === 'rose')
        ctx.filter = 'brightness(1.05) saturate(1.2) hue-rotate(12deg)';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {HTMLImageElement} source
 * @param {number} tAnim
 * @param {number[]} decalages
 */
function _appliquerBandesGlitch(ctx, w, h, source, tAnim, decalages) {
    const { dx, dy, dw, dh } = calculerCadrePortraitVera(w, h, source.width, source.height);
    const cy = dy + dh * 0.38;
    const hBande = Math.max(14, dh * 0.12);
    const bandes = 3;

    for (let bi = 0; bi < bandes; bi++) {
        const y0 = cy - dh * 0.18 + bi * (hBande + 4);
        const offset =
            (decalages[bi] ?? 0) + Math.sin(tAnim * 6 + bi * 1.7 + seedFraction(bi) * 6) * 3;
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, y0, dw, hBande);
        ctx.clip();
        ctx.drawImage(source, dx + offset, dy, dw, dh, dx, dy, dw, dh);
        ctx.restore();
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} s
 * @param {Record<string, number | boolean | number[]>} params
 */
function _dessinerOverlayVisiere(ctx, w, h, s, params) {
    const cx = w * 0.5;
    const visY = h * 0.28;
    const visW = w * 0.58;
    const visH = h * 0.16;
    const lueur = /** @type {number} */ (params.lueurRose ?? 1);
    const intense = params.visiereLumineuse === true;
    const inquiete = params.sourcils === true;

    ctx.save();
    ctx.globalAlpha = intense ? 0.45 : inquiete ? 0.28 : 0.18;
    ctx.fillStyle = intense ? PALETTE_VERA.VISIERE_REFLET : PALETTE_VERA.VISIERE;
    ctx.shadowColor = PALETTE_VERA.LISERES;
    ctx.shadowBlur = (intense ? 14 : 8) * s * lueur;
    ctx.fillRect(cx - visW / 2, visY, visW, visH);
    ctx.shadowBlur = 0;
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 * @param {number} tAnim
 * @param {Record<string, number | boolean | number[]>} params
 */
function _dessinerHaloVera(ctx, cx, cy, s, tAnim, params) {
    const lueur = /** @type {number} */ (params.lueurRose ?? 1);
    const couleur = lueur > 1.05 ? PALETTE_VERA.HALO_DOUX : PALETTE_VERA.HALO;
    let arcSpan = Math.PI * 1.67;
    if (params.sourcils === true) arcSpan = Math.PI * 1.22;
    if (params.visiereLumineuse === true) arcSpan = Math.PI * 2;

    const rotation = tAnim * /** @type {number} */ (params.fragmentVitesse ?? 0.6) * 0.4;
    const blink = params.glitchBandes ? 0.35 + 0.65 * Math.abs(Math.sin(tAnim * 12)) : 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.strokeStyle = couleur;
    ctx.lineWidth = (params.visiereLumineuse ? 1.8 : 2.5) * s;
    ctx.globalAlpha = 0.62 * lueur * blink;
    ctx.shadowColor = couleur;
    ctx.shadowBlur = 8 * s * lueur;
    ctx.beginPath();
    ctx.arc(0, 0, 38 * s, -arcSpan / 2, arcSpan / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 * @param {number} tAnim
 * @param {Record<string, number | boolean | number[]>} params
 */
function _dessinerParticulesVera(ctx, cx, cy, s, tAnim, params) {
    const fv = /** @type {number} */ (params.fragmentVitesse ?? 0.6);
    const fr = /** @type {number} */ (params.fragmentRayon ?? 1);
    const erratic = params.sourcils === true;
    const count = 8;

    for (let i = 0; i < count; i++) {
        const seed = seedFraction(i + 3);
        const angle =
            (i / count) * Math.PI * 2 + tAnim * fv * (erratic ? 1.8 : 0.9) + seed * Math.PI * 0.4;
        const r = (36 + Math.sin(tAnim * 2 * fv + i * 1.3) * 6) * fr * s;
        const jitter = erratic ? Math.sin(tAnim * 7 + i * 2.3) * 4 * s : 0;
        ctx.globalAlpha = 0.2 + 0.35 * Math.sin(tAnim * 2 + i * 1.1);
        ctx.fillStyle = PALETTE_VERA.HALO;
        ctx.beginPath();
        ctx.arc(
            cx + Math.cos(angle) * r + jitter,
            cy + Math.sin(angle) * r,
            1.8 * s,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} s
 * @param {number} cx
 * @param {Record<string, number | boolean | number[]>} params
 */
function _dessinerExpressionVera(ctx, w, h, s, cx, params) {
    const sourcils = params.sourcils === true;
    const douce =
        !sourcils &&
        !params.visiereLumineuse &&
        /** @type {number} */ (params.inclinaison ?? 0) > 0.04;
    const determinee = params.visiereLumineuse === true;
    const boucheY = h * 0.8;

    ctx.strokeStyle = PALETTE_VERA.CHEVEUX;
    ctx.lineWidth = 1.4 * s;
    ctx.lineCap = 'round';

    if (douce) {
        ctx.strokeStyle = PALETTE_VERA.SOURCILS;
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, h * 0.27);
        ctx.quadraticCurveTo(cx - 10 * s, h * 0.265, cx - 6 * s, h * 0.27);
        ctx.moveTo(cx + 6 * s, h * 0.27);
        ctx.quadraticCurveTo(cx + 10 * s, h * 0.265, cx + 18 * s, h * 0.27);
        ctx.stroke();
        ctx.strokeStyle = PALETTE_VERA.SOURCILS;
        ctx.lineWidth = 1.1 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, h * 0.33);
        ctx.lineTo(cx - 4 * s, h * 0.335);
        ctx.moveTo(cx + 4 * s, h * 0.335);
        ctx.lineTo(cx + 10 * s, h * 0.33);
        ctx.stroke();
    } else if (sourcils) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, h * 0.26);
        ctx.lineTo(cx - 8 * s, h * 0.275);
        ctx.moveTo(cx + 8 * s, h * 0.275);
        ctx.lineTo(cx + 18 * s, h * 0.26);
        ctx.stroke();
    } else if (determinee) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, h * 0.27);
        ctx.lineTo(cx - 8 * s, h * 0.27);
        ctx.moveTo(cx + 8 * s, h * 0.27);
        ctx.lineTo(cx + 18 * s, h * 0.27);
        ctx.stroke();
    }

    ctx.strokeStyle = PALETTE_VERA.LEVRES;
    ctx.lineWidth = 1.3 * s;
    if (douce) {
        ctx.beginPath();
        ctx.arc(cx, boucheY, 7 * s, 0.12 * Math.PI, 0.88 * Math.PI);
        ctx.stroke();
    } else if (sourcils) {
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, boucheY);
        ctx.lineTo(cx + 5 * s, boucheY);
        ctx.stroke();
    } else if (determinee) {
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, boucheY + 2 * s);
        ctx.lineTo(cx + 6 * s, boucheY + 2 * s);
        ctx.stroke();
    }

    if (params.glitchBandes === true) {
        ctx.fillStyle = 'rgba(127,212,240,0.12)';
        for (let sy = h * 0.22; sy < h * 0.42; sy += 3 * s) {
            ctx.fillRect(cx - 32 * s, sy, 64 * s, 1 * s);
        }
    }

    void w;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
function _dessinerFallbackVera(ctx, w, h) {
    const cx = w * 0.5;
    const s = w / 180;

    ctx.fillStyle = PALETTE_VERA.COMBINAISON;
    ctx.beginPath();
    ctx.moveTo(cx - 44 * s, h * 0.92);
    ctx.quadraticCurveTo(cx - 50 * s, h * 0.58, cx - 30 * s, h * 0.5);
    ctx.lineTo(cx + 30 * s, h * 0.5);
    ctx.quadraticCurveTo(cx + 50 * s, h * 0.58, cx + 44 * s, h * 0.92);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PALETTE_VERA.PEAU;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.38, 22 * s, 26 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE_VERA.CASQUE;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.3, 28 * s, 18 * s, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = PALETTE_VERA.VISIERE;
    ctx.fillRect(cx - 30 * s, h * 0.24, 60 * s, 14 * s);

    ctx.fillStyle = PALETTE_VERA.ECRUTEURS;
    ctx.beginPath();
    ctx.ellipse(cx - 34 * s, h * 0.36, 6 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34 * s, h * 0.36, 6 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} t
 * @param {Record<string, number | boolean | number[]> | null | undefined} params
 */
export function dessinerPortraitVeraCanon(ctx, w, h, t, params) {
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t;
    const cx = w * 0.5;
    const cy = h * 0.36;
    const s = w / 180;
    const glitch = p.glitchBandes === true;
    const inclinaison = /** @type {number} */ (p.inclinaison ?? 0);
    const img = obtenirImagePortraitVera();

    ctx.clearRect(0, 0, w, h);

    if (img) {
        const teinte =
            p.visiereLumineuse === true
                ? 'cyan'
                : /** @type {number} */ (p.lueurRose ?? 1) > 1.05
                  ? 'rose'
                  : null;
        if (glitch) {
            _dessinerSpriteVera(ctx, w, h, img, { desature: true, alpha: 1 });
            if (!effetsReduits) {
                _appliquerBandesGlitch(
                    ctx,
                    w,
                    h,
                    img,
                    tAnim,
                    /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0])
                );
            } else {
                _appliquerBandesGlitch(
                    ctx,
                    w,
                    h,
                    img,
                    0,
                    /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0])
                );
            }
        } else {
            _dessinerSpriteVera(ctx, w, h, img, { teinte, alpha: 1 });
        }
    } else {
        _dessinerFallbackVera(ctx, w, h);
    }

    ctx.save();
    if (inclinaison) {
        ctx.translate(cx, cy);
        ctx.rotate(inclinaison);
        ctx.translate(-cx, -cy);
    }

    _dessinerHaloVera(ctx, cx, cy * 0.95, s, tAnim, p);
    _dessinerParticulesVera(ctx, cx, cy, s, tAnim, p);
    if (img) _dessinerOverlayVisiere(ctx, w, h, s, p);
    _dessinerExpressionVera(ctx, w, h, s, cx, p);

    if (/** @type {number} */ (p.scanline ?? 1) > 1.2 && glitch) {
        ctx.fillStyle = 'rgba(127,212,240,0.12)';
        for (let sy = h * 0.22; sy < h * 0.42; sy += 3 * s) {
            ctx.fillRect(cx - 32 * s, sy, 64 * s, 1 * s);
        }
    }

    ctx.restore();
}

export function viderCachePortraitVera() {
    /* compat tests — sprite unique, pas de cache canvas */
}
