export { prechargerPortraitVera } from './portrait-vera-assets.js';
export { PALETTE_VERA, PALETTE_VERA_DESAT } from './portrait-vera-donnees.js';

import { dessinerBusteVeraCanon } from './portrait-vera-buste.js';
import {
    dessinerHaloVera,
    dessinerParticulesVera,
    dessinerExpressionVera,
    appliquerBandesGlitchProcedural,
} from './portrait-vera-effets.js';

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
        dessinerBusteVeraCanon(ctx, w, h, s, p);
        ctx.restore();
        appliquerBandesGlitchProcedural(
            ctx,
            w,
            h,
            tAnim,
            /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0])
        );
    } else {
        dessinerBusteVeraCanon(ctx, w, h, s, p);
    }

    ctx.save();
    if (inclinaison) {
        ctx.translate(cx, cy);
        ctx.rotate(inclinaison);
        ctx.translate(-cx, -cy);
    }

    dessinerHaloVera(ctx, cx, cy * 0.95, s, tAnim, p);
    dessinerParticulesVera(ctx, cx, cy, s, tAnim, p);
    if (tAnim && !effetsReduits) {
        const y = h * 0.345 + Math.sin(tAnim * 2.8) * s;
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#a8d4f0';
        for (let g = -1; g < 2; g += 2) {
            ctx.beginPath();
            ctx.arc(cx + g * 11 * s, y + Math.sin(tAnim + g) * s, 2 * s, 0, 7);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    dessinerExpressionVera(ctx, w, h, s, cx, p);

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
