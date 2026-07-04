/** Rendu image plein écran (Ken Burns) pour cutscenes. */
/**
 * @param {{ voile?: number, kenBurns?: string }} scene
 * @param {number} progress
 * @param {number} w
 * @param {number} _h
 */
function calculerKenBurns(scene, progress, w, _h) {
    const kb = scene.kenBurns ?? 'fixe';
    let scale = 1;
    let offsetX = 0;
    if (kb === 'zoom_lent') scale = 1 + 0.06 * progress;
    else if (kb === 'pan_gauche') offsetX = -0.03 * w * progress;
    else if (kb === 'pan_droite') offsetX = 0.03 * w * progress;
    return { scale, offsetX, offsetY: 0 };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {HTMLImageElement} img
 * @param {{ voile?: number, kenBurns?: string }} scene
 * @param {number} progress
 * @param {number} [alpha]
 */
export function dessinerImageScene(ctx, w, h, img, scene, progress, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    const { scale, offsetX } = calculerKenBurns(scene, progress, w, h);
    const iw = img.width;
    const ih = img.height;
    const coverScale = Math.max(w / iw, h / ih) * scale;
    const dw = iw * coverScale;
    const dh = ih * coverScale;
    const dx = (w - dw) / 2 + offsetX;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);

    const voile = scene.voile ?? 0.45;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `rgba(0,0,0,${voile * 0.25})`);
    grad.addColorStop(0.55, `rgba(0,0,0,${voile * 0.55})`);
    grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.95, voile * 1.1)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
}
