import {
    dessinerFragmentsDistorsion,
    dessinerGlitchBandesDistorsion,
    dessinerNoyauDistorsion,
    dessinerRayonsDistorsion,
    dessinerSymboleDistorsion,
} from './portrait-distorsion-parties.js';

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
    const fondTransparent = p.fondTransparent === true;

    const glitchChrom = ab > 0.5 && !effetsReduits && Math.sin(tAnim * 13) > 0.7;
    const glitchBandes = !effetsReduits && Math.sin(tAnim * 0.4) > 0.92 && ab > 0.8;

    if (fondTransparent) {
        ctx.clearRect(0, 0, w, h);
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.48);
        halo.addColorStop(0, 'rgba(180, 0, 255, 0.28)');
        halo.addColorStop(0.55, 'rgba(255, 0, 110, 0.14)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
    }

    if (glitchChrom) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        dessinerNoyauDistorsion(ctx, cx, cy, tAnim, vv, irr, stables, 'rgba(255,0,80,0.8)', 2 * ab);
        dessinerNoyauDistorsion(
            ctx,
            cx,
            cy,
            tAnim,
            vv,
            irr,
            stables,
            'rgba(0,255,255,0.8)',
            -2 * ab
        );
        ctx.restore();
    } else {
        const coulNoyau = yeuxViolet ? 'rgba(180,0,255,0.9)' : 'rgba(180,0,255,1)';
        dessinerNoyauDistorsion(ctx, cx, cy, tAnim, vv, irr, stables, coulNoyau);
    }

    dessinerFragmentsDistorsion(ctx, cx, cy, tAnim, vv, effetsReduits, stables, yeuxViolet);
    dessinerRayonsDistorsion(ctx, cx, cy, tAnim, vv);
    dessinerSymboleDistorsion(
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
    );

    if (glitchBandes) {
        dessinerGlitchBandesDistorsion(ctx, w, h, tAnim, effetsReduits);
    }
}
