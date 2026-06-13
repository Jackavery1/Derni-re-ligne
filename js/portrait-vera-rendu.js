import { rectArrondiPortrait } from './portraits-cutscene-utils.js';
import { obtenirCoucheStatique, seedFraction } from './portrait-rendu-utils.js';

export const PALETTE_VERA = {
    COMBINAISON: '#e8edf5',
    COMBINAISON_OMBRE: '#b8c4d6',
    LISERES: '#3da8e0',
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

/** @type {Map<string, OffscreenCanvas | HTMLCanvasElement>} */
const _cacheStatique = new Map();

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {typeof PALETTE_VERA} palette
 * @param {number} s
 * @param {'g'|'d'} cote
 */
function _dessinerTresse(ctx, x, y, palette, s, cote) {
    const dir = cote === 'g' ? -1 : 1;
    ctx.strokeStyle = palette.CHEVEUX;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dir * 8 * s, y + 18 * s, x + dir * 4 * s, y + 42 * s);
    ctx.quadraticCurveTo(x + dir * 2 * s, y + 58 * s, x + dir * 10 * s, y + 72 * s);
    ctx.stroke();
    ctx.strokeStyle = palette.CHEVEUX_REFLET;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(x + dir * 1 * s, y + 4 * s);
    ctx.quadraticCurveTo(x + dir * 6 * s, y + 24 * s, x + dir * 3 * s, y + 48 * s);
    ctx.stroke();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {boolean} desature
 */
function _dessinerCoucheStatiqueVera(ctx, w, h, desature) {
    const palette = desature ? PALETTE_VERA_DESAT : PALETTE_VERA;
    const cx = w * 0.5;
    const s = w / 180;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = palette.COMBINAISON;
    rectArrondiPortrait(ctx, cx - 42 * s, 108 * s, 84 * s, 128 * s, 8 * s);
    ctx.fill();

    ctx.fillStyle = palette.COMBINAISON_OMBRE;
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, 112 * s);
    ctx.lineTo(cx + 8 * s, 112 * s);
    ctx.lineTo(cx + 14 * s, 230 * s);
    ctx.lineTo(cx - 14 * s, 230 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.LISERES;
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(cx - 36 * s + i * 7 * s, 114 * s, 2.5 * s, 68 * s);
        ctx.fillRect(cx + 22 * s + i * 7 * s, 114 * s, 2.5 * s, 68 * s);
    }

    ctx.fillStyle = palette.COMBINAISON;
    rectArrondiPortrait(ctx, cx - 28 * s, 102 * s, 56 * s, 18 * s, 6 * s);
    ctx.fill();
    ctx.strokeStyle = palette.LISERES;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 24 * s, 110 * s);
    ctx.lineTo(cx + 24 * s, 110 * s);
    ctx.stroke();

    ctx.fillStyle = palette.PEAU;
    rectArrondiPortrait(ctx, cx - 11 * s, 96 * s, 22 * s, 20 * s, 4 * s);
    ctx.fill();

    ctx.fillStyle = palette.PEAU;
    ctx.beginPath();
    ctx.ellipse(cx, 92 * s, 21 * s, 25 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.PEAU_OMBRE;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(cx - 14 * s, 96 * s, 6 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 14 * s, 96 * s, 6 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    _dessinerTresse(ctx, cx - 30 * s, 70 * s, palette, s, 'g');
    _dessinerTresse(ctx, cx + 30 * s, 70 * s, palette, s, 'd');

    ctx.save();
    ctx.globalAlpha = desature ? 0.5 : 0.72;
    const gradVis = ctx.createLinearGradient(cx - 28 * s, 56 * s, cx + 18 * s, 90 * s);
    gradVis.addColorStop(0, palette.VISIERE_REFLET);
    gradVis.addColorStop(0.45, palette.VISIERE);
    gradVis.addColorStop(1, palette.VISIERE_SOMBRE);
    ctx.fillStyle = gradVis;
    rectArrondiPortrait(ctx, cx - 32 * s, 58 * s, 64 * s, 32 * s, 10 * s);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = palette.MONTURE;
    ctx.lineWidth = 1.5 * s;
    rectArrondiPortrait(ctx, cx - 32 * s, 58 * s, 64 * s, 32 * s, 10 * s);
    ctx.stroke();
    ctx.strokeStyle = palette.VISIERE_REFLET;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 22 * s, 60 * s);
    ctx.lineTo(cx + 8 * s, 84 * s);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = palette.YEUX;
    ctx.beginPath();
    ctx.arc(cx - 11 * s, 74 * s, 3.8 * s, 0, Math.PI * 2);
    ctx.arc(cx + 11 * s, 74 * s, 3.8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.YEUX_REFLET;
    ctx.fillRect(cx - 13 * s, 72 * s, 2 * s, 2 * s);
    ctx.fillRect(cx + 9 * s, 72 * s, 2 * s, 2 * s);
}

/**
 * @param {number} w
 * @param {number} h
 * @param {boolean} desature
 */
function _obtenirCoucheStatique(w, h, desature) {
    const cle = `${w}x${h}-${desature ? 'd' : 'n'}`;
    return obtenirCoucheStatique(_cacheStatique, cle, w, h, (ctx, width, height) =>
        _dessinerCoucheStatiqueVera(ctx, width, height, desature)
    );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {OffscreenCanvas | HTMLCanvasElement} source
 * @param {number} tAnim
 * @param {number[]} decalages
 */
function _appliquerBandesGlitch(ctx, w, h, source, tAnim, decalages) {
    const cy = h * 0.38;
    const hBande = 22;
    const bandes = 3;

    for (let bi = 0; bi < bandes; bi++) {
        const y0 = cy - 34 + bi * 26;
        const offset =
            (decalages[bi] ?? 0) + Math.sin(tAnim * 6 + bi * 1.7 + seedFraction(bi) * 6) * 3;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y0, w, hBande);
        ctx.clip();
        ctx.drawImage(source, offset, 0, w, h, 0, 0, w, h);
        ctx.restore();
    }
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

    ctx.strokeStyle = PALETTE_VERA.CHEVEUX;
    ctx.lineWidth = 1.4 * s;
    ctx.lineCap = 'round';

    if (sourcils) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, 64 * s);
        ctx.lineTo(cx - 8 * s, 67 * s);
        ctx.moveTo(cx + 8 * s, 67 * s);
        ctx.lineTo(cx + 18 * s, 64 * s);
        ctx.stroke();
    } else if (determinee) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, 66 * s);
        ctx.lineTo(cx - 8 * s, 66 * s);
        ctx.moveTo(cx + 8 * s, 66 * s);
        ctx.lineTo(cx + 18 * s, 66 * s);
        ctx.stroke();
    }

    if (douce) {
        ctx.fillStyle = PALETTE_VERA.PEAU;
        ctx.globalAlpha = 0.78;
        ctx.fillRect(cx - 16 * s, 68 * s, 14 * s, 5 * s);
        ctx.fillRect(cx + 2 * s, 68 * s, 14 * s, 5 * s);
        ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = PALETTE_VERA.PEAU_OMBRE;
    ctx.lineWidth = 1.3 * s;
    if (douce) {
        ctx.beginPath();
        ctx.arc(cx, 88 * s, 6 * s, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (sourcils) {
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, 90 * s);
        ctx.lineTo(cx + 5 * s, 90 * s);
        ctx.stroke();
    } else if (determinee) {
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, 91 * s);
        ctx.lineTo(cx + 6 * s, 91 * s);
        ctx.stroke();
    }

    if (determinee) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = PALETTE_VERA.VISIERE_REFLET;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cx, 74 * s, 30 * s, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
    }

    void w;
    void h;
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

    ctx.clearRect(0, 0, w, h);

    const staticNormal = _obtenirCoucheStatique(w, h, false);
    const staticDesat = glitch ? _obtenirCoucheStatique(w, h, true) : null;

    if (staticNormal) {
        if (glitch && staticDesat) {
            ctx.drawImage(staticDesat, 0, 0);
            if (!effetsReduits) {
                _appliquerBandesGlitch(
                    ctx,
                    w,
                    h,
                    staticNormal,
                    tAnim,
                    /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0])
                );
            } else {
                _appliquerBandesGlitch(
                    ctx,
                    w,
                    h,
                    staticNormal,
                    0,
                    /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0])
                );
            }
        } else {
            ctx.drawImage(staticNormal, 0, 0);
        }
    } else {
        _dessinerCoucheStatiqueVera(ctx, w, h, glitch);
    }

    ctx.save();
    if (inclinaison) {
        ctx.translate(cx, cy);
        ctx.rotate(inclinaison);
        ctx.translate(-cx, -cy);
    }

    _dessinerHaloVera(ctx, cx, cy * 0.95, s, tAnim, p);
    _dessinerParticulesVera(ctx, cx, cy, s, tAnim, p);
    _dessinerExpressionVera(ctx, w, h, s, cx, p);

    if (/** @type {number} */ (p.scanline ?? 1) > 1.2 && glitch) {
        ctx.fillStyle = 'rgba(127,212,240,0.12)';
        for (let sy = 58 * s; sy < 92 * s; sy += 3 * s) {
            ctx.fillRect(cx - 32 * s, sy, 64 * s, 1 * s);
        }
    }

    ctx.restore();
}

export function viderCachePortraitVera() {
    _cacheStatique.clear();
}
