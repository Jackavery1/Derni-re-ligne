/** Dessins canvas des personnages cutscene. */
import { dessinerRobo } from './rendu-robo.js';
import { rectArrondiPortrait } from './portraits-cutscene-utils.js';
import { obtenirHumeurRoboCutscene } from './portraits-cutscene-etat.js';
import { dessinerPortraitVeraCanon } from './portrait-vera-rendu.js';
import { dessinerPortraitBrasierCanon } from './portrait-brasier-rendu.js';
import { dessinerPortraitSentinelleCanon } from './portrait-sentinelle-rendu.js';
import { dessinerPortraitArchivisteCanon } from './portrait-archiviste-rendu.js';
import { dessinerPortraitAvantgardeCanon } from './portrait-avantgarde-rendu.js';

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitVera(ctx, w, h, t, params) {
    dessinerPortraitVeraCanon(ctx, w, h, t, params);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitDistorsion(ctx, w, h, t, params) {
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t;
    const vv = /** @type {number} */ (p.vortexVitesse ?? 1);
    const ab = /** @type {number} */ (p.aberrationChrom ?? 1);
    const yeuxRouge = p.yeuxViolet !== true;
    const yeuxViolet = p.yeuxViolet === true;
    const irr = /** @type {number} */ (p.vortexIrregulier ?? 0);
    const unOeil = p.unOeil === true;
    const paupiere = p.paupiere === true;
    const stables = p.fragmentsStables === true;

    const glitchChrom = ab > 0.5 && !effetsReduits && Math.sin(tAnim * 13) > 0.7;
    const glitchBandes = !effetsReduits && Math.sin(tAnim * 0.4) > 0.92 && ab > 0.8;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const dessinerNoyau = (decalX, couleurStroke) => {
        for (let i = 1; i <= 8; i++) {
            const alpha = 0.04 + 0.06 * Math.sin(tAnim * 2 * vv + i * 0.5);
            const wobble =
                irr > 0 ? Math.sin(tAnim * 5 + i) * irr * 4 : Math.sin(tAnim * 3 + i * 0.4);
            const radius = (4 * i + 3 * wobble) * (stables ? 1 : 1);
            ctx.strokeStyle = couleurStroke;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.arc(cx + decalX, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    };

    if (glitchChrom) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        dessinerNoyau(2 * ab, 'rgba(255,0,80,0.8)');
        dessinerNoyau(-2 * ab, 'rgba(0,255,255,0.8)');
        ctx.restore();
    } else {
        const coulNoyau = yeuxViolet ? 'rgba(180,0,255,0.9)' : 'rgba(180,0,255,1)';
        dessinerNoyau(0, coulNoyau);
    }

    const nbFragments = stables ? 8 : 12;
    for (let i = 0; i < nbFragments; i++) {
        const angle = (i / nbFragments) * Math.PI * 2 + tAnim * 1.3 * vv;
        const r = 28 + 6 * Math.sin(tAnim * 2 * vv + i * 0.8);
        const couleurs = ['#ff006e', '#b400ff', '#00ffcc'];
        ctx.globalAlpha = effetsReduits ? 0.2 : 0.15 + 0.15 * Math.sin(tAnim * 3 * vv + i * 1.1);
        ctx.fillStyle = yeuxViolet ? '#b400ff' : couleurs[i % 3];
        ctx.fillRect(cx + Math.cos(angle) * r - 2, cy + Math.sin(angle) * r - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + tAnim * 0.4 * vv;
        const longueur = 28 + 8 * Math.sin(tAnim * 2 * vv + i);
        ctx.strokeStyle = 'rgba(255,0,110,0.2)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * longueur, cy + Math.sin(angle) * longueur);
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(effetsReduits ? 0 : Math.sin(tAnim * 0.3) * 0.05);
    ctx.globalAlpha = effetsReduits ? 0.7 : 0.4 + 0.5 * Math.sin(tAnim * 1.5 * vv);
    ctx.fillStyle = yeuxViolet ? '#b400ff' : yeuxRouge ? '#ff006e' : '#b400ff';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = effetsReduits ? 12 : 16 + 12 * Math.sin(tAnim * 2);
    ctx.fillText(unOeil ? '◉' : '∞', 0, 0);
    if (paupiere && !effetsReduits) {
        ctx.fillStyle = '#000';
        ctx.fillRect(-14, -6, 28, 8);
    }
    ctx.restore();

    if (glitchBandes) {
        for (let b = 0; b < 6; b++) {
            const yBande = effetsReduits ? (b * 17) % h : ((b * 17 + tAnim * 40) % h) | 0;
            ctx.fillStyle = b % 2 === 0 ? 'rgba(0,255,255,0.2)' : 'rgba(255,0,110,0.2)';
            ctx.fillRect(0, yBande, w, 1 + (b % 2));
        }
    }
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitSysteme(ctx, w, h, t, params) {
    const p = params ?? {};
    const alerte = p.alerte === true;
    const clign = /** @type {number} */ (p.clignotement ?? 1);
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t;
    ctx.fillStyle = alerte ? '#1a0000' : '#000d00';
    ctx.fillRect(0, 0, w, h);
    if (alerte) {
        ctx.strokeStyle = 'rgba(255,40,40,0.55)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, w - 4, h - 4);
    }
    for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, y, w, 1);
    }

    ctx.save();
    const coulSys = alerte ? '#ff3333' : '#00ff44';
    ctx.shadowColor = coulSys;
    ctx.shadowBlur = alerte ? 12 : 8;
    ctx.strokeStyle = alerte ? 'rgba(255,60,60,0.75)' : 'rgba(0,255,68,0.6)';
    ctx.lineWidth = 1;
    rectArrondiPortrait(ctx, 8, 8, w - 16, h - 16, 4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,20,0,0.8)';
    ctx.fill();

    const coins = [
        [8, 8],
        [w - 12, 8],
        [8, h - 12],
        [w - 12, h - 12],
    ];
    ctx.fillStyle = coulSys;
    coins.forEach(([x, y]) => ctx.fillRect(x, y, 4, 4));

    ctx.font = '7px "Courier New", monospace';
    ctx.fillStyle = alerte ? 'rgba(255,80,80,0.9)' : 'rgba(0,255,68,0.7)';
    const lignes = alerte
        ? ['> ALERTE', '> ANOMALIE', '> SIGNAL ROUGE']
        : ['> SYSTÈME', '> INIT OK', '> MODE ACTIF'];
    lignes.forEach((ligne, i) => {
        ctx.fillText(ligne, 16, 28 + i * 12);
    });

    const prog = (w - 32) * (effetsReduits ? 0.65 : 0.5 + 0.5 * Math.sin(tAnim * 0.5));
    ctx.globalAlpha = effetsReduits ? 0.7 : 0.5 + 0.5 * Math.sin(tAnim * 1.2 * clign);
    ctx.fillStyle = coulSys;
    ctx.fillRect(16, h - 28, prog, 4);
    ctx.globalAlpha = 1;

    const clignotant = effetsReduits ? true : Math.floor(tAnim * 2 * clign) % 2 === 0;
    if (clignotant) {
        ctx.fillStyle = coulSys;
        ctx.fillRect(16, h - 42, 6, 8);
    }
    ctx.restore();
}

function _portraitNarrateur(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < 4; i++) {
        const r = 15 + i * 10 + Math.sin(t * 0.8 + i * 0.5) * 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.04 - i * 0.007})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + t * 0.2;
        const r = 38;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.2 * Math.sin(t + i)})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.15);
    ctx.globalAlpha = 0.55 + 0.3 * Math.sin(t * 1.2);
    ctx.fillStyle = '#fff';
    ctx.font = '32px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 16;
    ctx.fillText('✦', 0, 0);
    ctx.restore();
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitBrasier(ctx, w, h, t, defaite = false, params) {
    const p = { ...(params ?? {}), vacillant: params?.vacillant === true || defaite };
    dessinerPortraitBrasierCanon(ctx, w, h, t, p);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitSentinelle(ctx, w, h, t, defaite = false, params) {
    const p = { ...(params ?? {}), vacillant: params?.vacillant === true || defaite };
    dessinerPortraitSentinelleCanon(ctx, w, h, t, p);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitArchiviste(ctx, w, h, t, params) {
    dessinerPortraitArchivisteCanon(ctx, w, h, t, params);
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitAvantgarde(ctx, w, h, t, params) {
    dessinerPortraitAvantgardeCanon(ctx, w, h, t, params);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} personnageId
 * @param {number} t
 * @param {{ humeur?: string, params?: Record<string, number | boolean | number[]> | null }} [options]
 */
export function dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t, options = {}) {
    ctx.clearRect(0, 0, w, h);
    const params = options.params ?? null;
    const humeur = options.humeur ?? 'neutre';

    switch (personnageId) {
        case 'robo':
            dessinerRobo(ctx, w, h, obtenirHumeurRoboCutscene(), t);
            break;
        case 'vera':
            _portraitVera(ctx, w, h, t, params);
            break;
        case 'distorsion':
            _portraitDistorsion(ctx, w, h, t, params);
            break;
        case 'systeme':
            _portraitSysteme(ctx, w, h, t, params);
            break;
        case 'brasier':
            _portraitBrasier(ctx, w, h, t, humeur === 'vacillant', params);
            break;
        case 'brasier_voix':
            _portraitBrasier(ctx, w, h, t, humeur !== 'calme' && humeur !== 'agressif', params);
            break;
        case 'sentinelle':
            _portraitSentinelle(ctx, w, h, t, humeur === 'vacillant', params);
            break;
        case 'sentinelle_voix':
            _portraitSentinelle(ctx, w, h, t, humeur !== 'calme' && humeur !== 'agressif', params);
            break;
        case 'archiviste':
        case 'archiviste_voix':
            _portraitArchiviste(ctx, w, h, t, params);
            break;
        case 'avantgarde':
        case 'avantgarde_voix':
            _portraitAvantgarde(ctx, w, h, t, params);
            break;
        default:
            _portraitNarrateur(ctx, w, h, t);
            break;
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} bossId
 * @param {number} t
 * @param {{ vacillant?: boolean, intensite?: number, vitesseAnim?: number, echelle?: number, effetsReduits?: boolean }} [options]
 */
export function dessinerPortraitBossCombat(ctx, w, h, bossId, t, options = {}) {
    const params = {
        vacillant: options.vacillant === true,
        vitesseAnim: options.vitesseAnim ?? 1,
        glow: options.intensite ?? 1,
        echelle: options.echelle ?? 1,
        effetsReduits: options.effetsReduits === true,
    };
    const defaite = params.vacillant;

    switch (bossId) {
        case 'brasier':
            _portraitBrasier(ctx, w, h, t, defaite, params);
            break;
        case 'sentinelle':
            _portraitSentinelle(ctx, w, h, t, defaite, params);
            break;
        case 'archiviste':
            _portraitArchiviste(ctx, w, h, t, params);
            break;
        case 'avantgarde':
            _portraitAvantgarde(ctx, w, h, t, params);
            break;
        case 'distorsion':
            _portraitDistorsion(ctx, w, h, t, params);
            break;
        default:
            _portraitNarrateur(ctx, w, h, t);
            break;
    }
}
