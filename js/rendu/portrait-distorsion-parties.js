const C_NOYAU_ALPHA_MIN = 0.14;
const C_NOYAU_ALPHA_AMP = 0.14;
const C_FRAGMENT_ALPHA_MIN = 0.38;
const C_FRAGMENT_ALPHA_AMP = 0.22;
const C_SYMBOLE_ALPHA_MIN = 0.82;
const C_SYMBOLE_ALPHA_AMP = 0.18;
const C_SYMBOLE_ALPHA_REDUIT = 0.88;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} tAnim
 * @param {number} vv
 * @param {number} irr
 * @param {boolean} stables
 * @param {string} couleurStroke
 * @param {number} [decalX]
 */
export function dessinerNoyauDistorsion(
    ctx,
    cx,
    cy,
    tAnim,
    vv,
    irr,
    stables,
    couleurStroke,
    decalX = 0
) {
    for (let i = 1; i <= 8; i++) {
        const alpha = C_NOYAU_ALPHA_MIN + C_NOYAU_ALPHA_AMP * Math.sin(tAnim * 2 * vv + i * 0.5);
        const wobble = irr > 0 ? Math.sin(tAnim * 5 + i) * irr * 4 : Math.sin(tAnim * 3 + i * 0.4);
        const radius = (4 * i + 3 * wobble) * (stables ? 1 : 1);
        ctx.strokeStyle = couleurStroke;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = i <= 3 ? 1.6 : 1.1;
        ctx.beginPath();
        ctx.arc(cx + decalX, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} tAnim
 * @param {number} vv
 * @param {boolean} effetsReduits
 * @param {boolean} stables
 * @param {boolean} yeuxViolet
 */
export function dessinerFragmentsDistorsion(
    ctx,
    cx,
    cy,
    tAnim,
    vv,
    effetsReduits,
    stables,
    yeuxViolet
) {
    const nbFragments = stables ? 8 : 12;
    const couleurs = ['#ff006e', '#b400ff', '#00ffcc'];
    for (let i = 0; i < nbFragments; i++) {
        const angle = (i / nbFragments) * Math.PI * 2 + tAnim * 1.3 * vv;
        const r = 28 + 6 * Math.sin(tAnim * 2 * vv + i * 0.8);
        ctx.globalAlpha = effetsReduits
            ? 0.45
            : C_FRAGMENT_ALPHA_MIN + C_FRAGMENT_ALPHA_AMP * Math.sin(tAnim * 3 * vv + i * 1.1);
        ctx.fillStyle = yeuxViolet ? '#b400ff' : couleurs[i % 3];
        ctx.fillRect(cx + Math.cos(angle) * r - 2.5, cy + Math.sin(angle) * r - 2.5, 5, 5);
    }
    ctx.globalAlpha = 1;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} tAnim
 * @param {number} vv
 */
export function dessinerRayonsDistorsion(ctx, cx, cy, tAnim, vv) {
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + tAnim * 0.4 * vv;
        const longueur = 28 + 8 * Math.sin(tAnim * 2 * vv + i);
        ctx.strokeStyle = 'rgba(255,0,110,0.45)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * longueur, cy + Math.sin(angle) * longueur);
        ctx.stroke();
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} tAnim
 * @param {number} vv
 * @param {boolean} effetsReduits
 * @param {boolean} yeuxViolet
 * @param {boolean} yeuxRouge
 * @param {boolean} unOeil
 * @param {boolean} paupiere
 */
export function dessinerSymboleDistorsion(
    ctx,
    cx,
    cy,
    tAnim,
    vv,
    effetsReduits,
    yeuxViolet,
    yeuxRouge,
    unOeil,
    paupiere
) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(effetsReduits ? 0 : Math.sin(tAnim * 0.3) * 0.05);
    ctx.globalAlpha = effetsReduits
        ? C_SYMBOLE_ALPHA_REDUIT
        : C_SYMBOLE_ALPHA_MIN + C_SYMBOLE_ALPHA_AMP * Math.sin(tAnim * 1.5 * vv);
    ctx.fillStyle = yeuxViolet ? '#b400ff' : yeuxRouge ? '#ff006e' : '#b400ff';
    ctx.font = 'bold 34px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = effetsReduits ? 16 : 20 + 10 * Math.sin(tAnim * 2);
    ctx.fillText(unOeil ? '◉' : '∞', 0, 0);
    if (paupiere && !effetsReduits) {
        ctx.fillStyle = '#000';
        ctx.fillRect(-14, -6, 28, 8);
    }
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} tAnim
 * @param {boolean} effetsReduits
 */
export function dessinerGlitchBandesDistorsion(ctx, w, h, tAnim, effetsReduits) {
    for (let b = 0; b < 6; b++) {
        const yBande = effetsReduits ? (b * 17) % h : ((b * 17 + tAnim * 40) % h) | 0;
        ctx.fillStyle = b % 2 === 0 ? 'rgba(0,255,255,0.2)' : 'rgba(255,0,110,0.2)';
        ctx.fillRect(0, yBande, w, 1 + (b % 2));
    }
}
