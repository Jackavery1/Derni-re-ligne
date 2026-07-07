import { PALETTE_ROBO, RATIOS_ROBO as R, VISAGE_ROBO as VISAGE } from './rendu-robo-donnees.js';
import { rectArrondiRobo } from './rendu-robo-geometrie.js';

const C = PALETTE_ROBO;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} eyeW
 * @param {number} eyeH
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {'g'|'d'} cote
 * @param {number} E
 */
function dessinerGlyphOeil(ctx, cx, cy, eyeW, eyeH, humeur, cote, E) {
    const dir = cote === 'g' ? -1 : 1;
    ctx.fillStyle = C.GLYPHE;
    ctx.strokeStyle = C.GLYPHE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (humeur === 'alerte') {
        const w = eyeW * VISAGE.TRAIT_ALERTE_W;
        const h = eyeH * VISAGE.TRAIT_ALERTE_H;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        return;
    }

    if (humeur === 'tetris') {
        const size = eyeW * 0.85;
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        return;
    }

    if (humeur === 'content') {
        ctx.lineWidth = Math.max(1.5, 2.2 * E);
        ctx.beginPath();
        ctx.moveTo(cx - 6 * E * dir, cy + 2 * E);
        ctx.quadraticCurveTo(cx, cy - 7 * E, cx + 6 * E * dir, cy + 2 * E);
        ctx.stroke();
        return;
    }

    const scale =
        humeur === 'excite' ? 1.3 : humeur === 'triste' ? 0.8 : humeur === 'neutre' ? 1 : 1;
    const rw = (eyeW / 2) * scale;
    const rh = (eyeH / 2) * scale;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();

    if (humeur === 'excite') {
        ctx.fillStyle = C.COQUE;
        ctx.beginPath();
        ctx.arc(cx - 2 * E * dir, cy - 2.5 * E, 1.4 * E, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 1 * E * dir, cy + 1 * E, 0.9 * E, 0, Math.PI * 2);
        ctx.fill();
    }
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

function dessinerArcContent(ctx, cx, cy, E) {
    ctx.strokeStyle = C.GLYPHE;
    ctx.lineWidth = Math.max(1.2, 1.8 * E);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - VISAGE.ARC_CONTENT_HALF * E, cy);
    ctx.quadraticCurveTo(
        cx,
        cy + VISAGE.ARC_CONTENT_COURBE * E,
        cx + VISAGE.ARC_CONTENT_HALF * E,
        cy
    );
    ctx.stroke();
}

function avecHaloGlyph(ctx, blur, fn) {
    ctx.save();
    ctx.shadowColor = C.GLYPHE;
    ctx.shadowBlur = blur;
    fn();
    ctx.restore();
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
    const { x, y, w, h: eh } = ecranBounds;
    const eyeW = w * R.OEIL_W;
    const eyeH = eyeW * R.OEIL_H;
    const ecart = w * R.OEIL_ECART;
    const yOeilBase = y + eh / 2 + (humeur === 'triste' ? 4 * E : 0);
    const haloBlur = eyeW * R.OEIL_HALO;

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

    const cligner =
        clignementInactif &&
        humeur !== 'alerte' &&
        humeur !== 'excite' &&
        t % 4.2 > 3.78 &&
        t % 4.2 < 4.03;

    if (cligner) {
        ctx.strokeStyle = C.GLYPHE;
        ctx.lineWidth = Math.max(1.2, 1.6 * E);
        ctx.lineCap = 'round';
        for (const ox of [-ecart / 2, ecart / 2]) {
            ctx.beginPath();
            ctx.moveTo(cx + ox - eyeW * 0.45, yOeilBase);
            ctx.lineTo(cx + ox + eyeW * 0.45, yOeilBase);
            ctx.stroke();
        }
    } else {
        const dessinerOeil = (ox, cote) => {
            avecHaloGlyph(ctx, haloBlur, () => {
                dessinerGlyphOeil(ctx, cx + ox, yOeilBase, eyeW, eyeH, humeur, cote, E);
            });
        };
        dessinerOeil(-ecart / 2, 'g');
        dessinerOeil(ecart / 2, 'd');
        if (humeur === 'content' || humeur === 'excite') {
            dessinerArcContent(ctx, cx, yOeilBase + 14 * E, E);
        }
    }

    ctx.restore();
}
