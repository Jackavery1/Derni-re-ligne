function couleurValide(hex) {
    return typeof hex === 'string' && hex.startsWith('#') && hex.length >= 7;
}

function assombrir(hex, facteur) {
    if (!couleurValide(hex)) hex = '#ffffff';
    const n = parseInt(hex.slice(1), 16);
    const r = Math.floor(((n >> 16) & 255) * facteur);
    const g = Math.floor(((n >> 8) & 255) * facteur);
    const b = Math.floor((n & 255) * facteur);
    return `rgb(${r},${g},${b})`;
}

function eclaircir(hex, facteur) {
    if (!couleurValide(hex)) hex = '#ffffff';
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.floor(((n >> 16) & 255) * facteur));
    const g = Math.min(255, Math.floor(((n >> 8) & 255) * facteur));
    const b = Math.min(255, Math.floor((n & 255) * facteur));
    return `rgb(${r},${g},${b})`;
}

function pseudoAleatoire(graine) {
    const x = Math.sin(graine * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function tracerRectArrondi(ctx2d, x, y, largeur, hauteur, rayon) {
    const r = Math.min(rayon, largeur / 2, hauteur / 2);
    ctx2d.beginPath();
    ctx2d.moveTo(x + r, y);
    ctx2d.lineTo(x + largeur - r, y);
    ctx2d.quadraticCurveTo(x + largeur, y, x + largeur, y + r);
    ctx2d.lineTo(x + largeur, y + hauteur - r);
    ctx2d.quadraticCurveTo(x + largeur, y + hauteur, x + largeur - r, y + hauteur);
    ctx2d.lineTo(x + r, y + hauteur);
    ctx2d.quadraticCurveTo(x, y + hauteur, x, y + hauteur - r);
    ctx2d.lineTo(x, y + r);
    ctx2d.quadraticCurveTo(x, y, x + r, y);
    ctx2d.closePath();
}

function coordsBloc(x, y, taille) {
    const px = x * taille;
    const py = y * taille;
    const b = Math.floor(taille * 0.17);
    const m = Math.max(1, Math.floor(taille * 0.06));
    return {
        px,
        py,
        b,
        m,
        cx: px + b,
        cy: py + b,
        cw: taille - b * 2,
        ch: taille - b * 2,
        centreX: px + taille / 2,
        centreY: py + taille / 2,
    };
}

function debutBloc(ctx2d, couleur, opacite, sansOmbre, shadowBlur) {
    ctx2d.save();
    ctx2d.globalAlpha = opacite;
    if (!sansOmbre) {
        ctx2d.shadowColor = couleur;
        ctx2d.shadowBlur = shadowBlur;
    }
}

function finBloc(ctx2d) {
    ctx2d.shadowBlur = 0;
    ctx2d.restore();
}

export {
    couleurValide,
    assombrir,
    eclaircir,
    pseudoAleatoire,
    tracerRectArrondi,
    coordsBloc,
    debutBloc,
    finBloc,
};
