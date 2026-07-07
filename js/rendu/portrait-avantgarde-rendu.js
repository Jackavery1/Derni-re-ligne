import {
    etatBossDepuisParams,
    obtenirCoucheStatique,
    seedFraction,
} from './portrait-rendu-utils.js';

export const PALETTE_AVANTGARDE = {
    MAGENTA: '#e02ad6',
    MAGENTA_DEG: '#9a4ae0',
    CYAN: '#2ab8e8',
    CYAN_DEG: '#4a7ae8',
    ENTRELAC: '#b87ae8',
    ORANGE: '#ff8a4a',
    OR: '#ffc63a',
    RAYON: '#ffd86a',
    BLANC: '#ffffff',
};

const _cache = new Map();

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} rotation
 * @param {string} couleur
 * @param {string} couleurDeg
 * @param {number} epaisseur
 */
function _dessinerTriangle(ctx, cx, cy, r, rotation, couleur, couleurDeg, epaisseur) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    const grad = ctx.createLinearGradient(0, -r, 0, r);
    grad.addColorStop(0, couleur);
    grad.addColorStop(1, couleurDeg);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.866, r * 0.5);
    ctx.lineTo(r * 0.866, r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = couleur;
    ctx.lineWidth = epaisseur;
    ctx.stroke();
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 */
function _dessinerEntrelacementStatique(ctx, cx, cy, s) {
    const P = PALETTE_AVANTGARDE;
    const r = 42 * s;
    const ep = 3 * s;

    _dessinerTriangle(ctx, cx, cy, r, -Math.PI / 2, P.MAGENTA, P.MAGENTA_DEG, ep);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx - r * 0.866, cy + r * 0.5);
    ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
    ctx.closePath();
    ctx.clip();
    _dessinerTriangle(ctx, cx, cy, r, Math.PI / 6, P.CYAN, P.CYAN_DEG, ep);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.55);
    ctx.lineTo(cx - r, cy - r * 0.35);
    ctx.lineTo(cx + r, cy - r * 0.35);
    ctx.closePath();
    ctx.clip();
    _dessinerTriangle(ctx, cx, cy, r, Math.PI / 6, P.CYAN, P.CYAN_DEG, ep);
    ctx.restore();

    ctx.fillStyle = P.ENTRELAC;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = P.OR;
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, cy - 4 * s);
    ctx.lineTo(cx + 8 * s, cy - 4 * s);
    ctx.lineTo(cx + 5 * s, cy + 5 * s);
    ctx.lineTo(cx - 5 * s, cy + 5 * s);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = P.RAYON;
    ctx.lineWidth = 1 * s;
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 28 * s, cy + Math.sin(angle) * 28 * s);
        ctx.stroke();
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
function _dessinerCoucheStatique(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.46;
    const s = w / 180;
    ctx.clearRect(0, 0, w, h);
    _dessinerEntrelacementStatique(ctx, cx, cy, s);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 * @param {number} tAnim
 * @param {'calme'|'agressif'|'vacillant'} etat
 * @param {boolean} effetsReduits
 */
function _dessinerEtincelles(ctx, cx, cy, s, tAnim, etat, effetsReduits) {
    const couleurs = [
        PALETTE_AVANTGARDE.MAGENTA,
        PALETTE_AVANTGARDE.CYAN,
        PALETTE_AVANTGARDE.OR,
        PALETTE_AVANTGARDE.BLANC,
    ];
    const count = etat === 'agressif' ? 10 : 6;

    for (let i = 0; i < count; i++) {
        const seed = seedFraction(i + 50);
        let angle = seed * Math.PI * 2 + (effetsReduits ? 0 : tAnim * 1.5);
        let dist = 34 * s + seed * 18 * s;
        if (etat === 'vacillant') {
            dist += (effetsReduits ? 0 : tAnim * 12 * s) % (24 * s);
        }
        if (etat === 'agressif' && !effetsReduits && Math.floor(tAnim * (Math.PI * 2)) % 2 === 0) {
            dist += 10 * s;
        }
        ctx.fillStyle = couleurs[i % couleurs.length];
        ctx.globalAlpha = 0.55;
        ctx.fillRect(
            cx + Math.cos(angle) * dist - 1.5 * s,
            cy + Math.sin(angle) * dist - 1.5 * s,
            3 * s,
            3 * s
        );
    }
    ctx.globalAlpha = 1;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} t
 * @param {Record<string, number | boolean | number[]> | null | undefined} params
 */
export function dessinerPortraitAvantgardeCanon(ctx, w, h, t, params) {
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * /** @type {number} */ (p.vitesseAnim ?? 1);
    const etat = etatBossDepuisParams(p);
    const cx = w * 0.5;
    const cy = h * 0.46;
    const s = w / 180;

    ctx.clearRect(0, 0, w, h);

    let sep = 0;
    if (etat === 'agressif' && !effetsReduits) {
        const cycle = (tAnim % 1.2) / 1.2;
        sep = cycle < 0.45 ? cycle * 14 * s : (1 - cycle) * 14 * s;
    }

    let scaleG = 1;
    let scaleD = 1;
    if (etat === 'calme' && !effetsReduits) {
        const resp = 1 + Math.sin(tAnim * 2) * 0.02;
        scaleG = resp;
        scaleD = resp;
    } else if (etat === 'vacillant' && !effetsReduits) {
        scaleG = 1 + Math.sin(tAnim * 2) * 0.02;
        scaleD = 1 + Math.sin(tAnim * 2 + Math.PI * 0.35) * 0.02;
    }

    ctx.save();
    ctx.translate(cx - sep, cy);
    ctx.scale(scaleG, scaleG);
    ctx.translate(-cx, -cy);
    const statique = obtenirCoucheStatique(_cache, `${w}x${h}`, w, h, _dessinerCoucheStatique);
    if (statique) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cx, h);
        ctx.clip();
        ctx.drawImage(statique, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(cx + sep, cy);
    ctx.scale(scaleD, scaleD);
    ctx.translate(-cx, -cy);
    if (statique) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, 0, cx, h);
        ctx.clip();
        ctx.globalAlpha =
            etat === 'vacillant' && !effetsReduits ? 0.55 + 0.25 * Math.sin(tAnim) : 1;
        ctx.drawImage(statique, 0, 0);
        ctx.restore();
    } else {
        _dessinerCoucheStatique(ctx, w, h);
    }
    ctx.restore();

    if (!statique) _dessinerCoucheStatique(ctx, w, h);

    if (etat === 'agressif' && !effetsReduits) {
        const flash = (tAnim % 1.2) / 1.2;
        if (flash > 0.88) {
            ctx.strokeStyle = PALETTE_AVANTGARDE.RAYON;
            ctx.lineWidth = 2 * s;
            ctx.globalAlpha = 0.85;
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + tAnim * 0.05;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(angle) * 32 * s, cy + Math.sin(angle) * 32 * s);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
    }

    if (etat === 'vacillant' && !effetsReduits) {
        ctx.globalAlpha = 0.5 + 0.35 * Math.sin(tAnim * 4);
        ctx.fillStyle = PALETTE_AVANTGARDE.OR;
        ctx.fillRect(cx - 8 * s, cy - 4 * s, 16 * s, 9 * s);
        ctx.globalAlpha = 1;
    }

    _dessinerEtincelles(ctx, cx, cy, s, tAnim, etat, effetsReduits);
}

export function viderCachePortraitAvantgarde() {
    _cache.clear();
}
