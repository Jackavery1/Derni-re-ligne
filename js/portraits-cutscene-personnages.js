/** Dessins canvas des personnages cutscene. */
import { dessinerRobo } from './rendu-robo.js';
import { rectArrondiPortrait, interpolerCouleurPortrait } from './portraits-cutscene-utils.js';
import { obtenirHumeurRoboCutscene } from './portraits-cutscene-etat.js';

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitVera(ctx, w, h, t, params) {
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t;
    const fv = /** @type {number} */ (p.fragmentVitesse ?? 0.6);
    const fr = /** @type {number} */ (p.fragmentRayon ?? 1);
    const lr = /** @type {number} */ (p.lueurRose ?? 1);
    const incl = /** @type {number} */ (p.inclinaison ?? 0);
    const sourcils = p.sourcils === true;
    const scanline = /** @type {number} */ (p.scanline ?? 1);
    const glitchAleatoire = p.glitchAleatoire !== false && !p.glitchBandes;
    const glitchBandes = p.glitchBandes === true;
    const decalages = /** @type {number[]} */ (p.decalagesGlitch ?? [0, 0, 0]);

    const glitch = glitchBandes ? false : glitchAleatoire ? Math.sin(tAnim * 0.7) > 0.85 : false;
    const respiration = effetsReduits ? 1 : 0.99 + Math.sin(tAnim * 1.2) * 0.01;

    const grad = ctx.createRadialGradient(cx, cy - 15, 0, cx, cy, w * 0.55);
    grad.addColorStop(0, `rgba(80,0,40,${0.55 * lr})`);
    grad.addColorStop(1, 'rgba(40,0,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(incl);
    ctx.scale(respiration, respiration);
    ctx.translate(-cx, -cy);
    if (glitch && !effetsReduits) ctx.translate(2 + Math.sin(tAnim * 20) * 1, 0);
    if (glitchBandes && effetsReduits) {
        ctx.fillStyle = 'rgba(0,255,255,0.25)';
        ctx.fillRect(4, cy - 20, w - 8, 3);
    }

    ctx.fillStyle = 'rgba(255,0,110,0.08)';
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (sourcils) {
        ctx.strokeStyle = '#ff6699';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 22);
        ctx.lineTo(cx - 6, cy - 24);
        ctx.moveTo(cx + 6, cy - 24);
        ctx.lineTo(cx + 12, cy - 22);
        ctx.stroke();
    }

    ctx.fillStyle = '#ff337a';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - 14 + i * 5 + Math.sin(i * 1.7) * 2, cy - 26 + Math.sin(i) * 2, 5, 4);
    }

    ctx.fillStyle = '#ffaad4';
    rectArrondiPortrait(ctx, cx - 14, cy - 10, 8, 5, 2);
    ctx.fill();
    rectArrondiPortrait(ctx, cx + 6, cy - 10, 8, 5, 2);
    ctx.fill();
    ctx.strokeStyle = '#ffaad4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 7);
    ctx.lineTo(cx + 6, cy - 7);
    ctx.stroke();

    ctx.shadowColor = '#ff337a';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ff337a';
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 8, 3, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#ff6699';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 8);
    ctx.quadraticCurveTo(cx - 22, cy + 28, cx - 10, cy + 36);
    ctx.moveTo(cx + 16, cy + 8);
    ctx.quadraticCurveTo(cx + 22, cy + 28, cx + 10, cy + 36);
    ctx.stroke();

    ctx.fillStyle = 'rgba(200,220,240,0.15)';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 10);
    ctx.lineTo(cx + 14, cy + 10);
    ctx.lineTo(cx + 10, cy + 34);
    ctx.lineTo(cx - 10, cy + 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(cx - 4, cy + 14, 8, 6);

    if (glitch && !glitchBandes) {
        ctx.fillStyle = 'rgba(0,255,255,0.3)';
        ctx.fillRect(4, cy - 20, w - 8, 3);
    }
    if (p.visiereLumineuse) {
        ctx.shadowColor = '#ff337a';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#ffaad4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 12, Math.PI, 0);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    if (scanline > 1) {
        ctx.fillStyle = `rgba(0,255,255,${Math.min(0.35, 0.12 * scanline)})`;
        for (let sy = cy - 22; sy < cy + 4; sy += 3) {
            ctx.fillRect(cx - 16, sy, 32, 1);
        }
    }
    ctx.restore();

    if (glitchBandes && !effetsReduits) {
        const bandes = [0, 1, 2];
        bandes.forEach((bi, idx) => {
            const y0 = cy - 28 + bi * 22 + (decalages[idx] ?? 0);
            ctx.save();
            ctx.translate(decalages[idx] ?? 0, 0);
            ctx.fillStyle = 'rgba(255,0,110,0.35)';
            ctx.fillRect(0, y0, w, 18);
            ctx.restore();
        });
    }

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + tAnim * fv;
        const r = (32 + Math.sin(tAnim + i * 1.3) * 4) * fr;
        ctx.globalAlpha = effetsReduits ? 0.35 : 0.25 + 0.2 * Math.sin(tAnim * 2 + i);
        ctx.fillStyle = '#ff006e';
        ctx.fillRect(cx + Math.cos(angle) * r - 1, cy + Math.sin(angle) * r - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
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
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const vacillant = p.vacillant === true || defaite;
    const vitesse = /** @type {number} */ (p.vitesseAnim ?? 1);
    const glow = /** @type {number} */ (p.glow ?? 1);
    const echelle = /** @type {number} */ (p.echelle ?? 1);
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * vitesse;

    const alphaGlobale = vacillant ? (effetsReduits ? 0.75 : 0.5 + 0.3 * Math.sin(tAnim * 2)) : 1;
    const facteurFlamme = vacillant
        ? effetsReduits
            ? 0.55
            : 0.4 + 0.3 * Math.sin(tAnim * 1.5)
        : 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(echelle, echelle);
    ctx.translate(-cx, -cy);

    ctx.globalAlpha = alphaGlobale * glow;

    const gradFond = ctx.createRadialGradient(cx, h * 0.7, 0, cx, cy, w * 0.55);
    gradFond.addColorStop(0, '#1a0500');
    gradFond.addColorStop(1, '#000');
    ctx.fillStyle = gradFond;
    ctx.fillRect(0, 0, w, h);

    const gradLueur = ctx.createRadialGradient(cx, h, 0, cx, h, 60);
    gradLueur.addColorStop(0, 'rgba(255,69,0,0.15)');
    gradLueur.addColorStop(1, 'transparent');
    ctx.fillStyle = gradLueur;
    ctx.fillRect(0, 0, w, h);

    const sommets = 6;
    const baseR = 26;
    ctx.beginPath();
    for (let i = 0; i < sommets; i++) {
        const angle = (i / sommets) * Math.PI * 2 - Math.PI / 2;
        const r = baseR + Math.sin(tAnim + i) * (vacillant ? 4 : 2);
        const px = cx + Math.cos(angle) * r;
        const py = cy + 4 + Math.sin(angle) * r * 0.85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const gradCorps = ctx.createLinearGradient(cx, cy - 20, cx, cy + 30);
    gradCorps.addColorStop(0, '#661100');
    gradCorps.addColorStop(1, '#cc2200');
    ctx.fillStyle = gradCorps;
    ctx.fill();
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let f = 0; f < 3; f++) {
        ctx.strokeStyle = '#ff8800';
        ctx.globalAlpha = (0.6 + 0.4 * Math.sin(tAnim * 3 + f)) * alphaGlobale;
        ctx.lineWidth = vacillant ? 2 + Math.sin(tAnim) : 1;
        ctx.beginPath();
        const fx = cx - 12 + f * 12;
        const fh = (15 + 8 * Math.sin(tAnim * 3 + f)) * facteurFlamme;
        ctx.moveTo(fx, cy - 18);
        ctx.quadraticCurveTo(fx + 4, cy - 18 - fh, fx + 8, cy - 18 - fh * 0.6);
        ctx.stroke();
    }
    ctx.globalAlpha = alphaGlobale;

    for (let f = 0; f < 4; f++) {
        ctx.strokeStyle = '#ff8800';
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(tAnim * 3 + f);
        ctx.lineWidth = vacillant ? 2 + Math.sin(tAnim) : 1;
        ctx.beginPath();
        const a1 = (f / 4) * Math.PI * 2;
        ctx.moveTo(cx, cy + 2);
        ctx.lineTo(cx + Math.cos(a1) * 14, cy + 2 + Math.sin(a1) * 10);
        ctx.lineTo(cx + Math.cos(a1) * 8, cy + 2 + Math.sin(a1) * 16);
        ctx.stroke();
    }
    ctx.globalAlpha = alphaGlobale;

    const gradOeil = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
    gradOeil.addColorStop(0, '#fff');
    gradOeil.addColorStop(0.5, '#ff8800');
    gradOeil.addColorStop(1, '#cc2200');
    ctx.fillStyle = gradOeil;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
        const prog = vacillant ? (tAnim * 0.8 + i * 0.17) % 1 : (tAnim * 0.5 + i * 0.17) % 1;
        const py = h * 0.8 - prog * h * 0.6;
        const px = cx + (i - 3) * 8 + Math.sin(tAnim + i) * 2;
        ctx.globalAlpha = (1 - prog) * alphaGlobale;
        ctx.fillStyle = i % 2 === 0 ? '#ff8800' : '#ffcc00';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitSentinelle(ctx, w, h, t, defaite = false, params) {
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const vacillant = p.vacillant === true || defaite;
    const vitesse = /** @type {number} */ (p.vitesseAnim ?? 1);
    const glow = /** @type {number} */ (p.glow ?? 1);
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * vitesse;
    const alphaGlobale = vacillant ? (effetsReduits ? 0.85 : 0.8 - 0.1 * Math.sin(tAnim * 0.5)) : 1;

    ctx.save();
    ctx.globalAlpha = alphaGlobale * glow;

    const gradFond = ctx.createLinearGradient(0, 0, 0, h);
    gradFond.addColorStop(0, '#030a14');
    gradFond.addColorStop(1, '#050f1f');
    ctx.fillStyle = gradFond;
    ctx.fillRect(0, 0, w, h);

    const rHex = 28;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const ecart = vacillant ? Math.sin(tAnim + i) * 3 : 0;
        const px = cx + Math.cos(angle) * (rHex + ecart);
        const py = cy + Math.sin(angle) * (rHex + ecart);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(170,220,255,0.12)';
    ctx.fill();
    ctx.strokeStyle = '#aaeeff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#aaeeff';
    ctx.shadowBlur = effetsReduits ? 12 : 12 + 8 * Math.sin(tAnim * 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const ecart = vacillant ? Math.sin(tAnim + i) * 3 : 0;
        ctx.strokeStyle = 'rgba(170,238,255,0.25)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * (rHex + ecart), cy + Math.sin(angle) * (rHex + ecart));
        ctx.stroke();
    }

    ctx.fillStyle = '#aaeeff';
    ctx.shadowColor = '#aaeeff';
    ctx.shadowBlur = 8;
    ctx.fillRect(cx - 13, cy - 9, 10, 8);
    ctx.fillRect(cx + 3, cy - 9, 10, 8);
    ctx.fillStyle = 'rgba(10,30,50,0.85)';
    ctx.fillRect(cx - 13, cy - 5, 10, 2);
    ctx.fillRect(cx + 3, cy - 5, 10, 2);
    ctx.shadowBlur = 0;

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + tAnim * 0.3;
        const orbit = vacillant ? 35 + Math.sin(tAnim + i) * 8 : 35;
        const fx = cx + Math.cos(angle) * orbit;
        const fy = cy + Math.sin(angle) * orbit;
        ctx.strokeStyle = '#cceeff';
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = (effetsReduits ? 0.25 : 0.2 + 0.15 * Math.sin(tAnim + i)) * alphaGlobale;
        for (let b = 0; b < 3; b++) {
            const a = angle + (b / 3) * Math.PI * 2;
            const br = 6 + (i % 3);
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(a) * br, fy + Math.sin(a) * br);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = alphaGlobale;

    for (let i = 0; i < 8; i++) {
        const py = effetsReduits ? (i * 13) % h : (i * 13 + tAnim * 8) % h;
        ctx.fillStyle = `rgba(255,255,255,${effetsReduits ? 0.45 : 0.4 + 0.3 * Math.sin(tAnim + i * 2.1)})`;
        ctx.beginPath();
        ctx.arc(cx - 28 + i * 7, py, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    if (vacillant) {
        for (let e = 0; e < 6; e++) {
            const angle = (e / 6) * Math.PI * 2 + tAnim * 0.5;
            ctx.fillStyle = 'rgba(170,220,255,0.35)';
            ctx.fillRect(
                cx + Math.cos(angle) * (40 + e * 2) - 1,
                cy + Math.sin(angle) * (40 + e * 2) - 1,
                3,
                2
            );
        }
    }
    ctx.restore();
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitArchiviste(ctx, w, h, t, params) {
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const vacillant = p.vacillant === true;
    const vitesse = /** @type {number} */ (p.vitesseAnim ?? 1);
    const glow = /** @type {number} */ (p.glow ?? 1);
    const echelle = /** @type {number} */ (p.echelle ?? 1);
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * vitesse;
    const alphaGlobale = vacillant ? (effetsReduits ? 0.8 : 0.7 + 0.2 * Math.sin(tAnim * 2)) : 1;
    const glitchGlobal = !effetsReduits && Math.sin(tAnim * 17) > 0.7;

    ctx.fillStyle = '#0a000f';
    ctx.fillRect(0, 0, w, h);

    const chars = ['0', '1', 'A', 'F', '@', '#'];
    ctx.font = '6px monospace';
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(255,0,255,${0.08 + 0.04 * (i % 3)})`;
        ctx.fillText(
            chars[i % chars.length],
            (i * 13) % w,
            effetsReduits ? (i * 17) % h : ((tAnim * 40 + i * 17) % (h + 10)) - 5
        );
    }

    ctx.save();
    ctx.globalAlpha = alphaGlobale * glow;
    ctx.translate(cx, cy);
    ctx.scale(echelle, echelle);
    ctx.translate(-cx, -cy);
    if (glitchGlobal) ctx.translate(Math.sin(tAnim * 31) * 2, 0);

    ctx.strokeStyle = '#aa00ff';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(150,0,255,0.08)';
    ctx.fillRect(cx - 26, cy - 31, 52, 62);
    ctx.strokeRect(cx - 26, cy - 31, 52, 62);
    ctx.clearRect(cx - 26, cy - 20, 10, 3);
    ctx.clearRect(cx + 10, cy + 10, 12, 3);
    ctx.clearRect(cx - 8, cy + 22, 8, 3);

    ctx.fillStyle = '#0a000f';
    ctx.fillRect(cx - 18, cy - 30, 36, 24);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 18, cy - 30, 36, 24);
    for (let sy = cy - 30; sy < cy - 6; sy += 2) {
        ctx.fillStyle = 'rgba(255,0,255,0.05)';
        ctx.fillRect(cx - 18, sy, 36, 1);
    }
    ctx.font = '8px monospace';
    ctx.fillStyle = '#ff00ff';
    ctx.textAlign = 'center';
    ctx.fillText('ERR', cx, cy - 16);

    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff00ff';
    ctx.globalAlpha = effetsReduits ? 0.75 : 0.5 + 0.5 * Math.sin(tAnim * 4);
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    if (effetsReduits || Math.sin(tAnim * 11) > 0.5) {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(cx + 4, cy - 7, 8, 5);
    } else {
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 4, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(255,0,255,0.3)';
    ctx.lineWidth = 1;
    [
        [cx - 10, cy + 31, cx - 20, cy + 44],
        [cx, cy + 31, cx + 5, cy + 46],
        [cx + 10, cy + 31, cx + 22, cy + 42],
    ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1, y1 + 8, x2, y2 - 6, x2, y2);
        ctx.stroke();
    });
    ctx.restore();
}

/** @param {Record<string, number | boolean | number[]> | null | undefined} params */
function _portraitAvantgarde(ctx, w, h, t, params) {
    const cx = w / 2;
    const cy = h / 2;
    const p = params ?? {};
    const vacillant = p.vacillant === true;
    const vitesse = /** @type {number} */ (p.vitesseAnim ?? 1);
    const glow = /** @type {number} */ (p.glow ?? 1);
    const echelle = /** @type {number} */ (p.echelle ?? 1);
    const effetsReduits = p.effetsReduits === true;
    const tAnim = effetsReduits ? 0 : t * vitesse;
    const alphaGlobale = vacillant ? (effetsReduits ? 0.8 : 0.7 + 0.25 * Math.sin(tAnim * 2.2)) : 1;
    const couleurs = ['#ff4500', '#aaeeff', '#ff00ff', '#7700ff'];
    const tCycle = effetsReduits ? 0.25 : (tAnim * 0.3) % 1;
    const idx = Math.floor(tCycle * 4) % 4;
    const frac = (tCycle * 4) % 1;
    const coulActuelle = interpolerCouleurPortrait(couleurs[idx], couleurs[(idx + 1) % 4], frac);

    const gradNeb = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
    gradNeb.addColorStop(0, 'rgba(100,0,255,0.06)');
    gradNeb.addColorStop(1, 'transparent');
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = gradNeb;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + tAnim * 2.5;
        const r = 28 + 5 * Math.sin(tAnim * 2 + i * 0.5);
        ctx.globalAlpha =
            (effetsReduits ? 0.5 : 0.4 + 0.3 * Math.sin(tAnim * 3 + i * 0.8)) * alphaGlobale;
        ctx.fillStyle = couleurs[i % 4];
        ctx.fillRect(cx + Math.cos(angle) * r - 1.5, cy + Math.sin(angle) * r - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.globalAlpha = alphaGlobale * glow;
    ctx.translate(cx, cy);
    ctx.scale(echelle, echelle);
    ctx.rotate(effetsReduits ? 0 : tAnim * 0.5);
    ctx.shadowColor = coulActuelle;
    ctx.shadowBlur = effetsReduits ? 16 : 16 + 10 * Math.sin(tAnim * 4);
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = i % 2 === 0 ? 30 : 15;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const gradEtoile = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    gradEtoile.addColorStop(0, coulActuelle);
    gradEtoile.addColorStop(1, 'transparent');
    ctx.fillStyle = gradEtoile;
    ctx.fill();
    ctx.strokeStyle = coulActuelle;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const yeux = [
        [0, -6],
        [-6, 4],
        [6, 4],
    ];
    yeux.forEach(([ox, oy], i) => {
        if (effetsReduits || Math.sin(tAnim * 0.5 + i * 2) > -0.2) {
            ctx.fillStyle = '#fff';
            ctx.shadowColor = coulActuelle;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(ox, oy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();

    [38, 44].forEach((r, i) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + (effetsReduits ? 0 : Math.sin(tAnim * 0.3 + i) * 2), 0, Math.PI * 2);
        ctx.stroke();
    });
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
