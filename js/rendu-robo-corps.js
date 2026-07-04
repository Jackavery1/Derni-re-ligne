import { PALETTE_ROBO, PROPORTIONS_ROBO as P } from './rendu-robo-donnees.js';
import { pyRobo, rectArrondiRobo } from './rendu-robo-geometrie.js';

const C = PALETTE_ROBO;

/**
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'} humeur
 * @param {number} t
 * @param {number} E
 */
export function calculerAnimRobo(humeur, t, E) {
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
            anim.antenneAngle = Math.sin(t * 2) * 0.12;
            anim.antenneTipAlpha = 0.9;
            anim.mainOffsetY = Math.sin(t * 2.5) * 2 * E;
            break;
        case 'excite':
            anim.offsetY = -Math.abs(Math.sin(t * 5)) * 5 * E;
            anim.antenneAngle = 0;
            anim.antenneTipAlpha = 0.55 + Math.sin(t * 6) * 0.45;
            anim.antenneTipR = 6.5 * E;
            anim.mainOffsetY = Math.sin(t * 5) * 3 * E;
            anim.dessinerHaloExcite = true;
            break;
        case 'triste':
            anim.offsetY = Math.sin(t * 1) * 1.5 * E;
            anim.inclinaisonTete = -0.05;
            anim.antenneAngle = 0.35;
            anim.antenneTipAlpha = 0.4;
            anim.mainOffsetY = 2 * E;
            break;
        case 'alerte':
            anim.offsetY = Math.sin(t * 1.8) * 2 * E;
            anim.antenneAngle = 0;
            anim.antenneTipAlpha = 0.45 + Math.sin(t * 5) * 0.55;
            anim.antenneTipR = 5 * E;
            break;
        default:
            anim.offsetY = Math.sin(t * 1.5) * 2 * E;
            anim.antenneAngle = Math.sin(t * 1.2) * 0.08;
            anim.antenneTipAlpha = 0.7 + Math.sin(t * 2.2) * 0.2;
            break;
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

function dessinerPieds(ctx, cx, E, offsetY, h) {
    const y = pyRobo(P.PIED_Y, E, offsetY, h);
    const demi = P.PIED_ECART * E;
    for (const signe of [-1, 1]) {
        const x = cx + signe * demi - (P.PIED_W * E) / 2;
        ctx.fillStyle = C.COQUE_OMBRE;
        ctx.beginPath();
        ctx.ellipse(
            x + (P.PIED_W * E) / 2,
            y + P.PIED_H * E + E,
            8 * E,
            2.5 * E,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = C.COQUE;
        rectArrondiRobo(ctx, x, y, P.PIED_W * E, P.PIED_H * E, 5 * E);
        ctx.fill();
        ctx.strokeStyle = C.LISERE;
        ctx.lineWidth = Math.max(0.8, E * 0.8);
        ctx.stroke();
    }
}

function dessinerMains(ctx, cx, E, offsetY, h, mainOffsetY) {
    const y = pyRobo(P.MAIN_Y, E, offsetY + mainOffsetY, h);
    const ecart = P.MAIN_ECART_X * E;
    const r = P.MAIN_R * E;
    for (const signe of [-1, 1]) {
        const mx = cx + signe * ecart;
        ctx.fillStyle = C.COQUE;
        ctx.beginPath();
        ctx.arc(mx, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.LISERE;
        ctx.lineWidth = Math.max(0.8, E * 0.8);
        ctx.stroke();
    }
}

function dessinerFenetreGrille(ctx, cx, capX, capY, capW, capH, E) {
    const fw = capW * P.FENETRE_W_RATIO;
    const fh = P.FENETRE_H * E;
    const fx = cx - fw / 2;
    const fy = capY + capH - fh - 6 * E;

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
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function calculerBoundsEcran(cx, E, offsetY, h) {
    const capW = P.CAPSULE_W * E;
    const capH = P.CAPSULE_H * E;
    const capX = cx - capW / 2;
    const capY = pyRobo(P.CAPSULE_Y, E, offsetY, h);
    const inset = capW * P.ECRAN_INSET;
    const eh = capH * P.ECRAN_RATIO - inset;
    return {
        x: capX + inset,
        y: capY + inset,
        w: capW - inset * 2,
        h: eh,
    };
}

function dessinerCapsule(ctx, cx, E, offsetY, h) {
    const capW = P.CAPSULE_W * E;
    const capH = P.CAPSULE_H * E;
    const capX = cx - capW / 2;
    const capY = pyRobo(P.CAPSULE_Y, E, offsetY, h);

    ctx.fillStyle = C.COQUE_OMBRE;
    rectArrondiRobo(ctx, capX + E, capY + 2 * E, capW, capH, capW * 0.38);
    ctx.fill();

    ctx.fillStyle = C.COQUE;
    rectArrondiRobo(ctx, capX, capY, capW, capH, capW * 0.38);
    ctx.fill();
    ctx.strokeStyle = C.LISERE;
    ctx.lineWidth = Math.max(1, E);
    ctx.stroke();

    return { capX, capY, capW, capH };
}

export function dessinerAntenneRobo(ctx, cx, E, offsetY, h, anim) {
    const capY = pyRobo(P.CAPSULE_Y, E, offsetY, h);
    const baseY = capY + 2 * E;
    const tipY = baseY - P.ANTENNE_H * E;

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
    ctx.fillStyle = C.GLYPHE;
    ctx.beginPath();
    ctx.arc(cx, tipY, anim.antenneTipR, 0, Math.PI * 2);
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
 */
export function dessinerCorpsRobo(ctx, cx, E, offsetY, h, humeur, t, anim) {
    const cyCorps = pyRobo(P.CAPSULE_Y + P.CAPSULE_H / 2, E, offsetY, h);
    if (anim.dessinerHaloExcite) {
        dessinerHaloExcite(ctx, cx, cyCorps, E, t);
    }

    dessinerPieds(ctx, cx, E, offsetY, h);
    const { capX, capY, capW, capH } = dessinerCapsule(ctx, cx, E, offsetY, h);
    dessinerFenetreGrille(ctx, cx, capX, capY, capW, capH, E);
    dessinerMains(ctx, cx, E, offsetY, h, anim.mainOffsetY);
}
