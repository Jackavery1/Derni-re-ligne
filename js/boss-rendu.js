import { store } from './store-core.js';
import { obtenirCanvas } from './dom-utils.js';
import { COULEUR_BRAISE, COULEUR_GLACE_B } from './boss-jeu.js';

/** @returns {'calme'|'irrite'|'enrage'|'attaque'|'vaincu'} */
function _obtenirEtatPortraitBoss() {
    if (store.histoire.boss.vaincu) return 'vaincu';
    if (store.histoire.boss._flashAttaque) return 'attaque';
    const boss = store.histoire.boss.actif;
    if (!boss) return 'calme';
    const pct = (store.histoire.boss.pv / boss.pvMax) * 100;
    if (pct > 66) return 'calme';
    if (pct > 33) return 'irrite';
    return 'enrage';
}

function _appliquerClassePortraitBoss(etatPortrait) {
    const canvas = document.getElementById('canvas-boss-portrait');
    if (!canvas) return;
    canvas.classList.remove(
        'etat-calme',
        'etat-irrite',
        'etat-enrage',
        'etat-attaque',
        'etat-vaincu'
    );
    canvas.classList.add(`etat-${etatPortrait}`);
}

/** @param {number} timestamp */
export function rendrePortraitBoss(timestamp) {
    if (typeof document === 'undefined') return;
    const canvas = obtenirCanvas('canvas-boss-portrait');
    if (!canvas || !store.histoire.boss.actif) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const etatPortrait = _obtenirEtatPortraitBoss();
    _appliquerClassePortraitBoss(etatPortrait);
    const t = timestamp / 1000;
    const intensite = etatPortrait === 'enrage' ? 1.6 : etatPortrait === 'irrite' ? 1.25 : 1;

    if (store.histoire.boss.vaincu) {
        _dessinerFragmentationBoss(ctx, w, h, t);
        return;
    }

    const shakeX = etatPortrait === 'enrage' ? Math.sin(t * 22) * 2 : 0;
    const shakeY = etatPortrait === 'enrage' ? Math.cos(t * 19) * 1.5 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.globalAlpha = Math.min(1, 0.85 + (intensite - 1) * 0.15);

    switch (store.histoire.boss.actif.id) {
        case 'brasier':
            _portraitBrasier(ctx, w, h, t, intensite);
            break;
        case 'sentinelle':
            _portraitSentinelle(ctx, w, h, t, intensite);
            break;
        case 'archiviste':
            _portraitArchiviste(ctx, w, h, t, intensite);
            break;
        case 'avantgarde':
            _portraitAvantgarde(ctx, w, h, t, intensite);
            break;
        case 'distorsion':
            _portraitDistorsion(ctx, w, h, t, intensite);
            break;
        default:
            _portraitGenerique(ctx, w, h, t);
            break;
    }
    ctx.restore();

    if (etatPortrait === 'attaque') {
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t */
function _dessinerFragmentationBoss(ctx, w, h, t) {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);
    const couleur = store.histoire.boss.actif?.couleur ?? '#ff006e';
    const fragments = [
        { x: 0.2, y: 0.3, rot: 0.2, s: 0.18 },
        { x: 0.55, y: 0.25, rot: -0.4, s: 0.14 },
        { x: 0.75, y: 0.45, rot: 0.8, s: 0.12 },
        { x: 0.35, y: 0.6, rot: 1.2, s: 0.16 },
        { x: 0.6, y: 0.7, rot: -0.6, s: 0.13 },
    ];
    for (const f of fragments) {
        ctx.save();
        ctx.translate(w * f.x, h * (f.y + t * 0.02));
        ctx.rotate(f.rot + t * 0.5);
        ctx.fillStyle = couleur;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-w * f.s, -h * f.s * 0.6, w * f.s * 2, h * f.s * 1.2);
        ctx.restore();
    }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t @param {number} [intensite] */
function _portraitBrasier(ctx, w, h, t, intensite = 1) {
    const grad = ctx.createRadialGradient(w / 2, h * 0.6, 4, w / 2, h * 0.6, h * 0.65);
    grad.addColorStop(0, '#660800');
    grad.addColorStop(1, '#110000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const pulse = 0.5 + 0.5 * Math.sin(t * 3 * intensite);
    const flammes = [
        { x: w * 0.18, h: h * 0.55 },
        { x: w * 0.35, h: h * 0.45 },
        { x: w * 0.55, h: h * 0.5 },
        { x: w * 0.78, h: h * 0.42 },
    ];
    for (const f of flammes) {
        const variation = 1 + 0.15 * Math.sin(t * 4 + f.x);
        ctx.save();
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 12;
        _dessinerFlamme(ctx, f.x, h * 0.78, f.h * variation);
        ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = '#ff6a00';
    ctx.shadowBlur = 18 + pulse * 10;
    _hexagone(ctx, w / 2, h * 0.52, 24 + pulse * 3, '#cc2200', '#ff4500');
    ctx.restore();

    const eyeY = h * 0.48;
    const eyePulse = 0.7 + 0.3 * Math.sin(t * 5);
    ctx.save();
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255,180,0,${eyePulse})`;
    ctx.beginPath();
    ctx.arc(w * 0.39, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.61, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111100';
    ctx.beginPath();
    ctx.arc(w * 0.39, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.61, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 2;
        const r = 28 + 8 * Math.sin(t * 3 + i);
        const px = w / 2 + Math.cos(angle) * r;
        const py = h * 0.52 + Math.sin(angle) * r * 0.6;
        const a = 0.4 + 0.4 * Math.sin(t * 4 + i * 1.3);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = i % 2 === 0 ? '#ff8800' : '#ffe600';
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        ctx.restore();
    }

    _labelPortrait(ctx, w, h, 'LE BRASIER', '#ff4500');
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t @param {number} [intensite] */
function _portraitSentinelle(ctx, w, h, t, intensite = 1) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#020d14');
    grad.addColorStop(1, '#061828');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const slow = 0.5 + 0.5 * Math.sin(t * 0.8 * intensite);
    const cristaux = [
        { x: w * 0.1, y: h * 0.9, s: 22 },
        { x: w * 0.85, y: h * 0.85, s: 18 },
        { x: w * 0.5, y: h * 0.92, s: 16 },
        { x: w * 0.25, y: h * 0.75, s: 12 },
        { x: w * 0.72, y: h * 0.7, s: 14 },
    ];
    ctx.save();
    ctx.strokeStyle = '#aaeeff44';
    ctx.lineWidth = 1;
    for (const c of cristaux) {
        _triangleCristal(ctx, c.x, c.y, c.s);
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = COULEUR_GLACE_B;
    ctx.shadowBlur = 12 + slow * 8;
    ctx.strokeStyle = COULEUR_GLACE_B;
    ctx.fillStyle = 'rgba(150,230,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.15);
    ctx.lineTo(w * 0.78, h * 0.35);
    ctx.lineTo(w * 0.72, h * 0.68);
    ctx.lineTo(w / 2, h * 0.78);
    ctx.lineTo(w * 0.28, h * 0.68);
    ctx.lineTo(w * 0.22, h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const eyeGlow = 0.5 + 0.5 * Math.sin(t * 1.5);
    ctx.save();
    ctx.shadowColor = COULEUR_GLACE_B;
    ctx.shadowBlur = 14 * eyeGlow;
    ctx.fillStyle = `rgba(160,240,255,${0.6 + 0.4 * eyeGlow})`;
    ctx.beginPath();
    ctx.arc(w * 0.4, h * 0.42, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.6, h * 0.42, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000818';
    ctx.fillRect(w * 0.38, h * 0.41, 4, 4);
    ctx.fillRect(w * 0.58, h * 0.41, 4, 4);
    ctx.restore();

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 0.4;
        const r = 32;
        const fx = w / 2 + Math.cos(angle) * r;
        const fy = h * 0.46 + Math.sin(angle) * r * 0.5;
        const a = 0.2 + 0.2 * Math.sin(t + i);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#cceeff';
        ctx.font = '7px serif';
        ctx.textAlign = 'center';
        ctx.fillText('❄', fx, fy);
        ctx.restore();
    }

    _labelPortrait(ctx, w, h, 'LA SENTINELLE', COULEUR_GLACE_B);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t @param {number} [intensite] */
function _portraitArchiviste(ctx, w, h, t, intensite = 1) {
    ctx.fillStyle = '#0a000f';
    ctx.fillRect(0, 0, w, h);

    const CHARS = '01アヲウ#@%&';
    for (let i = 0; i < 10; i++) {
        const x = (i * 11) % w;
        const y = ((t * 40 + i * 17) % (h + 10)) - 5;
        const a = 0.06 + 0.08 * Math.sin(t + i);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ff00ff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(CHARS[i % CHARS.length], x, y);
        ctx.restore();
    }

    const pulse = 0.5 + 0.5 * Math.sin(t * 6 * intensite);
    const glitchX = Math.sin(t * 13 * intensite) > 0.85 ? 4 : 0;
    ctx.save();
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 16 + pulse * 8;
    ctx.strokeStyle = '#aa00ff';
    ctx.fillStyle = 'rgba(150,0,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.22 + glitchX, h * 0.18, w * 0.56, h * 0.62);
    ctx.fillRect(w * 0.22 + glitchX, h * 0.18, w * 0.56, h * 0.62);
    if (Math.sin(t * 17) > 0.7) {
        ctx.strokeStyle = '#00ffff44';
        ctx.strokeRect(w * 0.22 - glitchX, h * 0.18, w * 0.56, h * 0.62);
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = `rgba(255,0,255,${0.5 + pulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(w * 0.38, h * 0.4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a000f';
    ctx.beginPath();
    ctx.arc(w * 0.38, h * 0.4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const eyeGlitch = Math.sin(t * 11) > 0.6;
    ctx.save();
    ctx.shadowColor = eyeGlitch ? '#00ffff' : '#ff00ff';
    ctx.shadowBlur = eyeGlitch ? 14 : 8;
    ctx.fillStyle = eyeGlitch ? '#00ffff' : '#ff00ff';
    ctx.beginPath();
    if (eyeGlitch) {
        ctx.fillRect(w * 0.57, h * 0.37, 10, 8);
    } else {
        ctx.arc(w * 0.62, h * 0.4, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ff00ff';
    for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();

    _labelPortrait(ctx, w, h, "L'ARCHIVISTE", '#aa00ff');
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t @param {number} [intensite] */
function _portraitAvantgarde(ctx, w, h, t, intensite = 1) {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, w, h);

    const couleurs = ['#ff4500', COULEUR_GLACE_B, '#aa00ff', '#7700ff'];
    const ci = Math.floor((t * 1.5 * intensite) % couleurs.length);
    const coul = couleurs[ci];
    const prochaine = couleurs[(ci + 1) % couleurs.length];

    const r = 28 + 6 * Math.sin(t * 4);
    ctx.save();
    ctx.shadowColor = coul;
    ctx.shadowBlur = 20;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 2;
        const px = w / 2 + Math.cos(angle) * r;
        const py = h * 0.48 + Math.sin(angle) * r * 0.7;
        const a = 0.5 + 0.5 * Math.sin(t * 3 + i);
        ctx.globalAlpha = a;
        ctx.fillStyle = i % 2 === 0 ? coul : prochaine;
        ctx.fillRect(px - 3, py - 3, 6, 6);
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = coul;
    ctx.shadowBlur = 24 + 10 * Math.sin(t * 5);
    ctx.globalAlpha = 0.85;
    _dessinerEtoile(ctx, w / 2, h * 0.48, 14 + 4 * Math.sin(t * 3), coul);
    ctx.restore();

    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + t * 1.5;
        const ex = w / 2 + Math.cos(a) * 16;
        const ey = h * 0.48 + Math.sin(a) * 12;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = couleurs[(ci + i) % couleurs.length];
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _labelPortrait(ctx, w, h, "L'AVANT-GARDE", '#7700ff');
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t @param {number} [intensite] */
function _portraitDistorsion(ctx, w, h, t, intensite = 1) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.48;
    for (let r2 = 5; r2 < 38; r2 += 5) {
        const phase = t * 2 + r2 * 0.3;
        const distRadius = r2 + 3 * Math.sin(phase);
        const alpha = 0.06 + 0.08 * Math.sin(phase + 1);
        ctx.save();
        ctx.strokeStyle = `rgba(255,0,110,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, distRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 22 + 12 * Math.sin(t * 2);
    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2 + t * 1.2;
        const rOuter = 24 + 6 * Math.sin(t * 3 + i * 0.5);
        const px = cx + Math.cos(angle) * rOuter;
        const py = cy + Math.sin(angle) * rOuter * 0.65;
        const alpha = 0.15 + 0.15 * Math.sin(t * 4 + i * 0.8);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff006e';
        ctx.fillRect(px - 1, py - 1, 2, 2);
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,0,110,0.25)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.3;
        const len = 30 + 8 * Math.sin(t * 2 + i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len * 0.7);
        ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    const alpha2 = 0.4 + 0.5 * Math.sin(t * 1.5);
    ctx.globalAlpha = alpha2;
    ctx.fillStyle = '#ff006e';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 16;
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('∞', cx, cy);
    ctx.restore();

    _labelPortrait(ctx, w, h, 'LA DISTORSION', '#ff006e');
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t */
function _portraitGenerique(ctx, w, h, t) {
    ctx.fillStyle = '#08081a';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff006e';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 12;
    ctx.fillText('⚠', w / 2, h * 0.48);
    ctx.restore();
    _labelPortrait(ctx, w, h, 'BOSS', '#ff006e');
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} baseY @param {number} hauteur */
function _dessinerFlamme(ctx, x, baseY, hauteur) {
    ctx.fillStyle = '#cc2200';
    ctx.beginPath();
    ctx.moveTo(x - 6, baseY);
    ctx.quadraticCurveTo(x - 3, baseY - hauteur * 0.4, x, baseY - hauteur);
    ctx.quadraticCurveTo(x + 3, baseY - hauteur * 0.4, x + 6, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(x - 3, baseY);
    ctx.quadraticCurveTo(x, baseY - hauteur * 0.5, x + 3, baseY);
    ctx.closePath();
    ctx.fill();
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} r @param {string} fill @param {string} stroke */
function _hexagone(ctx, x, y, r, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6;
        if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
        else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} baseY @param {number} s */
function _triangleCristal(ctx, x, baseY, s) {
    ctx.beginPath();
    ctx.moveTo(x, baseY - s);
    ctx.lineTo(x - s * 0.5, baseY);
    ctx.lineTo(x + s * 0.5, baseY);
    ctx.closePath();
    ctx.stroke();
}

/** @param {CanvasRenderingContext2D} ctx @param {number} cx @param {number} cy @param {number} r @param {string} couleur */
function _dessinerEtoile(ctx, cx, cy, r, couleur) {
    ctx.fillStyle = couleur;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? r : r * 0.45;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {string} texte @param {string} couleur */
function _labelPortrait(ctx, w, h, texte, couleur) {
    ctx.save();
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = couleur + 'bb';
    ctx.shadowColor = couleur;
    ctx.shadowBlur = 6;
    ctx.fillText(texte, w / 2, h - 6);
    ctx.restore();
}
