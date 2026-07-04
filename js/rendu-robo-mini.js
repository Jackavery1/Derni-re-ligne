import { PALETTE_ROBO, PROPORTIONS_ROBO as P } from './rendu-robo-donnees.js';

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
 * Sprite ROBO v3 pour la carte histoire (capsule + glyphes cyan).
 * @param {CanvasRenderingContext2D} ctx
 */
export function dessinerRoboMiniature(ctx, x, y, timestamp) {
    const C = PALETTE_ROBO;
    const bounce = Math.sin(timestamp / 380) * 2.5;
    const E = 0.55;
    const cx = Math.round(x);
    const baseY = Math.round(y + bounce);
    const capW = P.CAPSULE_W * E;
    const capH = P.CAPSULE_H * E;
    const capX = cx - capW / 2;
    const capY = baseY - capH + 4;

    ctx.save();

    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(timestamp / 520);
    ctx.fillStyle = 'rgba(0, 245, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 2, 12 * E, 3.5 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = C.COQUE_OMBRE;
    _rectArrondi(ctx, capX + 0.8, capY + 1.2, capW, capH, capW * 0.38);
    ctx.fill();
    ctx.fillStyle = C.COQUE;
    _rectArrondi(ctx, capX, capY, capW, capH, capW * 0.38);
    ctx.fill();

    const inset = capW * P.ECRAN_INSET;
    const eh = capH * P.ECRAN_RATIO - inset;
    const ex = capX + inset;
    const ey = capY + inset;
    ctx.fillStyle = C.ECRAN;
    _rectArrondi(ctx, ex, ey, capW - inset * 2, eh, (capW - inset * 2) * 0.22);
    ctx.fill();

    const eyeY = ey + eh * 0.42;
    ctx.fillStyle = C.GLYPHE;
    for (const ox of [-4.5 * E, 4.5 * E]) {
        ctx.beginPath();
        ctx.arc(cx + ox, eyeY, 2.8 * E, 0, Math.PI * 2);
        ctx.fill();
    }

    const fw = capW * P.FENETRE_W_RATIO;
    const fh = P.FENETRE_H * E * 0.85;
    const fx = cx - fw / 2;
    const fy = capY + capH - fh - 3 * E;
    ctx.fillStyle = C.ECRAN;
    _rectArrondi(ctx, fx, fy, fw, fh, 2 * E);
    ctx.fill();
    let idx = 0;
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            ctx.fillStyle = idx === 5 ? C.GRILLE_ETEINTE : C.GRILLE_CELLULE;
            ctx.fillRect(
                fx + 1.5 + col * (fw / 3),
                fy + 1.5 + row * (fh / 2),
                fw / 3 - 2,
                fh / 2 - 2
            );
            idx++;
        }
    }

    const alphaBlink = 0.55 + 0.45 * Math.sin(timestamp / 700);
    ctx.globalAlpha = alphaBlink;
    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, capY + 1);
    ctx.lineTo(cx, capY - 5 * E);
    ctx.stroke();
    ctx.fillStyle = C.GLYPHE;
    ctx.beginPath();
    ctx.arc(cx, capY - 6 * E, 2 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
}
