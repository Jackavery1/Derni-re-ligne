import { PALETTE_ROBO, VISAGE_ROBO as VISAGE } from './rendu-robo-donnees.js';
import { rectArrondiRobo } from './rendu-robo-geometrie.js';

const C = PALETTE_ROBO;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} E
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {'g'|'d'} cote
 */
function dessinerGlyphOeil(ctx, cx, cy, E, humeur, cote) {
    const dir = cote === 'g' ? -1 : 1;
    ctx.fillStyle = C.GLYPHE;
    ctx.strokeStyle = C.GLYPHE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (humeur === 'alerte') {
        const w = VISAGE.TRAIT_ALERTE_W * E;
        const h = VISAGE.TRAIT_ALERTE_H * E;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        return;
    }

    if (humeur === 'tetris') {
        const size = 2.5 * E;
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

    const r =
        humeur === 'excite'
            ? VISAGE.GLYPHE_R_EXCITE * E
            : humeur === 'triste'
              ? VISAGE.GLYPHE_R_TRISTE * E
              : VISAGE.GLYPHE_R_NEUTRE * E;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
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
    ctx.lineWidth = Math.max(1, w * 0.04);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * 0.18);
    ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.08, x + w * 0.55, y + h * 0.22);
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

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean} clignementInactif
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
    ecranBounds
) {
    const { x, y, w, eh } = ecranBounds;
    const ecart = VISAGE.ECART_YEUX * E;
    const yOeilBase = y + eh * 0.42 + (humeur === 'triste' ? 5 * E : 0);

    ctx.save();
    if (inclinaisonTete) {
        const pivotY = y + eh / 2;
        ctx.translate(cx, pivotY);
        ctx.rotate(inclinaisonTete);
        ctx.translate(-cx, -pivotY);
    }

    ctx.fillStyle = C.ECRAN;
    rectArrondiRobo(ctx, x, y, w, eh, w * 0.22);
    ctx.fill();
    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = Math.max(1, E);
    ctx.stroke();
    dessinerRefletEcran(ctx, x, y, w, eh);

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
            ctx.moveTo(cx + ox - 5 * E, yOeilBase);
            ctx.lineTo(cx + ox + 5 * E, yOeilBase);
            ctx.stroke();
        }
    } else {
        dessinerGlyphOeil(ctx, cx - ecart / 2, yOeilBase, E, humeur, 'g');
        dessinerGlyphOeil(ctx, cx + ecart / 2, yOeilBase, E, humeur, 'd');
        if (humeur === 'content' || humeur === 'excite') {
            dessinerArcContent(ctx, cx, yOeilBase + 14 * E, E);
        }
    }

    ctx.restore();
}
