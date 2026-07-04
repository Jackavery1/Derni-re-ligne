/** Fond commun des illustrations de journaux VERA. */
// js/histoire-illustrations.js
// Illustrations canvas pour les journaux de VERA.
// Fonctions pures — aucune dependance vers le store ou la logique.

/**
 * Dessine un fond commun pour tous les journaux.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} couleurAccent
 */
export function fondJournal(ctx, w, h, couleurAccent) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);
    // Vignette
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Ligne de signal
    ctx.strokeStyle = couleurAccent + '22';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}
