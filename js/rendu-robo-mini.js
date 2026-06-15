import { PALETTE_ROBO } from './rendu-robo-donnees.js';

function _rectArrondi(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
}

/**
 * Sprite ROBO pour la carte histoire (palette canon, yeux expressifs, halo).
 * @param {CanvasRenderingContext2D} ctx
 */
export function dessinerRoboMiniature(ctx, x, y, timestamp) {
    const C = PALETTE_ROBO;
    const bounce = Math.sin(timestamp / 380) * 3;
    const E = 1.2;
    const cx = Math.round(x);
    const baseY = Math.round(y + bounce);

    const headW = 15 * E;
    const headH = 12 * E;
    const torsoW = 12 * E;
    const torsoH = 9 * E;
    const headX = cx - headW / 2;
    const headY = baseY - headH - torsoH + 3;

    ctx.save();

    const glowPulse = 0.3 + 0.25 * Math.sin(timestamp / 520);
    ctx.globalAlpha = glowPulse;
    ctx.fillStyle = 'rgba(0, 245, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 2, 15 * E, 4.5 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(0, 245, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 1, 13 * E, 3.5 * E, 0, 0, Math.PI * 2);
    ctx.stroke();

    const torsoX = cx - torsoW / 2;
    const torsoY = headY + headH - 1;
    const torsoGrad = ctx.createLinearGradient(torsoX, torsoY, torsoX, torsoY + torsoH);
    torsoGrad.addColorStop(0, C.TORSE_REF);
    torsoGrad.addColorStop(1, C.TORSE_OMB);
    ctx.fillStyle = torsoGrad;
    _rectArrondi(ctx, torsoX, torsoY, torsoW, torsoH, 2.5);
    ctx.fill();
    ctx.strokeStyle = C.CIRCUIT_CYAN;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(torsoX + 2, torsoY + 2, torsoW - 4, 2);

    const headGrad = ctx.createLinearGradient(headX, headY, headX, headY + headH);
    headGrad.addColorStop(0, C.TETE_REF);
    headGrad.addColorStop(0.45, C.TETE);
    headGrad.addColorStop(1, C.TETE_BAND);
    ctx.fillStyle = headGrad;
    _rectArrondi(ctx, headX, headY, headW, headH, 3.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 85, 110, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    const eyeY = headY + 4 * E;
    for (const ex of [headX + 3 * E, headX + headW - 7 * E]) {
        ctx.fillStyle = C.OEIL_CONTOUR;
        ctx.fillRect(ex - 0.5, eyeY - 0.5, 4.5 * E, 4 * E);
        ctx.fillStyle = C.SCLERE;
        ctx.fillRect(ex, eyeY, 4 * E, 3.5 * E);
        ctx.fillStyle = C.PUPILLE;
        ctx.fillRect(ex + 1.1 * E, eyeY + 0.9 * E, 2 * E, 2 * E);
        ctx.fillStyle = C.REFLET;
        ctx.fillRect(ex + 2.4 * E, eyeY + 0.6 * E, 1.2 * E, 1.2 * E);
    }

    ctx.strokeStyle = C.BOUCHE_NEON;
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, headY + headH - 2.5, 4.2 * E, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    const alphaBlink = 0.5 + 0.5 * Math.sin(timestamp / 700);
    ctx.globalAlpha = alphaBlink;
    ctx.strokeStyle = C.ANTENNE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, headY + 1);
    ctx.lineTo(cx, headY - 5.5 * E);
    ctx.stroke();
    ctx.fillStyle = C.LED;
    ctx.beginPath();
    ctx.arc(cx, headY - 6.5 * E, 2 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = C.LED;
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.restore();
}
