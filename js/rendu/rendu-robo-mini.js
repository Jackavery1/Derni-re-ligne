import { dessinerRobo } from './rendu-robo.js';

const REF_W = 120;
const REF_H = 150;

/**
 * Sprite ROBO v3 pour la carte histoire — délègue au pipeline central (niveau mini).
 * @param {CanvasRenderingContext2D} ctx
 */
export function dessinerRoboMiniature(ctx, x, y, timestamp) {
    const E = 0.55;
    const bounce = Math.sin(timestamp / 380) * 2.5;
    const w = Math.ceil(REF_W * E);
    const h = Math.ceil(REF_H * E);
    const piedY = y + bounce;

    ctx.save();

    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(timestamp / 520);
    ctx.fillStyle = 'rgba(0, 245, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, piedY + 2, 12 * E, 3.5 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.translate(x - w / 2, piedY - h + 6);
    dessinerRobo(ctx, w, h, 'neutre', 0, {
        fondTransparent: true,
        niveauDetail: 'mini',
        refletEcran: false,
    });

    ctx.restore();
}
