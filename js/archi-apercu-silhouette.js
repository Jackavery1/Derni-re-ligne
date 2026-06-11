/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} silhouette
 * @param {string} couleur
 * @param {{ tailleCelluleMax?: number }} [options]
 */
export function dessinerSilhouetteApercu(canvas, ctx, silhouette, couleur, options = {}) {
    const lignes = silhouette.length;
    const colonnes = Math.max(0, ...silhouette.map((l) => l.length));
    if (!lignes || !colonnes) return;

    const marge = 4;
    const tailleMax = options.tailleCelluleMax ?? 8;
    const cell = Math.max(
        2,
        Math.min(
            tailleMax,
            Math.floor((canvas.width - marge * 2) / colonnes),
            Math.floor((canvas.height - marge * 2) / lignes)
        )
    );
    const largeur = colonnes * cell;
    const hauteur = lignes * cell;
    const ox = (canvas.width - largeur) / 2;
    const oy = (canvas.height - hauteur) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let ly = 0; ly < lignes; ly++) {
        const ligne = silhouette[ly] ?? '';
        for (let lx = 0; lx < ligne.length; lx++) {
            if (ligne[lx] !== '#') continue;
            ctx.fillStyle = couleur;
            ctx.fillRect(ox + lx * cell, oy + ly * cell, cell - 1, cell - 1);
        }
    }
}
