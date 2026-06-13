import {
    etatBossDepuisParams,
    obtenirCoucheStatique,
    seedFraction,
} from './portrait-rendu-utils.js';

export const PALETTE_BRASIER = {
    ROUGE_SOMBRE: '#8a1a1a',
    ROUGE: '#d63a1a',
    ORANGE: '#ff7a1a',
    LISERE: '#ffd23a',
    COEUR: '#fff6c0',
    COEUR_FAIBLE: '#d6a83a',
    CERCLE: '#c33a2a',
    BRAISE: '#ff9a3a',
    BRECHE: '#3a0808',
};

const _cache = new Map();
const NB_POINTES = 9;

/**
 * @param {number} i
 * @param {number} s
 * @param {number} extension
 */
function _rayonPointe(i, s, extension) {
    const tip = i % 2 === 0;
    const base = tip ? 44 * s : 21 * s;
    const bruit = tip ? (4 + seedFraction(i + 1) * 8) * s : 0;
    return base + (tip ? extension : 0) + bruit;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 * @param {number} extension
 */
function _traceEtoile(ctx, cx, cy, s, extension) {
    ctx.beginPath();
    for (let i = 0; i < NB_POINTES * 2; i++) {
        const angle = (i / (NB_POINTES * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = _rayonPointe(i, s, extension);
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r * 0.88;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
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
    const P = PALETTE_BRASIER;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = P.CERCLE;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 36 * s, 0, Math.PI * 2);
    ctx.stroke();

    _traceEtoile(ctx, cx, cy, s, 0);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42 * s);
    grad.addColorStop(0, P.COEUR);
    grad.addColorStop(0.25, P.LISERE);
    grad.addColorStop(0.55, P.ORANGE);
    grad.addColorStop(0.8, P.ROUGE);
    grad.addColorStop(1, P.ROUGE_SOMBRE);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = P.LISERE;
    ctx.lineWidth = 1.2 * s;
    ctx.stroke();

    const br = 10 * s;
    ctx.fillStyle = P.COEUR;
    ctx.fillRect(cx - br * 0.35, cy - br, br * 0.7, br * 2);
    ctx.fillRect(cx - br, cy - br * 0.35, br * 2, br * 0.7);
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
function _dessinerCoeur(ctx, cx, cy, s, tAnim, etat, effetsReduits) {
    const P = PALETTE_BRASIER;
    const br = 10 * s;
    let couleur = P.COEUR;
    if (etat === 'vacillant' && !effetsReduits) {
        couleur = Math.sin(tAnim * 5) > 0 ? P.COEUR : P.COEUR_FAIBLE;
    }
    if (etat === 'agressif' && !effetsReduits) {
        couleur = Math.sin(tAnim * 14) > 0.3 ? P.COEUR : P.LISERE;
    }
    ctx.fillStyle = couleur;
    ctx.fillRect(cx - br * 0.35, cy - br, br * 0.7, br * 2);
    ctx.fillRect(cx - br, cy - br * 0.35, br * 2, br * 0.7);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} tAnim
 * @param {'calme'|'agressif'|'vacillant'} etat
 * @param {boolean} effetsReduits
 */
function _dessinerBraises(ctx, w, h, tAnim, etat, effetsReduits) {
    const cx = w * 0.5;
    const s = w / 180;
    const montee = etat !== 'vacillant';
    const vitesse = etat === 'agressif' ? 1.8 : etat === 'vacillant' ? 0.5 : 0.7;

    for (let i = 0; i < 8; i++) {
        const prog = effetsReduits ? (i * 0.12) % 1 : (tAnim * vitesse * 0.35 + i * 0.13) % 1;
        const py = montee ? h * 0.78 - prog * h * 0.45 : h * 0.35 + prog * h * 0.45;
        const px = cx + (i - 4) * 9 * s + Math.sin(tAnim * 2 + i) * 3 * s;
        ctx.globalAlpha = (1 - prog) * 0.85;
        ctx.fillStyle = i % 2 === 0 ? PALETTE_BRASIER.BRAISE : PALETTE_BRASIER.LISERE;
        ctx.beginPath();
        ctx.arc(px, py, 1.6 * s, 0, Math.PI * 2);
        ctx.fill();
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
export function dessinerPortraitBrasierCanon(ctx, w, h, t, params) {
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * /** @type {number} */ (p.vitesseAnim ?? 1);
    const etat = etatBossDepuisParams(p);
    const cx = w * 0.5;
    const cy = h * 0.46;
    const s = w / 180;
    const glow = /** @type {number} */ (p.glow ?? 1);

    ctx.clearRect(0, 0, w, h);

    let echelle = /** @type {number} */ (p.echelle ?? 1);
    if (etat === 'calme' && !effetsReduits) {
        echelle *= 1 + Math.sin(tAnim * ((Math.PI * 2) / 2.4)) * 0.04;
    }
    if (etat === 'vacillant' && !effetsReduits) {
        echelle *= Math.floor(tAnim * 3) % 2 === 0 ? 0.9 : 0.96;
    }

    const extension =
        etat === 'agressif' && !effetsReduits ? 5 * s + Math.sin(tAnim * 16) * 3 * s : 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(echelle, echelle);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha =
        etat === 'vacillant' && !effetsReduits ? 0.65 + 0.25 * Math.sin(tAnim * 2) : glow;

    const statique = obtenirCoucheStatique(_cache, `${w}x${h}`, w, h, _dessinerCoucheStatique);
    if (statique) {
        ctx.drawImage(statique, 0, 0);
    } else {
        _dessinerCoucheStatique(ctx, w, h);
    }

    if (extension > 0) {
        _traceEtoile(ctx, cx, cy, s, extension);
        ctx.strokeStyle = PALETTE_BRASIER.LISERE;
        ctx.lineWidth = 1.5 * s;
        ctx.globalAlpha = 0.45 + 0.35 * Math.sin(tAnim * 18);
        ctx.stroke();
    }

    if (etat === 'vacillant') {
        ctx.fillStyle = PALETTE_BRASIER.BRECHE;
        ctx.globalAlpha = 0.55;
        for (let b = 0; b < 3; b++) {
            const angle = seedFraction(b + 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 28 * s, cy + Math.sin(angle) * 24 * s);
            ctx.lineTo(cx + Math.cos(angle + 0.3) * 18 * s, cy + Math.sin(angle + 0.3) * 16 * s);
            ctx.closePath();
            ctx.fill();
        }
    }

    if (etat === 'agressif' && !effetsReduits) {
        ctx.strokeStyle = PALETTE_BRASIER.LISERE;
        ctx.lineWidth = 1 * s;
        for (let f = 0; f < 4; f++) {
            ctx.globalAlpha = 0.4 + 0.4 * Math.sin(tAnim * 20 + f);
            ctx.beginPath();
            ctx.arc(cx, cy, (38 + f * 3) * s, f * 0.8, f * 0.8 + 0.5);
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1;
    _dessinerCoeur(ctx, cx, cy, s, tAnim, etat, effetsReduits);
    ctx.restore();

    _dessinerBraises(ctx, w, h, tAnim, etat, effetsReduits);
}

export function viderCachePortraitBrasier() {
    _cache.clear();
}
