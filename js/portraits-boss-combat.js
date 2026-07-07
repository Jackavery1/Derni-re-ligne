import { dessinerPortraitDistorsion } from './rendu/portrait-distorsion-rendu.js';
import { dessinerPortraitBrasierCanon } from './rendu/portrait-brasier-rendu.js';
import { dessinerPortraitSentinelleCanon } from './rendu/portrait-sentinelle-rendu.js';
import { dessinerPortraitArchivisteCanon } from './rendu/portrait-archiviste-rendu.js';
import { dessinerPortraitAvantgardeCanon } from './rendu/portrait-avantgarde-rendu.js';

function _portraitNarrateur(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < 4; i++) {
        const r = 15 + i * 10 + Math.sin(t * 0.8 + i * 0.5) * 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.04 - i * 0.007})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + t * 0.2;
        const r = 38;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.2 * Math.sin(t + i)})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.15);
    ctx.globalAlpha = 0.55 + 0.3 * Math.sin(t * 1.2);
    ctx.fillStyle = '#fff';
    ctx.font = '32px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 16;
    ctx.fillText('✦', 0, 0);
    ctx.restore();
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitBrasier(ctx, w, h, t, defaite = false, params) {
    const p = { ...(params ?? {}), vacillant: params?.vacillant === true || defaite };
    dessinerPortraitBrasierCanon(ctx, w, h, t, p);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitSentinelle(ctx, w, h, t, defaite = false, params) {
    const p = { ...(params ?? {}), vacillant: params?.vacillant === true || defaite };
    dessinerPortraitSentinelleCanon(ctx, w, h, t, p);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitArchiviste(ctx, w, h, t, params) {
    dessinerPortraitArchivisteCanon(ctx, w, h, t, params);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitAvantgarde(ctx, w, h, t, params) {
    dessinerPortraitAvantgardeCanon(ctx, w, h, t, params);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} bossId
 * @param {number} t
 * @param {{ vacillant?: boolean, intensite?: number, vitesseAnim?: number, echelle?: number, effetsReduits?: boolean }} [options]
 */
export function dessinerPortraitBossCombat(ctx, w, h, bossId, t, options = {}) {
    const params = {
        vacillant: options.vacillant === true,
        vitesseAnim: options.vitesseAnim ?? 1,
        glow: options.intensite ?? 1,
        echelle: options.echelle ?? 1,
        effetsReduits: options.effetsReduits === true,
    };
    const defaite = params.vacillant;

    switch (bossId) {
        case 'brasier':
            _portraitBrasier(ctx, w, h, t, defaite, params);
            break;
        case 'sentinelle':
            _portraitSentinelle(ctx, w, h, t, defaite, params);
            break;
        case 'archiviste':
            _portraitArchiviste(ctx, w, h, t, params);
            break;
        case 'avantgarde':
            _portraitAvantgarde(ctx, w, h, t, params);
            break;
        case 'distorsion':
            dessinerPortraitDistorsion(ctx, w, h, t, params);
            break;
        default:
            _portraitNarrateur(ctx, w, h, t);
            break;
    }
}
