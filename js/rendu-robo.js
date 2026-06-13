import { logger } from './logger.js';
import { abonnerBoucleMenuUnifiee, desabonnerBoucleMenuUnifiee } from './planificateur-raf.js';

export const PALETTE_ROBO = {
    TETE: '#d62b2b',
    TETE_BAND: '#a81f1f',
    RIVETS: '#7a1515',
    TETE_REF: '#e84040',
    SCLERE: '#eaf6ff',
    PUPILLE: '#1a3c46',
    OEIL_CONTOUR: '#5a1010',
    REFLET: '#ffffff',
    REFLET_SEC: '#b8e8ff',
    BOUCHE_FOND: '#0d2b2e',
    BOUCHE_NEON: '#35e0e6',
    /** @deprecated alias canon — préférer BOUCHE_NEON */
    DENTS: '#35e0e6',
    TORSE: '#7a4fc0',
    TORSE_OMB: '#5533aa',
    TORSE_REF: '#7755dd',
    PANNEAU: '#2a1840',
    CIRCUIT_MAG: '#ff2d78',
    CIRCUIT_CYAN: '#35e0e6',
    PINCE: '#5a3a8a',
    RESSORT: '#9aa3ad',
    RESSORT_OMB: '#445566',
    BOTTE: '#d62b2b',
    BOTTE_OMB: '#991515',
    ANTENNE: '#9aa3ad',
    ANTENNE_BASE: '#667788',
    LED: '#4bff5a',
    LED_OMB: '#007722',
    ETINCELLE: '#aaff88',
    ALERTE_LED: '#ffaa00',
    OMBRE_PIED: '#991515',
    RING_EXCITE_1: 'rgba(0,220,200,0.12)',
    RING_EXCITE_2: 'rgba(255,0,200,0.08)',
    COURONNE_LUEUR: 'gold',
};

/** Proportions visage (canon §1) — constantes, pas de Math.random en rendu. */
const VISAGE = {
    LARGEUR_TETE_REF: 86,
    RATIO_OEIL_LARGEUR_TETE: 0.3,
    RATIO_PUPILLE_OEIL: 0.5,
    /** Écart asymétrique fixe entre pupilles (≈1 px à taille mascotte). */
    ECART_ASYM_PUPILLE: 0.5,
    BOUCHE_TRAIT_RATIO: 0.07,
    ARC_NEUTRE_HALF: 20,
    ARC_NEUTRE_COURBE: 7,
    ARC_TRISTE_HALF: 14,
    ARC_TRISTE_COURBE: -4,
    ALERTE_TRAIT_HALF: 12,
    REFLET_PRINC_X: -3.5,
    REFLET_PRINC_Y: -4,
    REFLET_SEC_X: 2,
    REFLET_SEC_Y: 2,
    REFLET_PRINC_R: 2.2,
    REFLET_SEC_R: 1,
    SOUVRI_OUVERT_HALF: 18,
    SOUVRI_OUVERT_PROF: 10,
};

const C = PALETTE_ROBO;

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */
let _humeurActuelle = 'neutre';
/** @type {HTMLCanvasElement|null} */
let _canvas = null;
let _arcEnCielActif = false;
let _couronneActif = false;
let _clignementInactif = false;

function _px(cx, refX, E) {
    return cx + (refX - 60) * E;
}

function _py(refY, E, offsetY, h) {
    return refY * E + offsetY + (h - 150 * E) / 2;
}

function _rectArrondi(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
}

function _calculerAnimRobo(humeur, t, E) {
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

function _dessinerRingsExcite(ctx, cx, cy, E, t) {
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

function _dessinerPieds(ctx, cx, E, offsetY, h) {
    const yG = _py(149, E, offsetY, h);
    const xG = _px(cx, 46, E);
    const xD = _px(cx, 72, E);
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
    _rectArrondi(ctx, xG, yG, wP, hP, 6 * E);
    ctx.fill();
    _rectArrondi(ctx, xD, yG, wP, hP, 6 * E);
    ctx.fill();
}

function _dessinerSegmentRessort(ctx, x, y, w, h, couleur) {
    ctx.fillStyle = couleur;
    _rectArrondi(ctx, x, y, w, h, 2 * E_GLOBAL);
    ctx.fill();
}

let E_GLOBAL = 1;

function _dessinerJambes(ctx, cx, E, offsetY, h, ressortOsc = 0) {
    const cols = [
        { refX: 38, w: 12 },
        { refX: 70, w: 12 },
    ];
    cols.forEach(({ refX, w }) => {
        const x = _px(cx, refX, E);
        const y0 = _py(131, E, offsetY + ressortOsc, h);
        const segH = 4 * E;
        const segW = w * E;
        for (let i = 0; i < 4; i++) {
            _dessinerSegmentRessort(
                ctx,
                x,
                y0 + i * (segH + 1 * E),
                segW,
                segH,
                i % 2 === 0 ? C.RESSORT : C.RESSORT_OMB
            );
        }
    });
}

function _dessinerPanneauCircuit(ctx, cx, E, offsetY, h) {
    const x = _px(cx, 31, E);
    const y = _py(93, E, offsetY, h);
    const pw = 58 * E;
    const ph = 32 * E;

    ctx.fillStyle = C.PANNEAU;
    _rectArrondi(ctx, x, y, pw, ph, 4 * E);
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

function _dessinerCorps(ctx, cx, E, offsetY, h) {
    const x = _px(cx, 25, E);
    const y = _py(87, E, offsetY, h);
    const bw = 70 * E;
    const bh = 44 * E;

    const grad = ctx.createLinearGradient(x, y, x, y + bh);
    grad.addColorStop(0, C.TORSE);
    grad.addColorStop(0.5, C.TORSE_OMB);
    grad.addColorStop(1, C.PINCE);
    ctx.fillStyle = grad;
    _rectArrondi(ctx, x, y, bw, bh, 7 * E);
    ctx.fill();

    _dessinerPanneauCircuit(ctx, cx, E, offsetY, h);
}

function _dessinerBras(ctx, cx, E, offsetY, h, cote, angle, _humeur, ressortOsc = 0) {
    const isGauche = cote === 'g';
    const attacheRefX = isGauche ? 16.5 : 103.5;
    const attacheX = _px(cx, attacheRefX, E);
    const attacheY = _py(91, E, offsetY + ressortOsc, h);
    const segW = 14 * E;
    const segH = 5 * E;
    const nbSeg = 6;

    ctx.save();
    ctx.translate(attacheX, attacheY);
    ctx.rotate(angle);

    ctx.fillStyle = C.TORSE_OMB;
    _rectArrondi(ctx, -6 * E, -2 * E, 12 * E, 8 * E, 3 * E);
    ctx.fill();

    for (let i = 0; i < nbSeg; i++) {
        _dessinerSegmentRessort(
            ctx,
            -segW / 2,
            i * (segH + 1 * E),
            segW,
            segH,
            i % 2 === 0 ? C.RESSORT : C.RESSORT_OMB
        );
    }

    const mainY = nbSeg * (segH + 1 * E);
    ctx.fillStyle = C.PINCE;
    _rectArrondi(ctx, -6 * E, mainY, 12 * E, 8 * E, 3 * E);
    ctx.fill();

    ctx.restore();
}

function _dessinerCou(ctx, cx, E, offsetY, h) {
    const x = _px(cx, 50, E);
    const y = _py(80, E, offsetY, h);
    ctx.fillStyle = C.ANTENNE_BASE;
    ctx.fillRect(x, y, 20 * E, 7 * E);
}

function _dessinerVis(ctx, cx, E, offsetY, h, refX, refY) {
    const x = _px(cx, refX, E);
    const y = _py(refY, E, offsetY, h);
    ctx.fillStyle = C.ANTENNE;
    ctx.beginPath();
    ctx.arc(x, y, 3.5 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.RESSORT_OMB;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 * E, 0, Math.PI * 2);
    ctx.fill();
}

function _dessinerTete(ctx, cx, E, offsetY, h) {
    const x = _px(cx, 17, E);
    const y = _py(22, E, offsetY, h);
    const tw = 86 * E;
    const th = 58 * E;

    const grad = ctx.createLinearGradient(x, y, x, y + th);
    grad.addColorStop(0, C.TETE_REF);
    grad.addColorStop(0.25, C.TETE);
    grad.addColorStop(0.65, C.TETE_BAND);
    grad.addColorStop(1, C.RIVETS);
    ctx.fillStyle = grad;
    _rectArrondi(ctx, x, y, tw, th, 9 * E);
    ctx.fill();

    [
        [26, 31],
        [94, 31],
        [26, 70],
        [94, 70],
    ].forEach(([rx, ry]) => _dessinerVis(ctx, cx, E, offsetY, h, rx, ry));
}

function _dessinerOreilles(ctx, cx, E, offsetY, h) {
    ctx.fillStyle = C.TETE_BAND;
    const og = { x: _px(cx, 11, E), y: _py(40, E, offsetY, h), w: 9 * E, h: 18 * E };
    const od = { x: _px(cx, 100, E), y: _py(40, E, offsetY, h), w: 9 * E, h: 18 * E };
    _rectArrondi(ctx, og.x, og.y, og.w, og.h, 3 * E);
    ctx.fill();
    _rectArrondi(ctx, od.x, od.y, od.w, od.h, 3 * E);
    ctx.fill();
}

function _mesuresOeil(E) {
    const largeurTete = VISAGE.LARGEUR_TETE_REF * E;
    const sclereR = (largeurTete * VISAGE.RATIO_OEIL_LARGEUR_TETE) / 2;
    const pupR = sclereR * VISAGE.RATIO_PUPILLE_OEIL;
    return { sclereR, pupR };
}

function _dessinerOeil(ctx, cx, cy, E, humeur, cote, fermer = false) {
    if (fermer) {
        const { sclereR } = _mesuresOeil(E);
        ctx.fillStyle = C.OEIL_CONTOUR;
        ctx.fillRect(cx - sclereR, cy - 2 * E, sclereR * 2, 4 * E);
        return;
    }

    const { sclereR, pupR } = _mesuresOeil(E);
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

function _dessinerArcNeon(ctx, cx, cy, halfW, courbe, epaisseur) {
    ctx.strokeStyle = C.BOUCHE_NEON;
    ctx.lineWidth = epaisseur;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.quadraticCurveTo(cx, cy - courbe, cx + halfW, cy);
    ctx.stroke();
}

function _dessinerSourireOuvert(ctx, cx, cy, E) {
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

function _dessinerBouche(ctx, cx, E, offsetY, h, humeur) {
    const cy = _py(72, E, offsetY, h);
    const tw = VISAGE.LARGEUR_TETE_REF * E;
    const traitEpais = Math.max(2, tw * VISAGE.BOUCHE_TRAIT_RATIO);

    if (humeur === 'excite' || humeur === 'content') {
        _dessinerSourireOuvert(ctx, cx, cy, E);
        return;
    }

    if (humeur === 'neutre') {
        _dessinerArcNeon(
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
        _dessinerArcNeon(
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

function _clignerYeux(humeur, t) {
    if (_clignementInactif) return false;
    if (humeur !== 'neutre' && humeur !== 'content') return false;
    const cycle = 4.2;
    const phase = (t % cycle) / cycle;
    return phase > 0.9 && phase < 0.96;
}

function _dessinerYeux(ctx, cx, E, offsetY, h, humeur, t) {
    const y = _py(52, E, offsetY, h);
    const fermer = _clignerYeux(humeur, t);
    _dessinerOeil(ctx, _px(cx, 38, E), y, E, humeur, 'g', fermer);
    _dessinerOeil(ctx, _px(cx, 82, E), y, E, humeur, 'd', fermer);
}

function _dessinerAntenne(ctx, cx, E, offsetY, h, anim, t, _humeur) {
    const tigeY = _py(4, E, offsetY, h);
    ctx.strokeStyle = C.ANTENNE;
    ctx.lineWidth = Math.max(1, 4 * E);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, tigeY + 20 * E);
    ctx.lineTo(cx, tigeY);
    ctx.stroke();

    const baseY = _py(24, E, offsetY, h);
    ctx.fillStyle = C.ANTENNE_BASE;
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 7 * E, 5 * E, 0, 0, Math.PI * 2);
    ctx.fill();

    const bouleY = _py(6, E, offsetY, h);
    if (anim.antenneLedAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = anim.antenneLedAlpha;
        ctx.fillStyle = anim.antenneLedCouleur;
        ctx.beginPath();
        ctx.arc(cx, bouleY, anim.antenneLedR || 6 * E, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (_humeur === 'excite') {
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

function _dessinerCouronne(ctx, cx, E, offsetY, h, t) {
    const y = _py(8, E, offsetY, h) + Math.sin(t * 2) * 2 * E;
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
 * Dessine ROBO pixel art sur le canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'} humeur
 * @param {number} t
 * @param {{ arcEnCiel?: boolean, couronne?: boolean }} [options]
 */
export function dessinerRobo(ctx, w, h, humeur, t, options = {}) {
    ctx.clearRect(0, 0, w, h);

    const E = Math.min(w / 120, h / 150);
    E_GLOBAL = E;
    const cx = w / 2;
    const anim = _calculerAnimRobo(humeur, t, E);
    const offsetY = anim.offsetY;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (options.arcEnCiel) {
        ctx.filter = `hue-rotate(${(t * 80) % 360}deg)`;
    }

    const cyCorps = _py(100, E, offsetY, h);
    if (anim.dessinerRings) {
        _dessinerRingsExcite(ctx, cx, cyCorps, E, t);
    }

    const ressortOsc = anim.ressortOsc ?? 0;

    _dessinerPieds(ctx, cx, E, offsetY, h);
    _dessinerJambes(ctx, cx, E, offsetY, h, ressortOsc);
    _dessinerCorps(ctx, cx, E, offsetY, h);
    _dessinerBras(ctx, cx, E, offsetY, h, 'g', anim.angleBrasG, humeur, ressortOsc);
    _dessinerBras(ctx, cx, E, offsetY, h, 'd', anim.angleBrasD, humeur, ressortOsc);
    _dessinerCou(ctx, cx, E, offsetY, h);

    const teteCx = cx;
    const teteCy = _py(51, E, offsetY, h);
    ctx.save();
    if (anim.inclinaisonTete) {
        ctx.translate(teteCx, teteCy);
        ctx.rotate(anim.inclinaisonTete);
        ctx.translate(-teteCx, -teteCy);
    }
    _dessinerTete(ctx, cx, E, offsetY, h);
    _dessinerOreilles(ctx, cx, E, offsetY, h);
    _dessinerYeux(ctx, cx, E, offsetY, h, humeur, t);
    _dessinerBouche(ctx, cx, E, offsetY, h, humeur);
    ctx.restore();

    _dessinerAntenne(ctx, cx, E, offsetY, h, anim, t, humeur);

    if (options.couronne) {
        _dessinerCouronne(ctx, cx, E, offsetY, h, t);
    }

    ctx.restore();
}

/** @param {'neutre'|'content'|'excite'|'triste'|'alerte'} humeur */
export function definirHumeurRobo(humeur) {
    _humeurActuelle = humeur;
}

export function definirClignementInactifMascotte(actif) {
    _clignementInactif = actif;
}

export function definirArcEnCiel(actif) {
    _arcEnCielActif = actif;
}

export function definirCouronne(actif) {
    _couronneActif = actif;
}

export function demarrerBoucleRobo() {
    _canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById('canvas-mascotte'));
    if (!_canvas) return;
    abonnerBoucleMenuUnifiee(_boucle);
}

export function arreterBoucleRobo() {
    desabonnerBoucleMenuUnifiee(_boucle);
}

function _mascotteVisible() {
    const section = document.getElementById('section-mascotte');
    if (!section) return false;
    if (section.classList.contains('element-masque')) return false;
    const style = getComputedStyle(section);
    return style.display !== 'none' && style.visibility !== 'hidden';
}

function _boucle(timestamp) {
    if (!_canvas) return;
    if (!_mascotteVisible()) return;
    const ctx = _canvas.getContext('2d');
    if (!ctx) return;
    try {
        const t = timestamp / 1000;
        dessinerRobo(ctx, _canvas.width, _canvas.height, _humeurActuelle, t, {
            arcEnCiel: _arcEnCielActif,
            couronne: _couronneActif,
        });
    } catch (err) {
        logger.warn('[rendu-robo] erreur boucle :', err);
    }
}

/** @param {string} humeur */
export function convertirHumeurVersCanvas(humeur) {
    if (humeur === 'triste') return 'triste';
    if (
        humeur === 'excite' ||
        humeur === 'excite-plus' ||
        humeur === 'triomphal' ||
        humeur === 'euphorique' ||
        humeur === 'emerveille'
    ) {
        return 'excite';
    }
    if (humeur === 'content' || humeur === 'heureux') return 'content';
    if (
        humeur === 'alerte' ||
        humeur === 'stresse' ||
        humeur === 'inquiet' ||
        humeur === 'determine' ||
        humeur === 'grimace'
    ) {
        return 'alerte';
    }
    return 'neutre';
}
