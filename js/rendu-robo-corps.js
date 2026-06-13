import { PALETTE_ROBO } from './rendu-robo-donnees.js';
import {
    pxRobo,
    pyRobo,
    rectArrondiRobo,
    dessinerSegmentRessortRobo,
} from './rendu-robo-geometrie.js';

const C = PALETTE_ROBO;

export function calculerAnimRobo(humeur, t, E) {
    const anim = {
        offsetY: 0,
        antenneLedAlpha: 0,
        antenneLedCouleur: C.LED,
        antenneLedR: 0,
        inclinaisonTete: 0,
        angleBrasG: 0,
        angleBrasD: 0,
        dessinerRings: false,
    };

    switch (humeur) {
        case 'content':
            anim.offsetY = Math.sin(t * 2.5) * 3 * E;
            anim.antenneLedAlpha = 0.7 + Math.sin(t * 3) * 0.3;
            anim.antenneLedCouleur = C.LED;
            anim.antenneLedR = 7 * E;
            anim.angleBrasG = (-35 * Math.PI) / 180;
            anim.angleBrasD = (35 * Math.PI) / 180;
            anim.ressortOsc = Math.sin(t * 2) * 2 * E;
            break;
        case 'excite':
            anim.offsetY = -Math.abs(Math.sin(t * 5)) * 6 * E;
            anim.antenneLedAlpha = 1;
            anim.antenneLedCouleur = C.LED;
            anim.antenneLedR = 9 * E;
            anim.angleBrasG = (-65 * Math.PI) / 180 + Math.sin(t * 5) * ((10 * Math.PI) / 180);
            anim.angleBrasD = (65 * Math.PI) / 180 - Math.sin(t * 5) * ((10 * Math.PI) / 180);
            anim.dessinerRings = true;
            break;
        case 'triste':
            anim.offsetY = Math.sin(t * 1.0) * 1.5 * E;
            anim.inclinaisonTete = -0.06;
            anim.angleBrasG = (20 * Math.PI) / 180;
            anim.angleBrasD = (-20 * Math.PI) / 180;
            break;
        case 'alerte':
            anim.offsetY = Math.sin(t * 1.8) * 2 * E;
            anim.antenneLedAlpha = 0.5 + Math.sin(t * 6) * 0.5;
            anim.antenneLedCouleur = C.ALERTE_LED;
            anim.antenneLedR = 6 * E;
            anim.angleBrasG = (-15 * Math.PI) / 180 + Math.sin(t * 8) * ((5 * Math.PI) / 180);
            anim.angleBrasD = (15 * Math.PI) / 180 - Math.sin(t * 8) * ((5 * Math.PI) / 180);
            break;
        default:
            anim.offsetY = Math.sin(t * 1.5) * 2 * E;
            anim.antenneLedAlpha = 0.55 + Math.sin(t * 2.2) * 0.25;
            anim.antenneLedR = 6 * E;
            anim.angleBrasG = (-10 * Math.PI) / 180;
            anim.angleBrasD = (10 * Math.PI) / 180;
            anim.ressortOsc = Math.sin(t * 2) * 2 * E;
            break;
    }

    return anim;
}

function dessinerRingsExcite(ctx, cx, cy, E, t) {
    const r1 = 55 * E + Math.sin(t * 3) * 5 * E;
    const r2 = 70 * E + Math.sin(t * 3 + 1) * 5 * E;
    ctx.save();
    ctx.strokeStyle = C.RING_EXCITE_1;
    ctx.lineWidth = Math.max(1, 2 * E);
    ctx.beginPath();
    ctx.arc(cx, cy, r1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = C.RING_EXCITE_2;
    ctx.beginPath();
    ctx.arc(cx, cy, r2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function dessinerPieds(ctx, cx, E, offsetY, h) {
    const yG = pyRobo(149, E, offsetY, h);
    const xG = pxRobo(cx, 46, E);
    const xD = pxRobo(cx, 72, E);
    const wP = 22 * E;
    const hP = 11 * E;

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = C.OMBRE_PIED;
    ctx.beginPath();
    ctx.ellipse(xG + wP / 2, yG + hP + 2 * E, 10 * E, 3 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(xD + wP / 2, yG + hP + 2 * E, 10 * E, 3 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = C.BOTTE;
    rectArrondiRobo(ctx, xG, yG, wP, hP, 6 * E);
    ctx.fill();
    rectArrondiRobo(ctx, xD, yG, wP, hP, 6 * E);
    ctx.fill();
}

function dessinerJambes(ctx, cx, E, offsetY, h, ressortOsc = 0) {
    const cols = [
        { refX: 38, w: 12 },
        { refX: 70, w: 12 },
    ];
    cols.forEach(({ refX, w }) => {
        const x = pxRobo(cx, refX, E);
        const y0 = pyRobo(131, E, offsetY + ressortOsc, h);
        const segH = 4 * E;
        const segW = w * E;
        for (let i = 0; i < 4; i++) {
            dessinerSegmentRessortRobo(
                ctx,
                x,
                y0 + i * (segH + 1 * E),
                segW,
                segH,
                i % 2 === 0 ? C.RESSORT : C.RESSORT_OMB,
                E
            );
        }
    });
}

function dessinerPanneauCircuit(ctx, cx, E, offsetY, h) {
    const x = pxRobo(cx, 31, E);
    const y = pyRobo(93, E, offsetY, h);
    const pw = 58 * E;
    const ph = 32 * E;

    ctx.fillStyle = C.PANNEAU;
    rectArrondiRobo(ctx, x, y, pw, ph, 4 * E);
    ctx.fill();

    ctx.strokeStyle = C.CIRCUIT_CYAN;
    ctx.lineWidth = Math.max(1, 1.5 * E);
    const midY = y + ph / 2;
    ctx.beginPath();
    ctx.moveTo(x + 4 * E, midY);
    ctx.lineTo(x + pw - 4 * E, midY);
    ctx.stroke();

    const colXs = [x + pw * 0.28, x + pw * 0.72];
    colXs.forEach((colX) => {
        ctx.beginPath();
        ctx.moveTo(colX, y + 4 * E);
        ctx.lineTo(colX, y + ph - 4 * E);
        ctx.stroke();
    });

    const nodes = [
        { nx: x + pw * 0.28, ny: midY, c: C.CIRCUIT_MAG },
        { nx: x + pw * 0.72, ny: midY, c: C.CIRCUIT_CYAN },
        { nx: x + 4 * E, ny: midY, c: C.CIRCUIT_MAG },
        { nx: x + pw - 4 * E, ny: midY, c: C.CIRCUIT_CYAN },
    ];
    nodes.forEach(({ nx, ny, c }) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(nx, ny, 3 * E, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.lineWidth = Math.max(1, E);
    [
        { sx: x + 4 * E, sy: y + 4 * E, ex: x + 4 * E, ey: y + 4 * E + 5 * E },
        { sx: x + pw - 4 * E, sy: y + ph - 4 * E, ex: x + pw - 4 * E - 5 * E, ey: y + ph - 4 * E },
    ].forEach(({ sx, sy, ex, ey }) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    });
}

function dessinerCorps(ctx, cx, E, offsetY, h) {
    const x = pxRobo(cx, 25, E);
    const y = pyRobo(87, E, offsetY, h);
    const bw = 70 * E;
    const bh = 44 * E;

    const grad = ctx.createLinearGradient(x, y, x, y + bh);
    grad.addColorStop(0, C.TORSE);
    grad.addColorStop(0.5, C.TORSE_OMB);
    grad.addColorStop(1, C.PINCE);
    ctx.fillStyle = grad;
    rectArrondiRobo(ctx, x, y, bw, bh, 7 * E);
    ctx.fill();

    dessinerPanneauCircuit(ctx, cx, E, offsetY, h);
}

function dessinerBras(ctx, cx, E, offsetY, h, cote, angle, ressortOsc = 0) {
    const isGauche = cote === 'g';
    const attacheRefX = isGauche ? 16.5 : 103.5;
    const attacheX = pxRobo(cx, attacheRefX, E);
    const attacheY = pyRobo(91, E, offsetY + ressortOsc, h);
    const segW = 14 * E;
    const segH = 5 * E;
    const nbSeg = 6;

    ctx.save();
    ctx.translate(attacheX, attacheY);
    ctx.rotate(angle);

    ctx.fillStyle = C.TORSE_OMB;
    rectArrondiRobo(ctx, -6 * E, -2 * E, 12 * E, 8 * E, 3 * E);
    ctx.fill();

    for (let i = 0; i < nbSeg; i++) {
        dessinerSegmentRessortRobo(
            ctx,
            -segW / 2,
            i * (segH + 1 * E),
            segW,
            segH,
            i % 2 === 0 ? C.RESSORT : C.RESSORT_OMB,
            E
        );
    }

    const mainY = nbSeg * (segH + 1 * E);
    ctx.fillStyle = C.PINCE;
    rectArrondiRobo(ctx, -6 * E, mainY, 12 * E, 8 * E, 3 * E);
    ctx.fill();

    ctx.restore();
}

function dessinerCou(ctx, cx, E, offsetY, h) {
    const x = pxRobo(cx, 50, E);
    const y = pyRobo(80, E, offsetY, h);
    ctx.fillStyle = C.ANTENNE_BASE;
    ctx.fillRect(x, y, 20 * E, 7 * E);
}

export function dessinerAntenneRobo(ctx, cx, E, offsetY, h, anim, t, humeur) {
    const tigeY = pyRobo(4, E, offsetY, h);
    ctx.strokeStyle = C.ANTENNE;
    ctx.lineWidth = Math.max(1, 4 * E);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, tigeY + 20 * E);
    ctx.lineTo(cx, tigeY);
    ctx.stroke();

    const baseY = pyRobo(24, E, offsetY, h);
    ctx.fillStyle = C.ANTENNE_BASE;
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 7 * E, 5 * E, 0, 0, Math.PI * 2);
    ctx.fill();

    const bouleY = pyRobo(6, E, offsetY, h);
    if (anim.antenneLedAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = anim.antenneLedAlpha;
        ctx.fillStyle = anim.antenneLedCouleur;
        ctx.beginPath();
        ctx.arc(cx, bouleY, anim.antenneLedR || 6 * E, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (humeur === 'excite') {
            for (let i = 0; i < 5; i++) {
                const angle = t * 8 + i * (Math.PI / 3);
                const dist = 12 * E;
                const sx = cx + Math.cos(angle) * dist;
                const sy = bouleY + Math.sin(angle) * dist;
                ctx.save();
                ctx.globalAlpha = 0.4 + Math.sin(t * 10 + i) * 0.3;
                ctx.fillStyle = C.ETINCELLE;
                ctx.fillRect(sx - E, sy - E, 2 * E, 2 * E);
                ctx.restore();
            }
        }
    } else {
        ctx.fillStyle = C.ANTENNE;
        ctx.beginPath();
        ctx.arc(cx, bouleY, 6 * E, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function dessinerCouronneRobo(ctx, cx, E, offsetY, h, t) {
    const y = pyRobo(8, E, offsetY, h) + Math.sin(t * 2) * 2 * E;
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(Math.sin(t * 1.5) * 0.08);
    ctx.font = `${Math.round(18 * E)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = C.COURONNE_LUEUR;
    ctx.shadowBlur = 8 * E;
    ctx.fillText('👑', 0, 0);
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof calculerAnimRobo>} anim
 */
export function dessinerCorpsRobo(ctx, cx, E, offsetY, h, humeur, t, anim) {
    const cyCorps = pyRobo(100, E, offsetY, h);
    if (anim.dessinerRings) {
        dessinerRingsExcite(ctx, cx, cyCorps, E, t);
    }

    const ressortOsc = anim.ressortOsc ?? 0;

    dessinerPieds(ctx, cx, E, offsetY, h);
    dessinerJambes(ctx, cx, E, offsetY, h, ressortOsc);
    dessinerCorps(ctx, cx, E, offsetY, h);
    dessinerBras(ctx, cx, E, offsetY, h, 'g', anim.angleBrasG, ressortOsc);
    dessinerBras(ctx, cx, E, offsetY, h, 'd', anim.angleBrasD, ressortOsc);
    dessinerCou(ctx, cx, E, offsetY, h);
}
