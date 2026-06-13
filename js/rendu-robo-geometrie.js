export function pxRobo(cx, refX, E) {
    return cx + (refX - 60) * E;
}

export function pyRobo(refY, E, offsetY, h) {
    return refY * E + offsetY + (h - 150 * E) / 2;
}

export function rectArrondiRobo(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
}

export function dessinerSegmentRessortRobo(ctx, x, y, w, h, couleur, E) {
    ctx.fillStyle = couleur;
    rectArrondiRobo(ctx, x, y, w, h, 2 * E);
    ctx.fill();
}
