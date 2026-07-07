import { PALETTE_VERA } from './portrait-vera-donnees.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} s
 * @param {Record<string, number | boolean | number[]>} params
 */
export function dessinerBusteVeraCanon(ctx, w, h, s, params) {
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
