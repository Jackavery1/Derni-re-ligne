import { logger } from './logger.js';

/** @typedef {{ x: number, y: number, rx: number, ry: number, c1: string, c2: string }} NebuleuseMeta */
/** @typedef {{ x: number, y: number, taille: number, couleur: string }} EtoileLointaine */
/** @typedef {{ x: number, y: number, type: 'plus' | 'croix', taille: number, couleur: string, vitesse: number, dephasage: number, derivePxMin: number }} EtoileAnimee */

let etatActif = null;
let resizeEcouteurActif = false;
let compteurRaf = 0;

const COULEURS_ANIM = ['#00ddc8', '#6644cc', '#ffffff', '#ffffff', '#00ddc8', '#6644cc'];

function creerRng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 0xffffffff;
    };
}

function effetsReduitsActifs() {
    if (typeof document !== 'undefined' && document.body?.classList?.contains('effets-reduits')) {
        return true;
    }
    if (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    ) {
        return true;
    }
    return false;
}

function hexVersRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbaTeinte(hex, alpha) {
    const { r, g, b } = hexVersRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
}

function creerSurface(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        const surface = new OffscreenCanvas(w, h);
        return { surface, ctx: surface.getContext('2d') };
    }
    const surface = document.createElement('canvas');
    surface.width = w;
    surface.height = h;
    return { surface, ctx: surface.getContext('2d') };
}

function genererDonnees(w, h, teinte) {
    const rng = creerRng(w * 65537 + h * 131);
    const nebuleuses = [];
    const nbNeb = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < nbNeb; i++) {
        const rx = 80 + rng() * 160;
        const ry = 60 + rng() * 120;
        const accent =
            i === nbNeb - 1 && teinte
                ? rgbaTeinte(teinte, 0.08)
                : i % 2 === 0
                  ? 'rgba(102,68,204,0.10)'
                  : 'rgba(0,221,200,0.06)';
        nebuleuses.push({
            x: rng() * w,
            y: rng() * h,
            rx,
            ry,
            c1: accent,
            c2: 'transparent',
        });
    }

    const etoilesLointaines = [];
    for (let i = 0; i < 60; i++) {
        const taille = rng() < 0.35 ? 2 : 1;
        etoilesLointaines.push({
            x: Math.floor(rng() * w),
            y: Math.floor(rng() * h),
            taille,
            couleur: rng() < 0.7 ? '#ffffff' : '#ccddff',
        });
    }

    const etoilesAnimees = [];
    for (let i = 0; i < 25; i++) {
        const rare = rng() < 0.12;
        etoilesAnimees.push({
            x: rng() * w,
            y: rng() * h,
            type: rng() < 0.5 ? 'plus' : 'croix',
            taille: 5,
            couleur: rare ? '#ff2d78' : COULEURS_ANIM[Math.floor(rng() * COULEURS_ANIM.length)],
            vitesse: 0.8 + rng() * 1.6,
            dephasage: rng() * Math.PI * 2,
            derivePxMin: 2 + rng() * 2,
        });
    }

    return { nebuleuses, etoilesLointaines, etoilesAnimees };
}

function dessinerNebuleuse(ctx, neb) {
    const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, Math.max(neb.rx, neb.ry));
    grad.addColorStop(0, neb.c1);
    grad.addColorStop(0.55, neb.c2);
    grad.addColorStop(1, 'transparent');
    ctx.save();
    ctx.scale(1, neb.ry / neb.rx);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(neb.x, neb.y * (neb.rx / neb.ry), neb.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function dessinerEtoilePixel(ctx, x, y, taille, couleur, alpha, type) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = couleur;
    const cx = Math.floor(x);
    const cy = Math.floor(y);

    if (type === 'plus') {
        const b = taille;
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
        ctx.fillRect(cx - b - 1, cy - 1, b, 2);
        ctx.fillRect(cx + 2, cy - 1, b, 2);
        ctx.fillRect(cx - 1, cy - b - 1, 2, b);
        ctx.fillRect(cx - 1, cy + 2, 2, b);
    } else if (type === 'croix') {
        const b = taille;
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
        for (let i = 1; i <= b; i++) {
            ctx.fillRect(cx - 1 - i, cy - 1 - i, 2, 2);
            ctx.fillRect(cx - 1 + i, cy - 1 - i, 2, 2);
            ctx.fillRect(cx - 1 - i, cy - 1 + i, 2, 2);
            ctx.fillRect(cx - 1 + i, cy - 1 + i, 2, 2);
        }
    }

    ctx.globalAlpha = 1;
}

function genererCacheStatique(w, h, donnees) {
    const { surface, ctx } = creerSurface(w, h);
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = false;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050312');
    grad.addColorStop(0.5, '#0a0620');
    grad.addColorStop(1, '#08081a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (const neb of donnees.nebuleuses) {
        dessinerNebuleuse(ctx, neb);
    }

    for (const et of donnees.etoilesLointaines) {
        ctx.fillStyle = et.couleur;
        ctx.fillRect(et.x, et.y, et.taille, et.taille);
    }

    return surface;
}

function dimensionnerCanvas(canvas) {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || window.innerWidth;
    const h = parent?.clientHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
    return { w, h };
}

function dessinerEtoilesAnimees(ctx, donnees, t, statique) {
    for (const et of donnees.etoilesAnimees) {
        let y = et.y;
        let alpha = 0.5;
        if (!statique) {
            y = (et.y + (t / 60) * et.derivePxMin) % ctx.canvas.height;
            alpha = 0.35 + 0.65 * Math.abs(Math.sin(t * et.vitesse + et.dephasage));
        }
        dessinerEtoilePixel(ctx, et.x, y, et.taille, et.couleur, alpha, et.type);
    }
}

function dessinerFrame(timestamp) {
    if (!etatActif) return;

    const { canvas, ctx, cacheStatique, donnees, statique } = etatActif;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = timestamp / 1000;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    if (cacheStatique) {
        ctx.drawImage(cacheStatique, 0, 0, w, h);
    }

    dessinerEtoilesAnimees(ctx, donnees, t, statique);

    if (!statique) {
        etatActif.rafId = requestAnimationFrame(dessinerFrame);
    }
}

function attacherEcouteurResize() {
    if (resizeEcouteurActif || typeof window === 'undefined') return;
    resizeEcouteurActif = true;
    window.addEventListener('resize', () => {
        if (etatActif) invaliderCacheFondMeta();
    });
}

function reconstruireEtat() {
    if (!etatActif?.canvas) return;

    const { canvas, options } = etatActif;
    const { w, h } = dimensionnerCanvas(canvas);
    const donnees = genererDonnees(w, h, options.teinte);
    const cacheStatique = genererCacheStatique(w, h, donnees);
    const statique = effetsReduitsActifs();

    if (etatActif.rafId) {
        cancelAnimationFrame(etatActif.rafId);
        etatActif.rafId = 0;
    }

    etatActif = {
        ...etatActif,
        w,
        h,
        donnees,
        cacheStatique,
        statique,
        rafId: 0,
    };

    const ctx = canvas.getContext('2d');
    etatActif.ctx = ctx;

    if (statique) {
        dessinerFrame(performance.now());
    } else {
        etatActif.rafId = requestAnimationFrame(dessinerFrame);
    }
}

/**
 * @param {string} canvasId
 * @param {{ teinte?: string }} [options]
 */
export function demarrerFondMeta(canvasId, options = {}) {
    arreterFondMeta();

    if (typeof document === 'undefined') return;

    const canvas = document.getElementById(canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) {
        logger.debug('[fond-meta] canvas introuvable', { canvasId });
        return;
    }

    attacherEcouteurResize();

    etatActif = {
        canvasId,
        canvas,
        ctx: null,
        options,
        w: 0,
        h: 0,
        donnees: null,
        cacheStatique: null,
        statique: false,
        rafId: 0,
    };

    reconstruireEtat();
    if (!etatActif?.statique) {
        compteurRaf += 1;
        logger.debug('[fond-meta] boucle démarrée', { compteur: compteurRaf, canvasId });
    }
    logger.debug('[fond-meta] fond démarré', { canvasId, teinte: options.teinte });
}

export function arreterFondMeta() {
    if (!etatActif) return;

    if (etatActif.rafId) {
        cancelAnimationFrame(etatActif.rafId);
    }

    logger.debug('[fond-meta] fond arrêté', { canvasId: etatActif.canvasId });
    etatActif = null;
}

export function invaliderCacheFondMeta() {
    if (!etatActif) return;
    logger.debug('[fond-meta] cache invalidé', { canvasId: etatActif.canvasId });
    reconstruireEtat();
}
