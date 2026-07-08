import { PALETTE_ROBO, PROPORTIONS_ROBO as P, RATIOS_ROBO as R } from './rendu-robo-donnees.js';
import { pyRobo, rectArrondiRobo } from './rendu-robo-geometrie.js';
import { obtenirEffetsAccessibiliteReduits } from '../ui/accessibilite.js';

const C = PALETTE_ROBO;
const ANTENNE_CONTENT_INCLINAISON = 0.21;
const ANTENNE_TRISTE_INCLINAISON = 0.61;
const ANTENNE_OSCILLATION_AMPL = Math.PI / 60;

/**
 * @typedef {{ capX: number, capY: number, capW: number, capH: number, cx: number }} BoundsCapsule
 */

/**
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {number} t
 * @param {number} E
 */
export function calculerAnimRobo(humeur, t, E) {
    const effetsReduits = obtenirEffetsAccessibiliteReduits();
    const anim = {
        offsetY: 0,
        inclinaisonTete: 0,
        antenneAngle: 0,
        antenneTipAlpha: 0.85,
        antenneTipR: 5 * E,
        mainOffsetY: 0,
        dessinerHaloExcite: false,
    };

    switch (humeur) {
        case 'content':
            anim.offsetY = Math.sin(t * 2.5) * 3 * E;
            anim.antenneAngle = ANTENNE_CONTENT_INCLINAISON;
            anim.antenneTipAlpha = 0.9;
            anim.mainOffsetY = Math.sin(t * 2.5) * 2 * E;
            break;
        case 'excite':
            anim.offsetY = -Math.abs(Math.sin(t * 5)) * 5 * E;
            anim.antenneAngle = 0;
            anim.antenneTipAlpha = 1;
            anim.antenneTipR = 6.5 * E;
            anim.mainOffsetY = Math.sin(t * 5) * 3 * E;
            anim.dessinerHaloExcite = !effetsReduits;
            break;
        case 'triste':
            anim.offsetY = Math.sin(t * 1) * 1.5 * E;
            anim.inclinaisonTete = -0.05;
            anim.antenneAngle = ANTENNE_TRISTE_INCLINAISON;
            anim.antenneTipAlpha = 0.4;
            anim.mainOffsetY = 2 * E;
            break;
        case 'alerte':
            anim.offsetY = Math.sin(t * 1.8) * 2 * E;
            anim.antenneAngle = 0;
            anim.antenneTipAlpha = 1;
            anim.antenneTipR = 5 * E;
            break;
        case 'tetris':
            anim.antenneAngle = 0;
            anim.antenneTipAlpha = 0.85;
            break;
        default:
            anim.offsetY = Math.sin(t * 1.5) * 2 * E;
            anim.antenneTipAlpha = 0.7 + Math.sin(t * 2.2) * 0.2;
            break;
    }

    if (!effetsReduits && (humeur === 'neutre' || humeur === 'content')) {
        anim.antenneAngle += Math.sin(t * 1.2) * ANTENNE_OSCILLATION_AMPL;
    }

    return anim;
}

function dessinerHaloExcite(ctx, cx, cy, E, t) {
    const r = 52 * E + Math.sin(t * 3) * 4 * E;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.14)';
    ctx.lineWidth = Math.max(1, 2 * E);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/** @param {BoundsCapsule} bounds @param {number} E */
function dessinerPieds(ctx, bounds, E) {
    const { capY, capW, capH, cx } = bounds;
    const piedW = capW * R.PIED_W;
    const piedH = capH * R.PIED_H;
    const gap = capW * R.PIED_GAP;
    const y = capY + capH * R.PIED_TOP;
    const demi = (piedW + gap) / 2;

    for (const signe of [-1, 1]) {
        const x = cx + signe * demi - piedW / 2;
        ctx.fillStyle = C.COQUE_OMBRE;
        ctx.beginPath();
        ctx.ellipse(x + piedW / 2, y + piedH + E, 8 * E, 2.5 * E, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.COQUE;
        rectArrondiRobo(ctx, x, y, piedW, piedH, piedW * 0.45);
        ctx.fill();
        ctx.strokeStyle = C.COQUE_OMBRE;
        ctx.lineWidth = Math.max(0.8, E * 0.8);
        ctx.stroke();
    }
}

/** @param {BoundsCapsule} bounds @param {number} E @param {number} mainOffsetY */
function dessinerMains(ctx, bounds, E, mainOffsetY) {
    const { capW, capH, cx } = bounds;
    const y = bounds.capY + capH * R.MAIN_Y + mainOffsetY;
    const ecart = capW / 2 + capW * R.MAIN_ECART;
    const r = (capW * R.MAIN_D) / 2;
    for (const signe of [-1, 1]) {
        const mx = cx + signe * ecart;
        ctx.fillStyle = C.COQUE;
        ctx.beginPath();
        ctx.arc(mx, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.COQUE_OMBRE;
        ctx.lineWidth = Math.max(0.8, E * 0.8);
        ctx.stroke();
    }
}

/** @param {BoundsCapsule} bounds @param {number} E */
function dessinerFenetreGrille(ctx, bounds, E) {
    const { capY, capW, capH, cx } = bounds;
    const fw = capW * R.FENETRE_W;
    const fh = capH * (1 - R.FENETRE_TOP) * 0.85;
    const fx = cx - fw / 2;
    const fy = capY + capH * R.FENETRE_TOP;

    ctx.fillStyle = C.ECRAN;
    rectArrondiRobo(ctx, fx, fy, fw, fh, 3 * E);
    ctx.fill();
    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = Math.max(0.8, E * 0.7);
    ctx.stroke();

    const cols = 3;
    const rows = 2;
    const pad = 2 * E;
    const cw = (fw - pad * 2) / cols;
    const ch = (fh - pad * 2) / rows;
    let idx = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const allumee = idx !== 5;
            ctx.fillStyle = allumee ? C.GRILLE_CELLULE : C.GRILLE_ETEINTE;
            rectArrondiRobo(
                ctx,
                fx + pad + col * cw + 0.6 * E,
                fy + pad + row * ch + 0.6 * E,
                cw - 1.2 * E,
                ch - 1.2 * E,
                1.2 * E
            );
            ctx.fill();
            idx++;
        }
    }
}

/**
 * @param {number} cx
 * @param {number} E
 * @param {number} offsetY
 * @param {number} h
 * @returns {BoundsCapsule}
 */
export function calculerBoundsCapsule(cx, E, offsetY, h) {
    const capW = P.CAPSULE_W * E;
    const capH = P.CAPSULE_H * E;
    const capX = cx - capW / 2;
    const capY = pyRobo(P.CAPSULE_Y, E, offsetY, h);
    return { capX, capY, capW, capH, cx };
}

/**
 * @param {BoundsCapsule} bounds
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function calculerBoundsEcran(bounds) {
    const { capX, capY, capW, capH } = bounds;
    const w = capW * R.ECRAN_W;
    const eh = capH * R.ECRAN_H;
    return {
        x: capX + (capW - w) / 2,
        y: capY + capH * R.ECRAN_TOP,
        w,
        h: eh,
    };
}

/** @param {BoundsCapsule} bounds @param {number} E */
function dessinerCapsule(ctx, bounds, E) {
    const { capX, capY, capW, capH } = bounds;

    ctx.fillStyle = C.COQUE_OMBRE;
    rectArrondiRobo(ctx, capX + E, capY + 2 * E, capW, capH, capW * 0.38);
    ctx.fill();

    ctx.fillStyle = C.COQUE;
    rectArrondiRobo(ctx, capX, capY, capW, capH, capW * 0.38);
    ctx.fill();
    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = Math.max(1, E);
    ctx.stroke();
}

export function dessinerAntenneRobo(ctx, bounds, E, anim) {
    const { capY, capH, cx } = bounds;
    const baseY = capY + 2 * E;
    const tipY = baseY - capH * R.ANTENNE_H;
    const tipR = anim.antenneTipR;

    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(anim.antenneAngle);
    ctx.translate(-cx, -baseY);

    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = Math.max(1.2, 2 * E);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = anim.antenneTipAlpha;
    ctx.shadowColor = C.GLYPHE;
    ctx.shadowBlur = tipR * R.OEIL_HALO;
    ctx.fillStyle = C.GLYPHE;
    ctx.beginPath();
    ctx.arc(cx, tipY, tipR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
}

export function dessinerCouronneRobo(ctx, cx, E, offsetY, h, t) {
    const y = pyRobo(P.CAPSULE_Y - 6, E, offsetY, h) + Math.sin(t * 2) * 2 * E;
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(Math.sin(t * 1.5) * 0.08);
    ctx.font = `${Math.round(18 * E)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = C.GLYPHE;
    ctx.shadowBlur = 8 * E;
    ctx.fillText('👑', 0, 0);
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof calculerAnimRobo>} anim
 * @param {'complet'|'mini'} niveauDetail
 */
export function dessinerCorpsRobo(ctx, bounds, E, humeur, t, anim, niveauDetail = 'complet') {
    const { cx, capY, capH } = bounds;
    const cyCorps = capY + capH / 2;
    if (anim.dessinerHaloExcite) {
        dessinerHaloExcite(ctx, cx, cyCorps, E, t);
    }

    if (niveauDetail === 'complet') {
        dessinerPieds(ctx, bounds, E);
    }
    dessinerCapsule(ctx, bounds, E);
    if (niveauDetail === 'complet') {
        dessinerFenetreGrille(ctx, bounds, E);
        dessinerMains(ctx, bounds, E, anim.mainOffsetY);
    }
}
