import { dessinerRobo } from './rendu-robo.js';
import { logger } from './logger.js';

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */
let _humeurRoboCutscene = 'content';

export function definirHumeurRoboCutscene(humeur) {
    _humeurRoboCutscene = humeur;
}

function _rectArrondiPortrait(ctx, x, y, largeur, hauteur, rayon) {
    const r = Math.min(rayon, largeur / 2, hauteur / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + largeur - r, y);
    ctx.quadraticCurveTo(x + largeur, y, x + largeur, y + r);
    ctx.lineTo(x + largeur, y + hauteur - r);
    ctx.quadraticCurveTo(x + largeur, y + hauteur, x + largeur - r, y + hauteur);
    ctx.lineTo(x + r, y + hauteur);
    ctx.quadraticCurveTo(x, y + hauteur, x, y + hauteur - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function _interpolerCouleurPortrait(c1, c2, frac) {
    const p = (hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
    const a = p(c1);
    const b = p(c2);
    const m = a.map((v, i) => Math.round(v + (b[i] - v) * frac));
    return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function _portraitVera(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const glitch = Math.sin(t * 0.7) > 0.85;
    const respiration = 0.99 + Math.sin(t * 1.2) * 0.01;

    const grad = ctx.createRadialGradient(cx, cy - 15, 0, cx, cy, w * 0.55);
    grad.addColorStop(0, 'rgba(80,0,40,0.55)');
    grad.addColorStop(1, 'rgba(40,0,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(respiration, respiration);
    ctx.translate(-cx, -cy);
    if (glitch) ctx.translate(2 + Math.sin(t * 20) * 1, 0);

    ctx.fillStyle = 'rgba(255,0,110,0.08)';
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff337a';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - 14 + i * 5 + Math.sin(i * 1.7) * 2, cy - 26 + Math.sin(i) * 2, 5, 4);
    }

    ctx.fillStyle = '#ffaad4';
    _rectArrondiPortrait(ctx, cx - 14, cy - 10, 8, 5, 2);
    ctx.fill();
    _rectArrondiPortrait(ctx, cx + 6, cy - 10, 8, 5, 2);
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

    if (glitch) {
        ctx.fillStyle = 'rgba(0,255,255,0.3)';
        ctx.fillRect(4, cy - 20, w - 8, 3);
    }
    ctx.restore();

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 0.6;
        const r = 32 + Math.sin(t + i * 1.3) * 4;
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#ff006e';
        ctx.fillRect(cx + Math.cos(angle) * r - 1, cy + Math.sin(angle) * r - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
}

function _portraitDistorsion(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const glitchChrom = Math.sin(t * 13) > 0.7;
    const glitchBandes = Math.sin(t * 0.4) > 0.92;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const dessinerNoyau = (decalX, couleurStroke) => {
        for (let i = 1; i <= 8; i++) {
            const alpha = 0.04 + 0.06 * Math.sin(t * 2 + i * 0.5);
            const radius = 4 * i + 3 * Math.sin(t * 3 + i * 0.4);
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
        dessinerNoyau(2, 'rgba(255,0,80,0.8)');
        dessinerNoyau(-2, 'rgba(0,255,255,0.8)');
        ctx.restore();
    } else {
        dessinerNoyau(0, 'rgba(180,0,255,1)');
    }

    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 1.3;
        const r = 28 + 6 * Math.sin(t * 2 + i * 0.8);
        const couleurs = ['#ff006e', '#b400ff', '#00ffcc'];
        ctx.globalAlpha = 0.15 + 0.15 * Math.sin(t * 3 + i * 1.1);
        ctx.fillStyle = couleurs[i % 3];
        ctx.fillRect(cx + Math.cos(angle) * r - 2, cy + Math.sin(angle) * r - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.4;
        const longueur = 28 + 8 * Math.sin(t * 2 + i);
        ctx.strokeStyle = 'rgba(255,0,110,0.2)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * longueur, cy + Math.sin(angle) * longueur);
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(t * 0.3) * 0.05);
    ctx.globalAlpha = 0.4 + 0.5 * Math.sin(t * 1.5);
    ctx.fillStyle = '#ff006e';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 16 + 12 * Math.sin(t * 2);
    ctx.fillText('∞', 0, 0);
    ctx.restore();

    if (glitchBandes) {
        for (let b = 0; b < 6; b++) {
            const yBande = ((b * 17 + t * 40) % h) | 0;
            ctx.fillStyle = b % 2 === 0 ? 'rgba(0,255,255,0.2)' : 'rgba(255,0,110,0.2)';
            ctx.fillRect(0, yBande, w, 1 + (b % 2));
        }
    }
}

function _portraitSysteme(ctx, w, h, t) {
    ctx.fillStyle = '#000d00';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, y, w, 1);
    }

    ctx.save();
    ctx.shadowColor = '#00ff44';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(0,255,68,0.6)';
    ctx.lineWidth = 1;
    _rectArrondiPortrait(ctx, 8, 8, w - 16, h - 16, 4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,20,0,0.8)';
    ctx.fill();

    const coins = [
        [8, 8],
        [w - 12, 8],
        [8, h - 12],
        [w - 12, h - 12],
    ];
    ctx.fillStyle = '#00ff44';
    coins.forEach(([x, y]) => ctx.fillRect(x, y, 4, 4));

    ctx.font = '7px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0,255,68,0.7)';
    ['> SYSTÈME', '> INIT OK', '> MODE ACTIF'].forEach((ligne, i) => {
        ctx.fillText(ligne, 16, 28 + i * 12);
    });

    const prog = (w - 32) * (0.5 + 0.5 * Math.sin(t * 0.5));
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.2);
    ctx.fillStyle = '#00ff44';
    ctx.fillRect(16, h - 28, prog, 4);
    ctx.globalAlpha = 1;

    if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = '#00ff44';
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

function _portraitBrasier(ctx, w, h, t, defaite = false) {
    const cx = w / 2;
    const cy = h / 2;
    const alphaGlobale = defaite ? 0.5 + 0.3 * Math.sin(t * 2) : 1;
    const facteurFlamme = defaite ? 0.4 + 0.3 * Math.sin(t * 1.5) : 1;

    ctx.save();
    ctx.globalAlpha = alphaGlobale;

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
        const r = baseR + Math.sin(t + i) * (defaite ? 4 : 2);
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
        ctx.globalAlpha = (0.6 + 0.4 * Math.sin(t * 3 + f)) * alphaGlobale;
        ctx.lineWidth = defaite ? 2 + Math.sin(t) : 1;
        ctx.beginPath();
        const fx = cx - 12 + f * 12;
        const fh = (15 + 8 * Math.sin(t * 3 + f)) * facteurFlamme;
        ctx.moveTo(fx, cy - 18);
        ctx.quadraticCurveTo(fx + 4, cy - 18 - fh, fx + 8, cy - 18 - fh * 0.6);
        ctx.stroke();
    }
    ctx.globalAlpha = alphaGlobale;

    for (let f = 0; f < 4; f++) {
        ctx.strokeStyle = '#ff8800';
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3 + f);
        ctx.lineWidth = defaite ? 2 + Math.sin(t) : 1;
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
        const prog = defaite ? (t * 0.8 + i * 0.17) % 1 : (t * 0.5 + i * 0.17) % 1;
        const py = h * 0.8 - prog * h * 0.6;
        const px = cx + (i - 3) * 8 + Math.sin(t + i) * 2;
        ctx.globalAlpha = (1 - prog) * alphaGlobale;
        ctx.fillStyle = i % 2 === 0 ? '#ff8800' : '#ffcc00';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function _portraitSentinelle(ctx, w, h, t, defaite = false) {
    const cx = w / 2;
    const cy = h / 2;
    const alphaGlobale = defaite ? 0.8 - 0.1 * Math.sin(t * 0.5) : 1;

    ctx.save();
    ctx.globalAlpha = alphaGlobale;

    const gradFond = ctx.createLinearGradient(0, 0, 0, h);
    gradFond.addColorStop(0, '#030a14');
    gradFond.addColorStop(1, '#050f1f');
    ctx.fillStyle = gradFond;
    ctx.fillRect(0, 0, w, h);

    const rHex = 28;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const ecart = defaite ? Math.sin(t + i) * 3 : 0;
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
    ctx.shadowBlur = 12 + 8 * Math.sin(t * 0.8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const ecart = defaite ? Math.sin(t + i) * 3 : 0;
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
        const angle = (i / 5) * Math.PI * 2 + t * 0.3;
        const orbit = defaite ? 35 + Math.sin(t + i) * 8 : 35;
        const fx = cx + Math.cos(angle) * orbit;
        const fy = cy + Math.sin(angle) * orbit;
        ctx.strokeStyle = '#cceeff';
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = (0.2 + 0.15 * Math.sin(t + i)) * alphaGlobale;
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
        const py = (i * 13 + t * 8) % h;
        ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.3 * Math.sin(t + i * 2.1)})`;
        ctx.beginPath();
        ctx.arc(cx - 28 + i * 7, py, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    if (defaite) {
        for (let e = 0; e < 6; e++) {
            const angle = (e / 6) * Math.PI * 2 + t * 0.5;
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

function _portraitArchiviste(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const glitchGlobal = Math.sin(t * 17) > 0.7;

    ctx.fillStyle = '#0a000f';
    ctx.fillRect(0, 0, w, h);

    const chars = ['0', '1', 'A', 'F', '@', '#'];
    ctx.font = '6px monospace';
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(255,0,255,${0.08 + 0.04 * (i % 3)})`;
        ctx.fillText(chars[i % chars.length], (i * 13) % w, ((t * 40 + i * 17) % (h + 10)) - 5);
    }

    ctx.save();
    if (glitchGlobal) ctx.translate(Math.sin(t * 31) * 2, 0);

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
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    if (Math.sin(t * 11) > 0.5) {
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

function _portraitAvantgarde(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const couleurs = ['#ff4500', '#aaeeff', '#ff00ff', '#7700ff'];
    const tCycle = (t * 0.3) % 1;
    const idx = Math.floor(tCycle * 4) % 4;
    const frac = (tCycle * 4) % 1;
    const coulActuelle = _interpolerCouleurPortrait(couleurs[idx], couleurs[(idx + 1) % 4], frac);

    const gradNeb = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
    gradNeb.addColorStop(0, 'rgba(100,0,255,0.06)');
    gradNeb.addColorStop(1, 'transparent');
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = gradNeb;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + t * 2.5;
        const r = 28 + 5 * Math.sin(t * 2 + i * 0.5);
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3 + i * 0.8);
        ctx.fillStyle = couleurs[i % 4];
        ctx.fillRect(cx + Math.cos(angle) * r - 1.5, cy + Math.sin(angle) * r - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.5);
    ctx.shadowColor = coulActuelle;
    ctx.shadowBlur = 16 + 10 * Math.sin(t * 4);
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
        if (Math.sin(t * 0.5 + i * 2) > -0.2) {
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
        ctx.arc(cx, cy, r + Math.sin(t * 0.3 + i) * 2, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function _dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t) {
    ctx.clearRect(0, 0, w, h);

    switch (personnageId) {
        case 'robo':
            dessinerRobo(ctx, w, h, _humeurRoboCutscene, t);
            break;
        case 'vera':
            _portraitVera(ctx, w, h, t);
            break;
        case 'distorsion':
            _portraitDistorsion(ctx, w, h, t);
            break;
        case 'systeme':
            _portraitSysteme(ctx, w, h, t);
            break;
        case 'brasier':
            _portraitBrasier(ctx, w, h, t, false);
            break;
        case 'brasier_voix':
            _portraitBrasier(ctx, w, h, t, true);
            break;
        case 'sentinelle':
            _portraitSentinelle(ctx, w, h, t, false);
            break;
        case 'sentinelle_voix':
            _portraitSentinelle(ctx, w, h, t, true);
            break;
        case 'archiviste':
            _portraitArchiviste(ctx, w, h, t);
            break;
        case 'avantgarde':
            _portraitAvantgarde(ctx, w, h, t);
            break;
        default:
            _portraitNarrateur(ctx, w, h, t);
            break;
    }
}

export function dessinerPortraitCutscene(ctx, w, h, personnageId, t) {
    try {
        _dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t);
    } catch (err) {
        logger.warn('[portraits-cutscene] erreur rendu :', err);
        ctx.clearRect(0, 0, w, h);
    }
}
