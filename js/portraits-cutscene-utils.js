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

export function interpolerCouleurPortrait(c1, c2, frac) {
    const p = (hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
    const a = p(c1);
    const b = p(c2);
    const m = a.map((v, i) => Math.round(v + (b[i] - v) * frac));
    return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
