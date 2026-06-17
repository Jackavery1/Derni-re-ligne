/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} t
 * @param {Record<string, number | boolean | number[]> | null | undefined} params
 */
export function dessinerPortraitDistorsion(ctx, w, h, t, params) {
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t;
    const vv = /** @type {number} */ (p.vortexVitesse ?? 1);
    const ab = /** @type {number} */ (p.aberrationChrom ?? 1);
    const yeuxRouge = p.yeuxViolet !== true;
    const yeuxViolet = p.yeuxViolet === true;
    const irr = /** @type {number} */ (p.vortexIrregulier ?? 0);
    const unOeil = p.unOeil === true;
    const paupiere = p.paupiere === true;
    const stables = p.fragmentsStables === true;

    const glitchChrom = ab > 0.5 && !effetsReduits && Math.sin(tAnim * 13) > 0.7;
    const glitchBandes = !effetsReduits && Math.sin(tAnim * 0.4) > 0.92 && ab > 0.8;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const dessinerNoyau = (decalX, couleurStroke) => {
        for (let i = 1; i <= 8; i++) {
            const alpha = 0.04 + 0.06 * Math.sin(tAnim * 2 * vv + i * 0.5);
            const wobble =
                irr > 0 ? Math.sin(tAnim * 5 + i) * irr * 4 : Math.sin(tAnim * 3 + i * 0.4);
            const radius = (4 * i + 3 * wobble) * (stables ? 1 : 1);
            ctx.strokeStyle = couleurStroke;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.arc(cx + decalX, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    };

    if (glitchChrom) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        dessinerNoyau(2 * ab, 'rgba(255,0,80,0.8)');
        dessinerNoyau(-2 * ab, 'rgba(0,255,255,0.8)');
        ctx.restore();
    } else {
        const coulNoyau = yeuxViolet ? 'rgba(180,0,255,0.9)' : 'rgba(180,0,255,1)';
        dessinerNoyau(0, coulNoyau);
    }

    const nbFragments = stables ? 8 : 12;
    for (let i = 0; i < nbFragments; i++) {
        const angle = (i / nbFragments) * Math.PI * 2 + tAnim * 1.3 * vv;
        const r = 28 + 6 * Math.sin(tAnim * 2 * vv + i * 0.8);
        const couleurs = ['#ff006e', '#b400ff', '#00ffcc'];
        ctx.globalAlpha = effetsReduits ? 0.2 : 0.15 + 0.15 * Math.sin(tAnim * 3 * vv + i * 1.1);
        ctx.fillStyle = yeuxViolet ? '#b400ff' : couleurs[i % 3];
        ctx.fillRect(cx + Math.cos(angle) * r - 2, cy + Math.sin(angle) * r - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + tAnim * 0.4 * vv;
        const longueur = 28 + 8 * Math.sin(tAnim * 2 * vv + i);
        ctx.strokeStyle = 'rgba(255,0,110,0.2)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * longueur, cy + Math.sin(angle) * longueur);
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(effetsReduits ? 0 : Math.sin(tAnim * 0.3) * 0.05);
    ctx.globalAlpha = effetsReduits ? 0.7 : 0.4 + 0.5 * Math.sin(tAnim * 1.5 * vv);
    ctx.fillStyle = yeuxViolet ? '#b400ff' : yeuxRouge ? '#ff006e' : '#b400ff';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = effetsReduits ? 12 : 16 + 12 * Math.sin(tAnim * 2);
    ctx.fillText(unOeil ? '◉' : '∞', 0, 0);
    if (paupiere && !effetsReduits) {
        ctx.fillStyle = '#000';
        ctx.fillRect(-14, -6, 28, 8);
    }
    ctx.restore();

    if (glitchBandes) {
        for (let b = 0; b < 6; b++) {
            const yBande = effetsReduits ? (b * 17) % h : ((b * 17 + tAnim * 40) % h) | 0;
            ctx.fillStyle = b % 2 === 0 ? 'rgba(0,255,255,0.2)' : 'rgba(255,0,110,0.2)';
            ctx.fillRect(0, yBande, w, 1 + (b % 2));
        }
    }
}
