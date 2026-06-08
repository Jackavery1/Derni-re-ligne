// js/rendu-robo.js
// Rendu canvas pixel art de ROBO — mascotte de Dernière Ligne.
// Palette hardcodée : indépendante du biome actif.

import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';

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
    CYAN_DENT_ARC: '#00eedd',
    NOIR_ECART: '#091a18',
    GRIS_TIGE: '#8899aa',
    GRIS_BASE: '#667788',
    VERT_LED: '#00ff44',
    VERT_ETINCELLE: '#aaff88',
    ROUGE_LED: '#ff3333',
    ORANGE_LED: '#ffaa00',
    GRIS_CLR: '#99aabb',
    GRIS_OMB: '#445566',
    GRIS_COIL_A: '#7a8899',
    GRIS_COIL_B: '#445566',
    ROUGE_PIED: '#cc2222',
    CIRCUIT_FOND: '#2a1a55',
    CIRCUIT_LIGNE: '#00ddc8',
    CIRCUIT_NODE1: '#cc44ff',
    CIRCUIT_NODE2: '#ff44aa',
};

const PARAMS_HUMEUR = {
    neutre: { dyVit: 0.04, dyAmp: 3, angleBras: 0.1 },
    content: { dyVit: 0.06, dyAmp: 4, angleBras: 0.25 },
    excite: { dyVit: 0.11, dyAmp: 7, angleBras: 0.55 },
    triste: { dyVit: 0.02, dyAmp: 2, angleBras: -0.35 },
    alerte: { dyVit: 0.15, dyAmp: 1, angleBras: 0.05 },
};

let humeur = 'neutre';
let arcEnCiel = false;
let idAnimRobo = null;
let tAnimation = 0;
/** @type {HTMLCanvasElement | null} */
let canvasRobo = null;
let ctxRobo = null;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} arg2
 * @param {number} arg3
 * @param {string} [arg4]
 * @param {number} [arg5]
 * @param {{ arcEnCiel?: boolean }} [arg6]
 */
export function dessinerRobo(ctx, arg2, arg3, arg4, arg5, arg6) {
    if (typeof arg4 === 'string') {
        const w = arg2;
        const h = arg3;
        const humeurLocale = arg4;
        const temps = arg5 ?? 0;
        const options = arg6;
        const arcPrev = arcEnCiel;
        if (options?.arcEnCiel) arcEnCiel = true;
        const E = Math.min(w / 120, h / 150);
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate((w - 120 * E) / 2, (h - 150 * E) / 2);
        _dessinerRobo(ctx, E, temps, humeurLocale);
        ctx.restore();
        arcEnCiel = arcPrev;
        return;
    }
    _dessinerRobo(ctx, arg2, arg3);
}

function _dessinerRobo(ctx, E, t, humeurOverride) {
    const humeurActive = humeurOverride ?? humeur;
    const anim = _calculerAnimRobo(humeurActive, t, E);

    const couleurTete = arcEnCiel ? `hsl(${(t * 2) % 360}, 80%, 55%)` : C.ROUGE_MID;
    const couleurCorps = arcEnCiel ? `hsl(${(t * 2 + 120) % 360}, 70%, 50%)` : C.VIOLET_VIF;

    const largeurEfface = ctx.canvas?.width ?? 120 * E;
    const hauteurEfface = ctx.canvas?.height ?? 150 * E;
    ctx.clearRect(0, 0, largeurEfface, hauteurEfface);
    ctx.save();
    ctx.translate(0, anim.offsetY);

    _dessinerAntenne(ctx, E, t, anim, humeurActive);

    ctx.save();
    if (anim.inclinaisonTete) {
        ctx.translate(60 * E, 47 * E);
        ctx.rotate(anim.inclinaisonTete);
        ctx.translate(-60 * E, -47 * E);
    }
    _dessinerTete(ctx, E, couleurTete);
    _dessinerOeil(ctx, 42 * E, 56 * E, E, humeurActive, 'g');
    _dessinerOeil(ctx, 78 * E, 56 * E, E, humeurActive, 'd');
    _dessinerBouche(ctx, 60, E, 0, hauteurEfface, humeurActive);
    ctx.restore();

    _dessinerCou(ctx, E);
    _dessinerCorps(ctx, E, t, couleurCorps);
    _dessinerBrasGauche(ctx, E, anim.angleBrasG);
    _dessinerBrasDroit(ctx, E, anim.angleBrasD);
    _dessinerJambes(ctx, E, t);
    _dessinerBottes(ctx, E, couleurTete);

    ctx.restore();
}

function _calculerAnimRobo(humeurActive, t, E) {
    const p = PARAMS_HUMEUR[humeurActive] ?? PARAMS_HUMEUR.neutre;
    const anim = {
        offsetY: Math.sin(t * p.dyVit) * p.dyAmp * E,
        inclinaisonTete: 0,
        angleBrasG: -p.angleBras,
        angleBrasD: p.angleBras,
        antenneLedAlpha: humeurActive === 'neutre' ? 0 : 1,
        antenneLedCouleur: C.VERT_LED,
        antenneLedR: 5 * E,
    };

    switch (humeurActive) {
        case 'content':
            anim.antenneLedAlpha = 0.7 + Math.sin(t * 3) * 0.3;
            anim.antenneLedR = 7 * E;
            break;
        case 'excite':
            anim.antenneLedAlpha = 1;
            anim.antenneLedR = 9 * E;
            break;
        case 'triste':
            anim.offsetY = Math.sin(t * 1.0) * 1.5 * E;
            anim.inclinaisonTete = -0.08;
            anim.angleBrasG = (25 * Math.PI) / 180;
            anim.angleBrasD = (-25 * Math.PI) / 180;
            anim.antenneLedAlpha = 0.4 + Math.sin(t * 0.8) * 0.15;
            anim.antenneLedCouleur = C.ORANGE_LED;
            anim.antenneLedR = 5 * E;
            break;
        case 'alerte':
            anim.offsetY = Math.sin(t * 1.8) * 2 * E;
            anim.angleBrasG = (-18 * Math.PI) / 180 + Math.sin(t * 9) * ((6 * Math.PI) / 180);
            anim.angleBrasD = (18 * Math.PI) / 180 - Math.sin(t * 9) * ((6 * Math.PI) / 180);
            anim.antenneLedAlpha = Math.round(t * 4) % 2 === 0 ? 1 : 0.1;
            anim.antenneLedCouleur = C.ROUGE_LED;
            anim.antenneLedR = 6 * E;
            break;
        default:
            break;
    }

    return anim;
}

function _dessinerAntenne(ctx, E, t, anim, humeurActive) {
    ctx.strokeStyle = C.GRIS_TIGE;
    ctx.lineWidth = 2.5 * E;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(60 * E, 30 * E);
    ctx.lineTo(60 * E, 18 * E);
    ctx.stroke();

    ctx.fillStyle = C.GRIS_CLR;
    ctx.beginPath();
    ctx.arc(60 * E, 30 * E, 4 * E, 0, Math.PI * 2);
    ctx.fill();

    if (anim.antenneLedAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = anim.antenneLedAlpha;
        ctx.shadowBlur = 12 * E;
        ctx.shadowColor = anim.antenneLedCouleur;
        ctx.fillStyle = anim.antenneLedCouleur;
        ctx.beginPath();
        ctx.arc(60 * E, 15 * E, anim.antenneLedR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else {
        ctx.fillStyle = C.GRIS_BASE;
        ctx.beginPath();
        ctx.arc(60 * E, 15 * E, 5 * E, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (humeurActive === 'excite') {
        for (let i = 0; i < 6; i++) {
            const angle = i * (Math.PI / 3) + t * 0.1;
            const ex = 60 * E + Math.cos(angle) * 10 * E;
            const ey = 12 * E + Math.sin(angle) * 10 * E;
            ctx.fillStyle = C.VERT_ETINCELLE;
            ctx.fillRect(ex - E, ey - E, 2 * E, 2 * E);
        }
    }
}

function _dessinerTete(ctx, E, couleurTete) {
    const gradient = ctx.createLinearGradient(0, 30 * E, 0, 88 * E);
    if (arcEnCiel) {
        gradient.addColorStop(0, couleurTete);
        gradient.addColorStop(0.5, couleurTete);
        gradient.addColorStop(1, C.ROUGE_OMB);
    } else {
        gradient.addColorStop(0, C.ROUGE_VIF);
        gradient.addColorStop(0.5, couleurTete);
        gradient.addColorStop(1, C.ROUGE_OMB);
    }

    ctx.fillStyle = gradient;
    ctx.strokeStyle = C.ROUGE_OMB;
    ctx.lineWidth = 1.5 * E;
    _rectArrondi(ctx, 20 * E, 30 * E, 80 * E, 58 * E, 12 * E);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    _rectArrondi(ctx, 24 * E, 33 * E, 34 * E, 16 * E, 6 * E);
    ctx.fill();

    ctx.fillStyle = C.GRIS_CLR;
    for (const [rx, ry] of [
        [25, 36],
        [91, 36],
        [25, 82],
        [91, 82],
    ]) {
        ctx.beginPath();
        ctx.arc(rx * E, ry * E, 2 * E, 0, Math.PI * 2);
        ctx.fill();
    }
}

function _dessinerOeil(ctx, cx, cy, E, humeurActive, cote) {
    const dir = cote === 'g' ? -1 : 1;

    let rExterieur = 14.5 * E;
    let rIrisExt = 12 * E;
    let rIrisInt = 8 * E;
    let rPupille = 5 * E;
    let pupDx = 1 * E * dir;
    let pupDy = 0;
    let couleurIris = C.CYAN_EXT;

    switch (humeurActive) {
        case 'content':
            rExterieur = 15 * E;
            rIrisExt = 13 * E;
            rIrisInt = 9 * E;
            rPupille = 4 * E;
            pupDy = -2 * E;
            break;
        case 'excite':
            rExterieur = 16 * E;
            rIrisExt = 14 * E;
            rIrisInt = 11 * E;
            rPupille = 3 * E;
            pupDy = -3 * E;
            couleurIris = '#00ffee';
            break;
        case 'triste':
            rExterieur = 13 * E;
            rIrisExt = 10 * E;
            rIrisInt = 7 * E;
            rPupille = 5 * E;
            pupDy = 2 * E;
            couleurIris = '#009988';
            break;
        case 'alerte':
            rPupille = 3 * E;
            pupDy = -1 * E;
            couleurIris = '#00eedd';
            break;
        default:
            break;
    }

    ctx.fillStyle = C.NOIR_PUP;
    ctx.beginPath();
    ctx.arc(cx, cy, rExterieur + 1.5 * E, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eef8f7';
    ctx.beginPath();
    ctx.arc(cx, cy, rExterieur, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowColor = couleurIris;
    ctx.shadowBlur = 4 * E;
    ctx.fillStyle = couleurIris;
    ctx.beginPath();
    ctx.arc(cx, cy, rIrisExt, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = C.CYAN_INT;
    ctx.beginPath();
    ctx.arc(cx, cy, rIrisInt, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.NOIR_PUP;
    ctx.beginPath();
    ctx.arc(cx + pupDx, cy + pupDy, rPupille, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(cx - 4 * E * dir, cy - 5 * E, 2.5 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(cx - 2 * E * dir, cy - 2 * E, 1.2 * E, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (humeurActive === 'triste') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rExterieur, -Math.PI, 0);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = 'rgba(140, 20, 20, 0.65)';
        ctx.fillRect(
            cx - rExterieur - 1,
            cy - rExterieur - 1,
            rExterieur * 2 + 2,
            rExterieur * 0.55
        );
        ctx.restore();
    }

    if (humeurActive === 'alerte') {
        ctx.save();
        ctx.strokeStyle = C.ROUGE_OMB;
        ctx.lineWidth = 3.5 * E;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const sbX1 = cx - 14 * E;
        const sbX2 = cx + 2 * E;
        const sbY1 = cy - rExterieur - 3 * E;
        const sbY2 = cy - rExterieur - 11 * E;
        if (cote === 'g') {
            ctx.moveTo(sbX1, sbY1);
            ctx.lineTo(sbX2, sbY2);
        } else {
            ctx.moveTo(cx + 14 * E, sbY1);
            ctx.lineTo(cx - 2 * E, sbY2);
        }
        ctx.stroke();
        ctx.restore();
    }
}

function _dessinerBouche(ctx, cx, E, offsetY, h, humeurActive) {
    const configs = {
        neutre: { zoneW: 40, zoneH: 14, nbDents: 8, dentH: 8, coul: C.CYAN_DENT, courbure: 0 },
        content: {
            zoneW: 44,
            zoneH: 16,
            nbDents: 8,
            dentH: 10,
            coul: C.CYAN_DENT_ARC,
            courbure: 2,
        },
        excite: {
            zoneW: 50,
            zoneH: 18,
            nbDents: 10,
            dentH: 11,
            coul: C.CYAN_DENT_ARC,
            courbure: 3,
        },
        triste: { zoneW: 36, zoneH: 11, nbDents: 6, dentH: 7, coul: C.CYAN_INT, courbure: -2 },
        alerte: { zoneW: 38, zoneH: 13, nbDents: 7, dentH: 8, coul: C.CYAN_DENT, courbure: 0 },
    };

    const cfg = configs[humeurActive] ?? configs.neutre;
    const dentW = 3 * E;
    const esp = 1.2 * E;
    const x = cx * E - (cfg.zoneW * E) / 2;
    const y = _py(68, E, offsetY, h);
    const zoneW = cfg.zoneW * E;
    const zoneH = cfg.zoneH * E;
    const dentH = cfg.dentH * E;

    ctx.fillStyle = C.NOIR_ECART;
    _rectArrondi(ctx, x, y, zoneW, zoneH, 4 * E);
    ctx.fill();

    if (humeurActive === 'triste') {
        ctx.strokeStyle = 'rgba(0,180,160,0.3)';
        ctx.lineWidth = 1 * E;
        _rectArrondi(ctx, x, y, zoneW, zoneH, 4 * E);
        ctx.stroke();
    }

    const totalW = cfg.nbDents * dentW + (cfg.nbDents - 1) * esp;
    let dx = cx * E - totalW / 2;
    const dentYBase = y + (zoneH - dentH) / 2;

    for (let i = 0; i < cfg.nbDents; i++) {
        const pos = cfg.nbDents > 1 ? i / (cfg.nbDents - 1) : 0;
        const courbe = Math.sin(pos * Math.PI) * cfg.courbure * E;
        const dy =
            humeurActive === 'content' || humeurActive === 'excite'
                ? -courbe
                : humeurActive === 'triste'
                  ? courbe
                  : 0;

        ctx.fillStyle = cfg.coul;
        if (i === 0 || i === cfg.nbDents - 1) {
            _rectArrondi(ctx, dx, dentYBase + dy, dentW, dentH - Math.abs(dy), 1.5 * E);
            ctx.fill();
        } else {
            ctx.fillRect(dx, dentYBase + dy, dentW, dentH);
        }
        dx += dentW + esp;
    }
}

function _dessinerCou(ctx, E) {
    ctx.fillStyle = C.GRIS_TIGE;
    ctx.strokeStyle = C.GRIS_CLR;
    ctx.lineWidth = 1 * E;
    _rectArrondi(ctx, 52 * E, 88 * E, 16 * E, 12 * E, 3 * E);
    ctx.fill();
    ctx.stroke();
}

function _dessinerCorps(ctx, E, t, couleurCorps) {
    const gradient = ctx.createLinearGradient(0, 98 * E, 0, 142 * E);
    if (arcEnCiel) {
        gradient.addColorStop(0, couleurCorps);
        gradient.addColorStop(0.5, couleurCorps);
        gradient.addColorStop(1, C.VIOLET_OMB);
    } else {
        gradient.addColorStop(0, C.VIOLET_VIF);
        gradient.addColorStop(0.5, C.VIOLET_MID);
        gradient.addColorStop(1, C.VIOLET_OMB);
    }

    ctx.fillStyle = gradient;
    ctx.strokeStyle = C.VIOLET_OMB;
    ctx.lineWidth = 1.5 * E;
    _rectArrondi(ctx, 22 * E, 98 * E, 76 * E, 44 * E, 10 * E);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.CIRCUIT_FOND;
    _rectArrondi(ctx, 30 * E, 104 * E, 60 * E, 32 * E, 6 * E);
    ctx.fill();

    const alphaCircuit = 0.4 + Math.sin(t * 0.05) * 0.3;
    ctx.strokeStyle = C.CIRCUIT_LIGNE;
    ctx.globalAlpha = alphaCircuit;
    ctx.lineWidth = 1 * E;

    ctx.beginPath();
    ctx.moveTo(34 * E, 114 * E);
    ctx.lineTo(62 * E, 114 * E);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(34 * E, 126 * E);
    ctx.lineTo(58 * E, 126 * E);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(48 * E, 107 * E);
    ctx.lineTo(48 * E, 133 * E);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60 * E, 109 * E);
    ctx.lineTo(60 * E, 131 * E);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(48 * E, 114 * E, 12 * E, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = alphaCircuit;
    /** @type {[number, number, string][]} */
    const noeudsCircuit = [
        [48, 114, C.CIRCUIT_LIGNE],
        [60, 114, C.CIRCUIT_NODE2],
        [48, 126, C.CIRCUIT_NODE1],
    ];
    for (const [nx, ny, couleur] of noeudsCircuit) {
        ctx.fillStyle = couleur;
        ctx.beginPath();
        ctx.arc(nx * E, ny * E, 2.5 * E, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function _dessinerBrasGauche(ctx, E, angleBras) {
    ctx.save();
    ctx.translate(22 * E, 110 * E);
    ctx.rotate(-angleBras);
    _dessinerRessortBras(ctx, E);
    ctx.restore();
}

function _dessinerBrasDroit(ctx, E, angleBras) {
    ctx.save();
    ctx.translate(98 * E, 110 * E);
    ctx.rotate(angleBras);
    ctx.scale(-1, 1);
    _dessinerRessortBras(ctx, E);
    ctx.restore();
}

function _dessinerRessortBras(ctx, E) {
    const segments = 8;
    const longueur = 30 * E;
    const pas = longueur / segments;
    const amplitude = 5 * E;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5 * E;

    let px = 0;
    let py = 0;
    for (let i = 0; i < segments; i++) {
        const nx = -pas * (i + 1);
        const ny = i % 2 === 0 ? amplitude : -amplitude;
        ctx.strokeStyle = i % 2 === 0 ? C.GRIS_COIL_A : C.GRIS_COIL_B;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        px = nx;
        py = ny;
    }

    ctx.fillStyle = C.VIOLET_MID;
    ctx.strokeStyle = C.VIOLET_OMB;
    ctx.lineWidth = 1 * E;
    _rectArrondi(ctx, -33 * E, -5 * E, 10 * E, 10 * E, 3 * E);
    ctx.fill();
    ctx.stroke();
}

function _dessinerJambes(ctx, E, t) {
    const oscillation = Math.sin(t * 0.1) * 1.5 * E;
    _dessinerJambe(ctx, 46 * E, 142 * E + oscillation, E);
    _dessinerJambe(ctx, 74 * E, 142 * E - oscillation, E);
}

function _dessinerJambe(ctx, x, y, E) {
    const segments = 4;
    const longueur = 13 * E;
    const pas = longueur / segments;
    const amplitude = 3 * E;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.GRIS_COIL_A;
    ctx.lineWidth = 2.5 * E;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < segments; i++) {
        const nx = x + (i % 2 === 0 ? amplitude : -amplitude);
        const ny = y + pas * (i + 1);
        ctx.lineTo(nx, ny);
    }
    ctx.stroke();
}

function _dessinerBottes(ctx, E, couleurTete) {
    for (const botte of [
        { x: 33, y: 154 },
        { x: 63, y: 154 },
    ]) {
        ctx.shadowBlur = 6 * E;
        ctx.shadowColor = C.ROUGE_OMB;
        ctx.fillStyle = couleurTete;
        ctx.strokeStyle = C.ROUGE_OMB;
        ctx.lineWidth = 1 * E;
        _rectArrondi(ctx, botte.x * E, botte.y * E, 24 * E, 13 * E, 5 * E);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function _py(yDesign, E, offsetY, _h) {
    return yDesign * E + offsetY;
}

function _rectArrondi(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

/** @param {HTMLCanvasElement} [canvasElement] */
export function demarrerBoucleRobo(canvasElement) {
    canvasRobo =
        canvasElement ??
        obtenirCanvas('canvas-mascotte') ??
        /** @type {HTMLCanvasElement | null} */ (document.getElementById('canvas-mascotte'));
    if (!canvasRobo) return;
    ctxRobo = canvasRobo.getContext('2d');
    if (!ctxRobo) return;

    const E = canvasRobo.width / 120;

    if (idAnimRobo) cancelAnimationFrame(idAnimRobo);

    function frame() {
        tAnimation++;
        _dessinerRobo(ctxRobo, E, tAnimation);
        idAnimRobo = requestAnimationFrame(frame);
    }
    idAnimRobo = requestAnimationFrame(frame);
    logger.debug('RoboRendu', 'Boucle démarrée');
}

export function arreterBoucleRobo() {
    if (idAnimRobo) {
        cancelAnimationFrame(idAnimRobo);
        idAnimRobo = null;
        logger.debug('RoboRendu', 'Boucle arrêtée');
    }
}

export function definirHumeurRobo(nouvelleHumeur) {
    if (PARAMS_HUMEUR[nouvelleHumeur]) {
        humeur = nouvelleHumeur;
    }
}

export function definirArcEnCiel(actif) {
    arcEnCiel = actif;
}
