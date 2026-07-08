import { PALETTE_ROBO, RATIOS_ROBO as R, VISAGE_ROBO as VISAGE } from './rendu-robo-donnees.js';
import { rectArrondiRobo } from './rendu-robo-geometrie.js';

const C = PALETTE_ROBO;
const PERIODE_CLIGNEMENT_S = 4;
const DUREE_CLIGNEMENT_S = 0.12;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} eyeW
 * @param {number} eyeH
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {'g'|'d'} cote
 * @param {number} E
 * @param {number} [scaleY=1]
 */
function dessinerGlyphOeil(ctx, cx, cy, eyeW, eyeH, humeur, cote, E, scaleY = 1) {
    const dir = cote === 'g' ? -1 : 1;
    ctx.fillStyle = C.GLYPHE;
    ctx.strokeStyle = C.GLYPHE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, scaleY);
    ctx.translate(-cx, -cy);

    if (humeur === 'alerte') {
        const w = eyeW * VISAGE.TRAIT_ALERTE_W;
        const h = eyeH * VISAGE.TRAIT_ALERTE_H;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.restore();
        return;
    }

    if (humeur === 'tetris') {
        const size = eyeW * 0.8;
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        ctx.restore();
        return;
    }

    if (humeur === 'content') {
        ctx.lineWidth = Math.max(1.5, eyeW * 0.5);
        const r = eyeW * 0.36;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
        return;
    }

    const scale =
        humeur === 'excite' ? 1.3 : humeur === 'triste' ? 0.8 : humeur === 'neutre' ? 1 : 1;
    const rw = (eyeW / 2) * scale;
    const rh = (eyeH / 2) * scale;
    const tilt = humeur === 'triste' ? (cote === 'g' ? 0.17 : -0.17) : 0;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, tilt, 0, Math.PI * 2);
    ctx.fill();

    if (humeur === 'excite') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 2 * E * dir, cy - 2.5 * E, 1.4 * E, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function dessinerRefletEcran(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = C.REFLET_ECRAN;
    ctx.lineWidth = Math.max(1, w * 0.035);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h * 0.22);
    ctx.quadraticCurveTo(x + w * 0.28, y + h * 0.06, x + w * 0.48, y + h * 0.18);
    ctx.stroke();
    ctx.restore();
}

function avecHaloGlyph(ctx, blur, fn) {
    ctx.save();
    ctx.shadowColor = C.GLYPHE;
    ctx.shadowBlur = blur;
    fn();
    ctx.restore();
}

/** @param {number} t @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur */
function doitCligner(t, humeur) {
    if (humeur === 'tetris') return false;
    const phase = ((t % PERIODE_CLIGNEMENT_S) + PERIODE_CLIGNEMENT_S) % PERIODE_CLIGNEMENT_S;
    return phase >= PERIODE_CLIGNEMENT_S - DUREE_CLIGNEMENT_S;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean} clignementInactif
 * @param {{ reflet?: boolean }} [opts]
 */
export function dessinerVisageRobo(
    ctx,
    cx,
    E,
    offsetY,
    h,
    humeur,
    t,
    inclinaisonTete,
    clignementInactif,
    ecranBounds,
    opts = {}
) {
    void clignementInactif;
    const { x, y, w, h: eh } = ecranBounds;
    const eyeW = w * R.OEIL_W;
    const eyeH = eyeW * R.OEIL_H;
    const yOeilBase = y + eh / 2 + (humeur === 'triste' ? eh * 0.08 : 0);
    const haloBlur = eyeW * R.OEIL_HALO;
    const cligner = doitCligner(t, humeur);
    const scaleYClign = cligner ? 0.1 : 1;

    ctx.save();
    if (inclinaisonTete) {
        const pivotY = y + eh / 2;
        ctx.translate(cx, pivotY);
        ctx.rotate(inclinaisonTete);
        ctx.translate(-cx, -pivotY);
    }

    ctx.fillStyle = C.ECRAN;
    const rayonEcran = eh * R.ECRAN_RADIUS;
    rectArrondiRobo(ctx, x, y, w, eh, rayonEcran);
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = R.LISERE_ALPHA;
    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = Math.max(1, E);
    ctx.stroke();
    ctx.restore();

    if (opts.reflet !== false) {
        dessinerRefletEcran(ctx, x, y, w, eh);
    }

    const dessinerOeil = (ox, cote) => {
        avecHaloGlyph(ctx, haloBlur, () => {
            dessinerGlyphOeil(ctx, cx + ox, yOeilBase, eyeW, eyeH, humeur, cote, E, scaleYClign);
        });
    };
    dessinerOeil(-w * R.OEIL_ECART * 0.5, 'g');
    dessinerOeil(w * R.OEIL_ECART * 0.5, 'd');

    ctx.restore();
}

export { PERIODE_CLIGNEMENT_S, DUREE_CLIGNEMENT_S };
