import {
    etatBossDepuisParams,
    obtenirCoucheStatique,
    seedFraction,
} from './portrait-rendu-utils.js';

export const PALETTE_ARCHIVISTE = {
    FACE_CLAIRE: '#8d7bc0',
    FACE_MED: '#6a5a9a',
    FACE_OMBRE: '#4a3d70',
    LOSANGE_EXT: '#cfc4ee',
    LOSANGE_MID: '#9a86d8',
    OEIL: '#f2eeff',
    CORDE_A: '#cfc4ee',
    CORDE_B: '#9a86d8',
    ANNEAU: '#2e2450',
    FRAGMENT: '#7a68a8',
    FENTE: '#f2eeff',
    CHEVRON: '#564a82',
};

const _cache = new Map();

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 */
function _dessinerMonolitheStatique(ctx, cx, cy, s) {
    const P = PALETTE_ARCHIVISTE;
    const top = cy - 52 * s;
    const hFace = 88 * s;
    const wFace = 44 * s;

    ctx.fillStyle = P.FACE_OMBRE;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + wFace * 0.55, top + 18 * s);
    ctx.lineTo(cx + wFace * 0.55, top + hFace);
    ctx.lineTo(cx, top + hFace - 12 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = P.FACE_MED;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx - wFace * 0.55, top + 18 * s);
    ctx.lineTo(cx - wFace * 0.55, top + hFace);
    ctx.lineTo(cx, top + hFace - 12 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = P.FACE_CLAIRE;
    ctx.beginPath();
    ctx.moveTo(cx, top - 8 * s);
    ctx.lineTo(cx + wFace * 0.5, top + 10 * s);
    ctx.lineTo(cx, top + 22 * s);
    ctx.lineTo(cx - wFace * 0.5, top + 10 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = P.FENTE;
    ctx.fillRect(cx - 2 * s, top + 28 * s, 3 * s, 36 * s);

    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = P.CHEVRON;
        ctx.beginPath();
        const y = top + 34 * s + i * 10 * s;
        ctx.moveTo(cx - 14 * s, y);
        ctx.lineTo(cx - 8 * s, y + 5 * s);
        ctx.lineTo(cx - 14 * s, y + 10 * s);
        ctx.fill();
    }

    ctx.strokeStyle = P.LOSANGE_MID;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(cx, top - 4 * s);
    ctx.lineTo(cx + 14 * s, top + 8 * s);
    ctx.lineTo(cx, top + 20 * s);
    ctx.lineTo(cx - 14 * s, top + 8 * s);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = P.LOSANGE_EXT;
    ctx.beginPath();
    ctx.moveTo(cx, top + 2 * s);
    ctx.lineTo(cx + 9 * s, top + 10 * s);
    ctx.lineTo(cx, top + 18 * s);
    ctx.lineTo(cx - 9 * s, top + 10 * s);
    ctx.closePath();
    ctx.stroke();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
function _dessinerCoucheStatique(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.44;
    const s = w / 180;
    ctx.clearRect(0, 0, w, h);
    _dessinerMonolitheStatique(ctx, cx, cy, s);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} baseY
 * @param {number} s
 * @param {number} tAnim
 * @param {'calme'|'agressif'|'vacillant'} etat
 * @param {boolean} effetsReduits
 */
function _dessinerCordes(ctx, cx, baseY, s, tAnim, etat, effetsReduits) {
    const P = PALETTE_ARCHIVISTE;
    const vitesse = etat === 'agressif' ? 48 : etat === 'vacillant' ? 8 : 18;
    const cols = etat === 'agressif' ? 7 : 5;

    for (let c = 0; c < cols; c++) {
        const x = cx - 18 * s + c * 7 * s;
        const offset = effetsReduits ? c * 5 : (tAnim * vitesse + c * 11) % 40;
        const interrompu = etat === 'vacillant' && c % 2 === 1;
        ctx.strokeStyle = c % 2 === 0 ? P.CORDE_A : P.CORDE_B;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        if (interrompu) {
            ctx.lineTo(x, baseY + 18 * s);
            ctx.moveTo(x, baseY + 28 * s);
            ctx.lineTo(x, baseY + 52 * s);
        } else {
            ctx.lineTo(x, baseY + 52 * s - offset * 0.4 * s);
        }
        ctx.stroke();
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} s
 * @param {'calme'|'agressif'|'vacillant'} etat
 * @param {'arriere'|'avant'} couche
 */
function _dessinerAnneau(ctx, cx, cy, s, etat, couche) {
    const incl = etat === 'agressif' ? 0.58 : 0.35;
    const rx = 46 * s;
    const ry = 14 * s;

    ctx.save();
    ctx.translate(cx, cy + 10 * s);
    ctx.scale(1, incl);
    ctx.strokeStyle = PALETTE_ARCHIVISTE.ANNEAU;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    if (couche === 'arriere') {
        ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95);
    } else {
        ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 0.05, Math.PI * 0.95);
    }
    ctx.stroke();
    ctx.restore();
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
function _dessinerOeil(ctx, cx, cy, s, tAnim, etat, effetsReduits) {
    const P = PALETTE_ARCHIVISTE;
    const top = cy - 52 * s;
    const scan = effetsReduits || etat === 'calme' ? 0 : Math.sin(tAnim * 0.8) * 6 * s;
    const visible = etat !== 'vacillant' || effetsReduits || Math.sin(tAnim * 11 + 1.3) > -0.2;

    if (!visible) return;

    ctx.fillStyle = P.OEIL;
    ctx.beginPath();
    ctx.arc(cx + scan, top + 10 * s, etat === 'agressif' ? 2 * s : 2.8 * s, 0, Math.PI * 2);
    ctx.fill();
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
function _dessinerFragments(ctx, cx, cy, s, tAnim, etat, effetsReduits) {
    const P = PALETTE_ARCHIVISTE;
    for (let i = 0; i < 5; i++) {
        const seed = seedFraction(i + 40);
        const angle = seed * Math.PI * 2 + (effetsReduits ? 0 : tAnim * 0.15);
        const dist =
            etat === 'agressif'
                ? 34 * s - (effetsReduits ? 0 : Math.sin(tAnim * 2 + i) * 6 * s)
                : etat === 'vacillant'
                  ? 48 * s + (effetsReduits ? 0 : Math.sin(tAnim + i) * 4 * s)
                  : 40 * s;
        ctx.fillStyle = P.FRAGMENT;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(
            cx + Math.cos(angle) * dist - 2 * s,
            cy + Math.sin(angle) * dist * 0.5 - 2 * s,
            4 * s,
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
export function dessinerPortraitArchivisteCanon(ctx, w, h, t, params) {
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * /** @type {number} */ (p.vitesseAnim ?? 1);
    const etat = etatBossDepuisParams(p);
    const cx = w * 0.5;
    const cy = h * 0.44;
    const s = w / 180;

    ctx.clearRect(0, 0, w, h);

    _dessinerAnneau(ctx, cx, cy, s, etat, 'arriere');

    const statique = obtenirCoucheStatique(_cache, `${w}x${h}`, w, h, _dessinerCoucheStatique);
    if (statique) ctx.drawImage(statique, 0, 0);
    else _dessinerCoucheStatique(ctx, w, h);

    _dessinerAnneau(ctx, cx, cy, s, etat, 'avant');
    _dessinerCordes(ctx, cx, cy + 36 * s, s, tAnim, etat, effetsReduits);
    _dessinerOeil(ctx, cx, cy, s, tAnim, etat, effetsReduits);
    _dessinerFragments(ctx, cx, cy, s, tAnim, etat, effetsReduits);

    if (etat === 'vacillant') {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = PALETTE_ARCHIVISTE.FACE_OMBRE;
        for (let i = 0; i < 4; i++) {
            if (Math.floor(tAnim * 2 + i) % 3 === 0) {
                ctx.fillRect(cx - 14 * s, cy - 10 * s + i * 10 * s, 8 * s, 4 * s);
            }
        }
        ctx.globalAlpha = 1;
    }
}

export function viderCachePortraitArchiviste() {
    _cache.clear();
}
