/** Dessin des étoiles pixel / cercle — fond carte histoire. */

/** @param {CanvasRenderingContext2D} ctx @param {object} et @param {number} x @param {number} y @param {number} t */
export function dessinerEtoileFond(ctx, et, x, y, t) {
    if (et.type === 'cercle') {
        const scintil = 0.5 + 0.5 * Math.sin(t * et.vitesse * 60 + et.offset);
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(255,255,255,${(et.opaciteBase * scintil).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, et.rayon, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    const alpha = 0.4 + 0.5 * Math.abs(Math.sin(t * et.vitesse * 60 + et.offset));
    dessinerEtoilePixel(ctx, x, y, et.taille ?? 1, et.couleur ?? '#ffffff', alpha, et.type);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} taille @param {string} couleur @param {number} alpha @param {string} type */
function dessinerEtoilePixel(ctx, x, y, taille, couleur, alpha, type) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = couleur;

    if (type === 'point') {
        ctx.fillRect(x, y, 2, 2);
    } else if (type === 'plus') {
        const b = taille;
        ctx.fillRect(x - 1, y - 1, 2, 2);
        ctx.fillRect(x - b - 1, y - 1, b, 2);
        ctx.fillRect(x + 2, y - 1, b, 2);
        ctx.fillRect(x - 1, y - b - 1, 2, b);
        ctx.fillRect(x - 1, y + 2, 2, b);
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillRect(x - b - 2, y - 1, 1, 2);
        ctx.fillRect(x + b + 2, y - 1, 1, 2);
        ctx.fillRect(x - 1, y - b - 2, 2, 1);
        ctx.fillRect(x - 1, y + b + 2, 2, 1);
    } else if (type === 'croix') {
        const b = taille;
        ctx.fillRect(x - 1, y - 1, 2, 2);
        for (let i = 1; i <= b; i++) {
            ctx.fillRect(x - 1 - i, y - 1 - i, 2, 2);
            ctx.fillRect(x - 1 + i, y - 1 - i, 2, 2);
            ctx.fillRect(x - 1 - i, y - 1 + i, 2, 2);
            ctx.fillRect(x - 1 + i, y - 1 + i, 2, 2);
        }
    }

    ctx.globalAlpha = 1;
}
