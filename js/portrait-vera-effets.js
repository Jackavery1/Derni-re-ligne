import { seedFraction } from './portrait-rendu-utils.js';
import { PALETTE_VERA } from './portrait-vera-donnees.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 * @param {number} tAnim
 * @param {Record<string, number | boolean | number[]>} params
 */
export function dessinerHaloVera(ctx, cx, cy, s, tAnim, params) {
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
export function dessinerParticulesVera(ctx, cx, cy, s, tAnim, params) {
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
export function dessinerExpressionVera(ctx, w, h, s, cx, params) {
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
 * @param {number} tAnim
 * @param {number[]} decalages
 */
export function appliquerBandesGlitchProcedural(ctx, w, h, tAnim, decalages) {
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
