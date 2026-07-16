/** Utilitaires canvas portraits cutscene. */
export function rectArrondiPortrait(ctx, x, y, largeur, hauteur, rayon) {
    const r = Math.min(rayon, largeur / 2, hauteur / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + largeur - r, y);
    ctx.quadraticCurveTo(x + largeur, y, x + largeur, y + r);
    ctx.lineTo(x + largeur, y + hauteur - r);
    ctx.quadraticCurveTo(x + largeur, y + hauteur, x + largeur - r, y + hauteur);
    ctx.lineTo(x + r, y + hauteur);
    ctx.quadraticCurveTo(x, y + hauteur, x, y + hauteur - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
