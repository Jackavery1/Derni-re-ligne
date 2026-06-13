import { PALETTE_ROBO } from './rendu-robo-donnees.js';

/**
 * Sprite ROBO simplifié pour la carte histoire (palette canon partagée).
 * @param {CanvasRenderingContext2D} ctx
 */
export function dessinerRoboMiniature(ctx, x, y, timestamp) {
    const C = PALETTE_ROBO;
    const bounce = Math.sin(timestamp / 380) * 2.5;
    const rx = Math.round(x - 8);
    const ry = Math.round(y - 14 + bounce);

    ctx.save();
    ctx.fillStyle = C.CARTE_FOND;
    ctx.strokeStyle = C.CARTE_NEON;
    ctx.lineWidth = 1;

    ctx.fillRect(rx + 2, ry, 12, 9);
    ctx.strokeRect(rx + 2, ry, 12, 9);
    ctx.fillRect(rx + 3, ry + 9, 10, 5);
    ctx.strokeRect(rx + 3, ry + 9, 10, 5);
    ctx.fillStyle = C.CARTE_NEON;
    ctx.fillRect(rx + 4, ry + 2, 3, 3);
    ctx.fillRect(rx + 9, ry + 2, 3, 3);
    const alphaBlink = 0.6 + 0.4 * Math.sin(timestamp / 700);
    ctx.globalAlpha = alphaBlink;
    ctx.fillStyle = C.CARTE_LED;
    ctx.fillRect(rx + 7, ry - 3, 2, 2);
    ctx.globalAlpha = 1;

    ctx.restore();
}
