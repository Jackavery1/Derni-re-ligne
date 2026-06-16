import { seedFraction } from './portrait-rendu-utils.js';

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
 * @param {number} s
 * @param {Record<string, number | boolean | number[]>} params
 */
function _dessinerBusteVeraCanon(ctx, w, h, s, params) {
    const cx = w * 0.5;
    const P = PALETTE_VERA;
    const douce =
        !params.sourcils &&
        !params.visiereLumineuse &&
        /** @type {number} */ (params.inclinaison ?? 0) > 0.04;

    ctx.fillStyle = P.COMBINAISON;
    ctx.beginPath();
    ctx.moveTo(cx - 52 * s, h * 0.94);
    ctx.quadraticCurveTo(cx - 58 * s, h * 0.62, cx - 38 * s, h * 0.54);
    ctx.lineTo(cx - 14 * s, h * 0.5);
    ctx.lineTo(cx - 10 * s, h * 0.44);
    ctx.quadraticCurveTo(cx - 8 * s, h * 0.4, cx, h * 0.4);
    ctx.quadraticCurveTo(cx + 8 * s, h * 0.4, cx + 10 * s, h * 0.44);
    ctx.lineTo(cx + 14 * s, h * 0.5);
    ctx.lineTo(cx + 38 * s, h * 0.54);
    ctx.quadraticCurveTo(cx + 58 * s, h * 0.62, cx + 52 * s, h * 0.94);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = P.LISERES;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 40 * s, h * 0.56);
    ctx.quadraticCurveTo(cx - 20 * s, h * 0.5, cx - 8 * s, h * 0.44);
    ctx.moveTo(cx + 40 * s, h * 0.56);
    ctx.quadraticCurveTo(cx + 20 * s, h * 0.5, cx + 8 * s, h * 0.44);
    ctx.stroke();

    ctx.fillStyle = P.COMBINAISON_OMBRE;
    ctx.fillRect(cx - 3 * s, h * 0.44, 6 * s, h * 0.12);
    ctx.fillStyle = '#8a98ac';
    for (let z = h * 0.46; z < h * 0.54; z += 5 * s) {
        ctx.fillRect(cx - 2 * s, z, 4 * s, 2 * s);
    }

    ctx.fillStyle = P.PEAU;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.39, 20 * s, 24 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.PEAU_OMBRE;
    ctx.fillRect(cx - 2 * s, h * 0.36, 4 * s, 5 * s);

    ctx.fillStyle = P.CASQUE;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.3, 30 * s, 20 * s, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d4ecf8';
    ctx.beginPath();
    ctx.ellipse(cx - 8 * s, h * 0.27, 10 * s, 6 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();

    const visGrad = ctx.createLinearGradient(cx - 32 * s, h * 0.24, cx + 32 * s, h * 0.36);
    visGrad.addColorStop(0, P.VISIERE_SOMBRE);
    visGrad.addColorStop(0.35, P.VISIERE);
    visGrad.addColorStop(0.55, P.VISIERE_REFLET);
    visGrad.addColorStop(1, P.VISIERE_SOMBRE);
    ctx.fillStyle = visGrad;
    ctx.globalAlpha = 0.88;
    ctx.fillRect(cx - 32 * s, h * 0.245, 64 * s, 16 * s);
    ctx.globalAlpha = 1;

    ctx.fillStyle = P.ECRUTEURS;
    ctx.beginPath();
    ctx.ellipse(cx - 36 * s, h * 0.37, 7 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 36 * s, h * 0.37, 7 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = P.YEUX;
    ctx.beginPath();
    ctx.ellipse(cx - 12 * s, h * 0.34, 5 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12 * s, h * 0.34, 5 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.YEUX_REFLET;
    ctx.beginPath();
    ctx.arc(cx - 13 * s, h * 0.335, 1.4 * s, 0, Math.PI * 2);
    ctx.arc(cx + 11 * s, h * 0.335, 1.4 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = P.SOURCILS;
    ctx.lineWidth = 1.3 * s;
    ctx.lineCap = 'round';
    if (params.sourcils) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, h * 0.305);
        ctx.lineTo(cx - 8 * s, h * 0.318);
        ctx.moveTo(cx + 8 * s, h * 0.318);
        ctx.lineTo(cx + 18 * s, h * 0.305);
        ctx.stroke();
    } else if (params.visiereLumineuse) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, h * 0.31);
        ctx.lineTo(cx - 8 * s, h * 0.31);
        ctx.moveTo(cx + 8 * s, h * 0.31);
        ctx.lineTo(cx + 18 * s, h * 0.31);
        ctx.stroke();
    } else if (douce) {
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, h * 0.308);
        ctx.quadraticCurveTo(cx - 10 * s, h * 0.302, cx - 6 * s, h * 0.308);
        ctx.moveTo(cx + 6 * s, h * 0.308);
        ctx.quadraticCurveTo(cx + 10 * s, h * 0.302, cx + 18 * s, h * 0.308);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(cx - 17 * s, h * 0.31);
        ctx.lineTo(cx - 7 * s, h * 0.312);
        ctx.moveTo(cx + 7 * s, h * 0.312);
        ctx.lineTo(cx + 17 * s, h * 0.31);
        ctx.stroke();
    }

    ctx.strokeStyle = P.LEVRES;
    ctx.lineWidth = 1.2 * s;
    const boucheY = h * 0.43;
    if (douce) {
        ctx.beginPath();
        ctx.arc(cx, boucheY, 6 * s, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (params.sourcils) {
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, boucheY);
        ctx.lineTo(cx + 5 * s, boucheY);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, boucheY + 1 * s);
        ctx.lineTo(cx + 6 * s, boucheY + 1 * s);
        ctx.stroke();
    }

    ctx.fillStyle = P.CHEVEUX;
    ctx.beginPath();
    ctx.ellipse(cx - 24 * s, h * 0.34, 8 * s, 14 * s, 0.25, 0, Math.PI * 2);
    ctx.ellipse(cx + 24 * s, h * 0.34, 8 * s, 14 * s, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.CHEVEUX_REFLET;
    ctx.fillRect(cx - 26 * s, h * 0.3, 4 * s, 8 * s);
    ctx.fillRect(cx + 22 * s, h * 0.3, 4 * s, 8 * s);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} tAnim
 * @param {number[]} decalages
 */
function _appliquerBandesGlitchProcedural(ctx, w, h, tAnim, decalages) {
    if (typeof ctx.getImageData !== 'function') return;
    const data = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const cy = Math.floor(h * 0.38);
    const hBande = Math.max(10, Math.floor(h * 0.1));
    const bandes = 3;

    for (let y = 0; y < h; y++) {
        let offset = 0;
        for (let bi = 0; bi < bandes; bi++) {
            const y0 = cy - Math.floor(h * 0.16) + bi * (hBande + 4);
            if (y >= y0 && y < y0 + hBande) {
                offset =
                    Math.round(decalages[bi] ?? 0) + Math.round(Math.sin(tAnim * 6 + bi * 1.7) * 3);
                break;
            }
        }
        for (let x = 0; x < w; x++) {
            const sx = Math.min(w - 1, Math.max(0, x - offset));
            const si = (y * w + sx) * 4;
            const di = (y * w + x) * 4;
            out.data[di] = data.data[si];
            out.data[di + 1] = data.data[si + 1];
            out.data[di + 2] = data.data[si + 2];
            out.data[di + 3] = data.data[si + 3];
        }
    }
    ctx.putImageData(out, 0, 0);
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

    if (glitch && !effetsReduits) {
        ctx.save();
        ctx.filter = 'saturate(0.35) brightness(0.88)';
        _dessinerBusteVeraCanon(ctx, w, h, s, p);
        ctx.restore();
        _appliquerBandesGlitchProcedural(
            ctx,
            w,
            h,
            tAnim,
            /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0])
        );
    } else {
        _dessinerBusteVeraCanon(ctx, w, h, s, p);
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
        for (let sy = h * 0.22; sy < h * 0.42; sy += 3 * s) {
            ctx.fillRect(cx - 32 * s, sy, 64 * s, 1 * s);
        }
    }

    ctx.restore();
}

export function viderCachePortraitVera() {
    /* compat tests — sprite unique, pas de cache canvas */
}
