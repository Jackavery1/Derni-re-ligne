import { PALETTE_ROBO, VISAGE_ROBO as VISAGE } from './rendu-robo-donnees.js';
import { pxRobo, pyRobo, rectArrondiRobo } from './rendu-robo-geometrie.js';

const C = PALETTE_ROBO;

function dessinerVis(ctx, cx, E, offsetY, h, refX, refY) {
    const x = pxRobo(cx, refX, E);
    const y = pyRobo(refY, E, offsetY, h);
    ctx.fillStyle = C.ANTENNE;
    ctx.beginPath();
    ctx.arc(x, y, 3.5 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.RESSORT_OMB;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 * E, 0, Math.PI * 2);
    ctx.fill();
}

function dessinerTete(ctx, cx, E, offsetY, h) {
    const x = pxRobo(cx, 17, E);
    const y = pyRobo(22, E, offsetY, h);
    const tw = 86 * E;
    const th = 58 * E;

    const grad = ctx.createLinearGradient(x, y, x, y + th);
    grad.addColorStop(0, C.TETE_REF);
    grad.addColorStop(0.25, C.TETE);
    grad.addColorStop(0.65, C.TETE_BAND);
    grad.addColorStop(1, C.RIVETS);
    ctx.fillStyle = grad;
    rectArrondiRobo(ctx, x, y, tw, th, 9 * E);
    ctx.fill();

    [
        [26, 31],
        [94, 31],
        [26, 70],
        [94, 70],
    ].forEach(([rx, ry]) => dessinerVis(ctx, cx, E, offsetY, h, rx, ry));
}

function dessinerOreilles(ctx, cx, E, offsetY, h) {
    ctx.fillStyle = C.TETE_BAND;
    const og = { x: pxRobo(cx, 11, E), y: pyRobo(40, E, offsetY, h), w: 9 * E, h: 18 * E };
    const od = { x: pxRobo(cx, 100, E), y: pyRobo(40, E, offsetY, h), w: 9 * E, h: 18 * E };
    rectArrondiRobo(ctx, og.x, og.y, og.w, og.h, 3 * E);
    ctx.fill();
    rectArrondiRobo(ctx, od.x, od.y, od.w, od.h, 3 * E);
    ctx.fill();
}

function mesuresOeil(E) {
    const largeurTete = VISAGE.LARGEUR_TETE_REF * E;
    const sclereR = (largeurTete * VISAGE.RATIO_OEIL_LARGEUR_TETE) / 2;
    const pupR = sclereR * VISAGE.RATIO_PUPILLE_OEIL;
    return { sclereR, pupR };
}

function dessinerOeil(ctx, cx, cy, E, humeur, cote, fermer = false) {
    if (fermer) {
        const { sclereR } = mesuresOeil(E);
        ctx.fillStyle = C.OEIL_CONTOUR;
        ctx.fillRect(cx - sclereR, cy - 2 * E, sclereR * 2, 4 * E);
        return;
    }

    const { sclereR, pupR } = mesuresOeil(E);
    const ecartAsym = VISAGE.ECART_ASYM_PUPILLE * E;
    let pupDx = cote === 'g' ? -ecartAsym : ecartAsym;
    let pupDy = 0;

    if (humeur === 'excite') {
        pupDy = -1 * E;
    } else if (humeur === 'triste') {
        pupDy = 1 * E;
    }

    ctx.strokeStyle = C.OEIL_CONTOUR;
    ctx.lineWidth = Math.max(1, 1.2 * E);
    ctx.fillStyle = C.SCLERE;
    ctx.beginPath();
    ctx.arc(cx, cy, sclereR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.PUPILLE;
    ctx.beginPath();
    ctx.arc(cx + pupDx, cy + pupDy, pupR, 0, Math.PI * 2);
    ctx.fill();

    const refDir = cote === 'g' ? -1 : 1;
    ctx.fillStyle = C.REFLET;
    ctx.beginPath();
    ctx.arc(
        cx + VISAGE.REFLET_PRINC_X * E * refDir,
        cy + VISAGE.REFLET_PRINC_Y * E,
        VISAGE.REFLET_PRINC_R * E,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = C.REFLET_SEC;
    ctx.beginPath();
    ctx.arc(
        cx + VISAGE.REFLET_SEC_X * E * refDir,
        cy + VISAGE.REFLET_SEC_Y * E,
        VISAGE.REFLET_SEC_R * E,
        0,
        Math.PI * 2
    );
    ctx.fill();

    if (humeur === 'triste') {
        ctx.save();
        ctx.fillStyle = C.TETE_BAND;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * E, sclereR * 0.9, Math.PI, 0);
        ctx.fill();
        ctx.restore();
    }

    if (humeur === 'alerte') {
        const dir = cote === 'g' ? -1 : 1;
        ctx.save();
        ctx.translate(cx, cy - 16 * E);
        ctx.rotate((dir * -8 * Math.PI) / 180);
        ctx.fillStyle = C.TORSE_OMB;
        ctx.fillRect(-9 * E, 0, 18 * E, 6 * E);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = C.TETE_BAND;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(cx - 12 * E, cy - 12 * E, 24 * E, 8 * E);
        ctx.restore();
    }
}

function dessinerArcNeon(ctx, cx, cy, halfW, courbe, epaisseur) {
    ctx.strokeStyle = C.BOUCHE_NEON;
    ctx.lineWidth = epaisseur;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.quadraticCurveTo(cx, cy - courbe, cx + halfW, cy);
    ctx.stroke();
}

function dessinerSourireOuvert(ctx, cx, cy, E) {
    const halfW = VISAGE.SOUVRI_OUVERT_HALF * E;
    const profondeur = VISAGE.SOUVRI_OUVERT_PROF * E;

    ctx.fillStyle = C.BOUCHE_FOND;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.quadraticCurveTo(cx, cy + profondeur, cx + halfW, cy);
    ctx.quadraticCurveTo(cx, cy + profondeur * 0.35, cx - halfW, cy);
    ctx.fill();

    ctx.strokeStyle = C.BOUCHE_NEON;
    ctx.lineWidth = Math.max(1.5, 2 * E);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.quadraticCurveTo(cx, cy + profondeur, cx + halfW, cy);
    ctx.stroke();

    ctx.fillStyle = C.BOUCHE_NEON;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(cx, cy + profondeur * 0.72, 4 * E, 2.5 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function dessinerBouche(ctx, cx, E, offsetY, h, humeur) {
    const cy = pyRobo(72, E, offsetY, h);
    const tw = VISAGE.LARGEUR_TETE_REF * E;
    const traitEpais = Math.max(2, tw * VISAGE.BOUCHE_TRAIT_RATIO);

    if (humeur === 'excite' || humeur === 'content') {
        dessinerSourireOuvert(ctx, cx, cy, E);
        return;
    }

    if (humeur === 'neutre') {
        dessinerArcNeon(
            ctx,
            cx,
            cy,
            VISAGE.ARC_NEUTRE_HALF * E,
            VISAGE.ARC_NEUTRE_COURBE * E,
            traitEpais
        );
        return;
    }

    if (humeur === 'triste') {
        dessinerArcNeon(
            ctx,
            cx,
            cy,
            VISAGE.ARC_TRISTE_HALF * E,
            VISAGE.ARC_TRISTE_COURBE * E,
            Math.max(1.5, traitEpais * 0.75)
        );
        return;
    }

    if (humeur === 'alerte') {
        ctx.strokeStyle = C.BOUCHE_NEON;
        ctx.lineWidth = Math.max(1.5, traitEpais * 0.85);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - VISAGE.ALERTE_TRAIT_HALF * E, cy);
        ctx.lineTo(cx + VISAGE.ALERTE_TRAIT_HALF * E, cy);
        ctx.stroke();
    }
}

function clignerYeux(humeur, t, clignementInactif) {
    if (clignementInactif) return false;
    if (humeur !== 'neutre' && humeur !== 'content') return false;
    const cycle = 4.2;
    const phase = (t % cycle) / cycle;
    return phase > 0.9 && phase < 0.96;
}

function dessinerYeux(ctx, cx, E, offsetY, h, humeur, t, clignementInactif) {
    const y = pyRobo(52, E, offsetY, h);
    const fermer = clignerYeux(humeur, t, clignementInactif);
    dessinerOeil(ctx, pxRobo(cx, 38, E), y, E, humeur, 'g', fermer);
    dessinerOeil(ctx, pxRobo(cx, 82, E), y, E, humeur, 'd', fermer);
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
    clignementInactif
) {
    const teteCx = cx;
    const teteCy = pyRobo(51, E, offsetY, h);
    ctx.save();
    if (inclinaisonTete) {
        ctx.translate(teteCx, teteCy);
        ctx.rotate(inclinaisonTete);
        ctx.translate(-teteCx, -teteCy);
    }
    dessinerTete(ctx, cx, E, offsetY, h);
    dessinerOreilles(ctx, cx, E, offsetY, h);
    dessinerYeux(ctx, cx, E, offsetY, h, humeur, t, clignementInactif);
    dessinerBouche(ctx, cx, E, offsetY, h, humeur);
    ctx.restore();
}
