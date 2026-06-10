import { logger } from './logger.js';

const C = {
    ROUGE_VIF: '#d42b2b',
    ROUGE_MID: '#b32020',
    ROUGE_OMB: '#8c1010',
    ROUGE_REF: '#e84040',
    VIOLET_VIF: '#6644cc',
    VIOLET_MID: '#5533aa',
    VIOLET_OMB: '#3d2280',
    VIOLET_REF: '#7755dd',
    CYAN_EXT: '#00ddc8',
    CYAN_INT: '#00b8a8',
    BLANC_REF: '#ddfff8',
    NOIR_PUP: '#081820',
    CYAN_DENT: '#00d4c0',
    NOIR_ECART: '#091a18',
    GRIS_TIGE: '#8899aa',
    GRIS_BASE: '#667788',
    VERT_LED: '#00ff44',
    VERT_LED_OMB: '#007722',
    VERT_ETINCELLE: '#aaff88',
    GRIS_CLR: '#99aabb',
    GRIS_OMB: '#445566',
    GRIS_COIL_A: '#8899aa',
    GRIS_COIL_B: '#445566',
    ROUGE_PIED: '#cc2222',
    ROUGE_PIED_OMB: '#991515',
    VIOLET_SOURCIL: '#5533aa',
    CIRCUIT_FOND: '#2a1a55',
    CIRCUIT_LIGNE: '#00ddc8',
    CIRCUIT_NODE: '#cc44ff',
    CIRCUIT_NODE2: '#ff44aa',
};

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */
let _humeurActuelle = 'neutre';
let _rafId = null;
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
        antenneLedCouleur: C.VERT_LED,
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
            anim.antenneLedCouleur = C.VERT_LED;
            anim.antenneLedR = 7 * E;
            anim.angleBrasG = (-35 * Math.PI) / 180;
            anim.angleBrasD = (35 * Math.PI) / 180;
            break;
        case 'excite':
            anim.offsetY = -Math.abs(Math.sin(t * 5)) * 6 * E;
            anim.antenneLedAlpha = 1;
            anim.antenneLedCouleur = C.VERT_LED;
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
            anim.antenneLedCouleur = '#ffaa00';
            anim.antenneLedR = 6 * E;
            anim.angleBrasG = (-15 * Math.PI) / 180 + Math.sin(t * 8) * ((5 * Math.PI) / 180);
            anim.angleBrasD = (15 * Math.PI) / 180 - Math.sin(t * 8) * ((5 * Math.PI) / 180);
            break;
        default:
            anim.offsetY = Math.sin(t * 1.5) * 2 * E;
            break;
    }

    return anim;
}

function _dessinerRingsExcite(ctx, cx, cy, E, t) {
    const r1 = 55 * E + Math.sin(t * 3) * 5 * E;
    const r2 = 70 * E + Math.sin(t * 3 + 1) * 5 * E;
    ctx.save();
    ctx.strokeStyle = 'rgba(0,220,200,0.12)';
    ctx.lineWidth = Math.max(1, 2 * E);
    ctx.beginPath();
    ctx.arc(cx, cy, r1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,0,200,0.08)';
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
    ctx.fillStyle = `rgba(153, 21, 21, 0.6)`;
    ctx.beginPath();
    ctx.ellipse(xG + wP / 2, yG + hP + 2 * E, 10 * E, 3 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(xD + wP / 2, yG + hP + 2 * E, 10 * E, 3 * E, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = C.ROUGE_PIED;
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

function _dessinerJambes(ctx, cx, E, offsetY, h) {
    const cols = [
        { refX: 38, w: 12 },
        { refX: 70, w: 12 },
    ];
    cols.forEach(({ refX, w }) => {
        const x = _px(cx, refX, E);
        const y0 = _py(131, E, offsetY, h);
        const segH = 4 * E;
        const segW = w * E;
        for (let i = 0; i < 4; i++) {
            _dessinerSegmentRessort(
                ctx,
                x,
                y0 + i * (segH + 1 * E),
                segW,
                segH,
                i % 2 === 0 ? C.GRIS_COIL_A : C.GRIS_COIL_B
            );
        }
    });
}

function _dessinerPanneauCircuit(ctx, cx, E, offsetY, h) {
    const x = _px(cx, 31, E);
    const y = _py(93, E, offsetY, h);
    const pw = 58 * E;
    const ph = 32 * E;

    ctx.fillStyle = C.CIRCUIT_FOND;
    _rectArrondi(ctx, x, y, pw, ph, 4 * E);
    ctx.fill();

    ctx.strokeStyle = C.CIRCUIT_LIGNE;
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
        { nx: x + pw * 0.28, ny: midY, c: C.CIRCUIT_NODE },
        { nx: x + pw * 0.72, ny: midY, c: C.CIRCUIT_NODE2 },
        { nx: x + 4 * E, ny: midY, c: C.CIRCUIT_NODE },
        { nx: x + pw - 4 * E, ny: midY, c: C.CIRCUIT_NODE2 },
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
    grad.addColorStop(0, C.VIOLET_VIF);
    grad.addColorStop(0.5, C.VIOLET_MID);
    grad.addColorStop(1, C.VIOLET_OMB);
    ctx.fillStyle = grad;
    _rectArrondi(ctx, x, y, bw, bh, 7 * E);
    ctx.fill();

    _dessinerPanneauCircuit(ctx, cx, E, offsetY, h);
}

function _dessinerBras(ctx, cx, E, offsetY, h, cote, angle, _humeur) {
    const isGauche = cote === 'g';
    const attacheRefX = isGauche ? 16.5 : 103.5;
    const attacheX = _px(cx, attacheRefX, E);
    const attacheY = _py(91, E, offsetY, h);
    const segW = 14 * E;
    const segH = 5 * E;
    const nbSeg = 6;

    ctx.save();
    ctx.translate(attacheX, attacheY);
    ctx.rotate(angle);

    ctx.fillStyle = C.VIOLET_MID;
    _rectArrondi(ctx, -6 * E, -2 * E, 12 * E, 8 * E, 3 * E);
    ctx.fill();

    for (let i = 0; i < nbSeg; i++) {
        _dessinerSegmentRessort(
            ctx,
            -segW / 2,
            i * (segH + 1 * E),
            segW,
            segH,
            i % 2 === 0 ? C.GRIS_COIL_A : C.GRIS_COIL_B
        );
    }

    const mainY = nbSeg * (segH + 1 * E);
    ctx.fillStyle = C.VIOLET_VIF;
    _rectArrondi(ctx, -6 * E, mainY, 12 * E, 8 * E, 3 * E);
    ctx.fill();

    ctx.restore();
}

function _dessinerCou(ctx, cx, E, offsetY, h) {
    const x = _px(cx, 50, E);
    const y = _py(80, E, offsetY, h);
    ctx.fillStyle = C.GRIS_BASE;
    ctx.fillRect(x, y, 20 * E, 7 * E);
}

function _dessinerVis(ctx, cx, E, offsetY, h, refX, refY) {
    const x = _px(cx, refX, E);
    const y = _py(refY, E, offsetY, h);
    ctx.fillStyle = C.GRIS_CLR;
    ctx.beginPath();
    ctx.arc(x, y, 3.5 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.GRIS_OMB;
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
    grad.addColorStop(0, C.ROUGE_REF);
    grad.addColorStop(0.25, C.ROUGE_VIF);
    grad.addColorStop(0.65, C.ROUGE_MID);
    grad.addColorStop(1, C.ROUGE_OMB);
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
    ctx.fillStyle = C.ROUGE_MID;
    const og = { x: _px(cx, 11, E), y: _py(40, E, offsetY, h), w: 9 * E, h: 18 * E };
    const od = { x: _px(cx, 100, E), y: _py(40, E, offsetY, h), w: 9 * E, h: 18 * E };
    _rectArrondi(ctx, og.x, og.y, og.w, og.h, 3 * E);
    ctx.fill();
    _rectArrondi(ctx, od.x, od.y, od.w, od.h, 3 * E);
    ctx.fill();
}

function _dessinerOeil(ctx, cx, cy, E, humeur, cote, fermer = false) {
    if (fermer) {
        ctx.fillStyle = C.NOIR_PUP;
        ctx.fillRect(cx - 14 * E, cy - 2 * E, 28 * E, 4 * E);
        return;
    }
    const dir = cote === 'g' ? -1 : 1;
    let irisR = 12 * E;
    let irisIntR = 9 * E;
    let pupR = 4 * E;
    let pupDy = 0;

    if (humeur === 'content') {
        irisR = 13 * E;
        pupR = 3 * E;
        pupDy = -2 * E;
    } else if (humeur === 'excite') {
        irisR = 14 * E;
        irisIntR = 11 * E;
        pupR = 2 * E;
        pupDy = -2 * E;
    }

    ctx.fillStyle = C.NOIR_PUP;
    ctx.beginPath();
    ctx.arc(cx, cy, 14 * E, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = humeur === 'excite' ? C.BLANC_REF : C.CYAN_EXT;
    ctx.beginPath();
    ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.CYAN_INT;
    ctx.beginPath();
    ctx.arc(cx, cy, irisIntR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.NOIR_PUP;
    ctx.beginPath();
    ctx.arc(cx, cy + pupDy, pupR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.BLANC_REF;
    ctx.beginPath();
    ctx.arc(cx - 3 * E * dir, cy - 4 * E, 3 * E, Math.PI, Math.PI * 1.5);
    ctx.fill();

    if (humeur === 'triste') {
        ctx.save();
        ctx.fillStyle = 'rgba(140, 16, 16, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * E, 12 * E, Math.PI, 0);
        ctx.fill();
        ctx.restore();
    }

    if (humeur === 'alerte') {
        ctx.save();
        ctx.translate(cx, cy - 16 * E);
        ctx.rotate((dir * -8 * Math.PI) / 180);
        ctx.fillStyle = C.VIOLET_SOURCIL;
        ctx.fillRect(-9 * E, 0, 18 * E, 6 * E);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = 'rgba(179, 32, 32, 0.4)';
        ctx.fillRect(cx - 12 * E, cy - 12 * E, 24 * E, 8 * E);
        ctx.restore();
    }
}

function _dessinerYeux(ctx, cx, E, offsetY, h, humeur, t) {
    const y = _py(52, E, offsetY, h);
    const fermer = humeur === 'neutre' && _clignementInactif && Math.sin(t * 2.2) > 0.92;
    _dessinerOeil(ctx, _px(cx, 38, E), y, E, humeur, 'g', fermer);
    _dessinerOeil(ctx, _px(cx, 82, E), y, E, humeur, 'd', fermer);
}

function _dessinerBouche(ctx, cx, E, offsetY, h, humeur) {
    let zoneW = 40 * E;
    let zoneH = 14 * E;
    let nbDents = 8;
    let dentCouleur = C.CYAN_DENT;
    let dentH = 8 * E;
    const dentW = 3 * E;
    const espacement = 1 * E;

    if (humeur === 'content') {
        zoneH = 16 * E;
        dentH = 9 * E;
    } else if (humeur === 'excite') {
        zoneH = 18 * E;
        zoneW = 44 * E;
        nbDents = 9;
        dentH = 10 * E;
    } else if (humeur === 'triste') {
        zoneH = 12 * E;
        nbDents = 6;
        dentCouleur = C.CYAN_INT;
        dentH = 7 * E;
    } else if (humeur === 'alerte') {
        zoneH = 12 * E;
        zoneW = 36 * E;
    }

    const x = cx - zoneW / 2;
    const y = _py(68, E, offsetY, h);

    ctx.fillStyle = C.NOIR_ECART;
    _rectArrondi(ctx, x, y, zoneW, zoneH, 4 * E);
    ctx.fill();

    const totalDentsW = nbDents * dentW + (nbDents - 1) * espacement;
    let dx = cx - totalDentsW / 2;
    const dentY = y + (zoneH - dentH) / 2;

    for (let i = 0; i < nbDents; i++) {
        let dy = dentY;
        let dh = dentH;
        if (humeur === 'content' && (i === 0 || i === nbDents - 1)) dy += 2 * E;
        if (humeur === 'triste' && (i === 0 || i === nbDents - 1)) dy -= 2 * E;
        ctx.fillStyle = dentCouleur;
        if ((i === 0 || i === nbDents - 1) && humeur !== 'triste') {
            _rectArrondi(ctx, dx, dy, dentW, dh, 2 * E);
            ctx.fill();
        } else {
            ctx.fillRect(dx, dy, dentW, dh);
        }
        dx += dentW + espacement;
    }
}

function _dessinerAntenne(ctx, cx, E, offsetY, h, anim, t, _humeur) {
    const tigeY = _py(4, E, offsetY, h);
    ctx.strokeStyle = C.GRIS_TIGE;
    ctx.lineWidth = Math.max(1, 4 * E);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, tigeY + 20 * E);
    ctx.lineTo(cx, tigeY);
    ctx.stroke();

    const baseY = _py(24, E, offsetY, h);
    ctx.fillStyle = C.GRIS_BASE;
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
                ctx.fillStyle = C.VERT_ETINCELLE;
                ctx.fillRect(sx - E, sy - E, 2 * E, 2 * E);
                ctx.restore();
            }
        }
    } else {
        ctx.fillStyle = C.GRIS_CLR;
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
    ctx.shadowColor = 'gold';
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

    _dessinerPieds(ctx, cx, E, offsetY, h);
    _dessinerJambes(ctx, cx, E, offsetY, h);
    _dessinerCorps(ctx, cx, E, offsetY, h);
    _dessinerBras(ctx, cx, E, offsetY, h, 'g', anim.angleBrasG, humeur);
    _dessinerBras(ctx, cx, E, offsetY, h, 'd', anim.angleBrasD, humeur);
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
    if (_rafId !== null) cancelAnimationFrame(_rafId);
    _boucle(performance.now());
}

export function arreterBoucleRobo() {
    if (_rafId !== null) {
        cancelAnimationFrame(_rafId);
        _rafId = null;
    }
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
    if (!_mascotteVisible()) {
        _rafId = requestAnimationFrame(_boucle);
        return;
    }
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
    _rafId = requestAnimationFrame(_boucle);
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
