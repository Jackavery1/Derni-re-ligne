import {
    creerSurfaceCanvas,
    etatBossDepuisParams,
    obtenirCoucheStatique,
    seedFraction,
} from './portrait-rendu-utils.js';

export const PALETTE_SENTINELLE = {
    HEX_EXT: '#bfe6ff',
    HEX_MID: '#7ac4f0',
    HEX_INT: '#4aa8e8',
    NOEUD: '#d8f0ff',
    COEUR: '#f0faff',
    HALO: '#a8d8f8',
    CRISTAL: '#6ab4e0',
    FISSURE: '#2a5070',
    NOEUD_ETEINT: '#3a6888',
};

const _cache = new Map();

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} rotation
 * @param {string} couleur
 * @param {number} epaisseur
 * @param {boolean[]} noeudsActifs
 */
function _dessinerHexagone(ctx, cx, cy, r, rotation, couleur, epaisseur, noeudsActifs) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.strokeStyle = couleur;
    ctx.lineWidth = epaisseur;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        ctx.fillStyle = noeudsActifs[i]
            ? PALETTE_SENTINELLE.NOEUD
            : PALETTE_SENTINELLE.NOEUD_ETEINT;
        ctx.beginPath();
        ctx.arc(px, py, epaisseur * 1.1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
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
    const P = PALETTE_SENTINELLE;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 10; i++) {
        const px = cx + (seedFraction(i + 20) - 0.5) * w * 0.7;
        const py = cy + (seedFraction(i + 30) - 0.5) * h * 0.55;
        ctx.fillStyle = P.CRISTAL;
        ctx.globalAlpha = 0.25 + seedFraction(i) * 0.2;
        ctx.fillRect(px, py, 2 * s, 2 * s);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = P.COEUR;
    ctx.shadowColor = P.HALO;
    ctx.shadowBlur = 6 * s;
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
        const px = cx + Math.cos(angle) * 8 * s;
        const py = cy + Math.sin(angle) * 8 * s;
        ctx.beginPath();
        ctx.arc(px, py, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

/**
 * @param {number} tAnim
 * @param {boolean} effetsReduits
 */
function _contractionAgressif(tAnim, effetsReduits) {
    if (effetsReduits) return 1;
    return Math.floor(tAnim * 3.5) % 2 === 0 ? 0.82 : 0.94;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} t
 * @param {Record<string, number | boolean | number[]> | null | undefined} params
 */
export function dessinerPortraitSentinelleCanon(ctx, w, h, t, params) {
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * /** @type {number} */ (p.vitesseAnim ?? 1);
    const etat = etatBossDepuisParams(p);
    const cx = w * 0.5;
    const cy = h * 0.46;
    const s = w / 180;
    const glow = /** @type {number} */ (p.glow ?? 1);

    ctx.clearRect(0, 0, w, h);

    const statique = obtenirCoucheStatique(_cache, `${w}x${h}`, w, h, _dessinerCoucheStatique);
    if (statique) ctx.drawImage(statique, 0, 0);
    else _dessinerCoucheStatique(ctx, w, h);

    const contract = etat === 'agressif' ? _contractionAgressif(tAnim, effetsReduits) : 1;
    const rotExt = effetsReduits
        ? 0
        : tAnim * 0.08 * (etat === 'vacillant' ? (Math.floor(tAnim * 4) % 2 ? 1.6 : -0.4) : 1);
    const rotMid = effetsReduits ? 0 : -tAnim * 0.12;
    const rotInt = effetsReduits ? 0 : tAnim * 0.05;

    const noeudsExt = [true, true, true, true, true, true];
    const noeudsMid = [true, true, true, true, true, true];
    const noeudsInt = [true, true, true, true, true, true];

    if (etat === 'vacillant') {
        noeudsExt[1] = false;
        noeudsExt[4] = false;
        noeudsMid[3] = false;
    }

    if (etat === 'agressif' && !effetsReduits) {
        const flash = Math.floor(tAnim * 6) % 6;
        for (let i = 0; i < 6; i++) noeudsExt[i] = i === flash;
    }

    ctx.globalAlpha = glow;
    _dessinerHexagone(
        ctx,
        cx,
        cy,
        40 * s * contract,
        rotExt,
        PALETTE_SENTINELLE.HEX_EXT,
        3.5 * s,
        noeudsExt
    );
    _dessinerHexagone(
        ctx,
        cx,
        cy,
        28 * s * contract,
        rotMid,
        PALETTE_SENTINELLE.HEX_MID,
        3 * s,
        noeudsMid
    );
    _dessinerHexagone(
        ctx,
        cx,
        cy,
        16 * s * contract,
        rotInt,
        PALETTE_SENTINELLE.HEX_INT,
        2.5 * s,
        noeudsInt
    );

    if (etat === 'vacillant') {
        ctx.strokeStyle = PALETTE_SENTINELLE.FISSURE;
        ctx.lineWidth = 1 * s;
        ctx.globalAlpha = 0.7;
        for (let f = 0; f < 4; f++) {
            const a = seedFraction(f + 8) * Math.PI * 2 + rotExt;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * 34 * s, cy + Math.sin(a) * 34 * s);
            ctx.lineTo(cx + Math.cos(a) * 42 * s, cy + Math.sin(a) * 42 * s);
            ctx.stroke();
        }
    }

    const coeurAlpha =
        etat === 'vacillant' && !effetsReduits ? 0.45 + 0.35 * Math.sin(tAnim * 3) : 1;
    ctx.globalAlpha = coeurAlpha * glow;
    ctx.fillStyle = etat === 'agressif' ? PALETTE_SENTINELLE.COEUR : PALETTE_SENTINELLE.COEUR;
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4 + rotInt;
        ctx.beginPath();
        ctx.arc(
            cx + Math.cos(angle) * 8 * s,
            cy + Math.sin(angle) * 8 * s,
            2.5 * s,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

export function viderCachePortraitSentinelle() {
    _cache.clear();
}
