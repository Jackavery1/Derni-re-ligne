import { CONFIG, BIOMES } from './config.js';
import {
    particulesAmbiance,
    CARACTERES_HEX,
    obtenirBiomeActif,
    obtenirEffetsReduits,
    obtenirCanvasPlateau,
    obtenirCtx,
} from './store-jeu.js';

const MAX_PARTICULES_AMBIANCE = 40;
let idxParticulesAmbiance = 0;

const HEX_CHARS = CARACTERES_HEX;

function creerParticulAmbiance(props) {
    if (particulesAmbiance.length < MAX_PARTICULES_AMBIANCE) {
        particulesAmbiance.push({
            actif: true,
            age: 0,
            rotation: 0,
            vRot: 0,
            sinPhase: 0,
            scintille: 0,
            char: '',
            ...props,
        });
    } else {
        const p = particulesAmbiance[idxParticulesAmbiance];
        Object.assign(p, {
            actif: true,
            age: 0,
            rotation: 0,
            vRot: 0,
            sinPhase: 0,
            scintille: 0,
            char: '',
            ...props,
        });
        idxParticulesAmbiance = (idxParticulesAmbiance + 1) % MAX_PARTICULES_AMBIANCE;
    }
}

function recyclerParticulAmbiance(p, w, h) {
    switch (p.type) {
        case 'braise':
            p.x = Math.random() * w;
            p.y = h * 0.5 + Math.random() * h * 0.5;
            p.vx = (Math.random() - 0.5) * 0.8;
            p.vy = -(Math.random() * 1.5 + 0.5);
            p.opacite = Math.random() * 0.4 + 0.2;
            p.couleur = `hsl(${Math.random() * 60},100%,${60 + Math.random() * 20}%)`;
            p.age = 0;
            break;
        case 'code_hex':
            p.char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
            p.age = 0;
            p.opacite = Math.random() * 0.12 + 0.03;
            break;
        default:
            p.actif = false;
    }
}

export function initParticulesAmbiance() {
    particulesAmbiance.length = 0;
    idxParticulesAmbiance = 0;

    const canvas = obtenirCanvasPlateau();
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    switch (obtenirBiomeActif()) {
        case 'classique':
            break;

        case 'lave':
            for (let i = 0; i < 20; i++) {
                creerParticulAmbiance({
                    type: 'bulle_lave',
                    x: Math.random() * w,
                    y: h * 0.5 + Math.random() * h * 0.5,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: -(Math.random() * 0.6 + 0.2),
                    taille: Math.random() * 5 + 2,
                    opacite: Math.random() * 0.22 + 0.06,
                    couleur: `hsl(${15 + Math.random() * 20},100%,${45 + Math.random() * 20}%)`,
                    dureeVie: 0,
                });
            }
            break;

        case 'ocean':
            for (let i = 0; i < 25; i++) {
                creerParticulAmbiance({
                    type: 'bulle_eau',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: -(Math.random() * 0.4 + 0.08),
                    taille: Math.random() * 4 + 1.5,
                    opacite: Math.random() * 0.15 + 0.05,
                    couleur: '#00cfff',
                    sinPhase: Math.random() * Math.PI * 2,
                    dureeVie: 0,
                });
            }
            for (let i = 0; i < 3; i++) {
                creerParticulAmbiance({
                    type: 'rayon_eau',
                    x: w * (0.2 + i * 0.3) + (Math.random() - 0.5) * 40,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    opacite: Math.random() * 0.06 + 0.02,
                    couleur: '#00cfff',
                    taille: Math.random() * 15 + 8,
                    dureeVie: 0,
                    sinPhase: Math.random() * Math.PI * 2,
                });
            }
            break;

        case 'foret':
            for (let i = 0; i < 20; i++) {
                creerParticulAmbiance({
                    type: 'feuille',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: Math.random() * 0.5 + 0.15,
                    taille: Math.random() * 6 + 3,
                    opacite: Math.random() * 0.2 + 0.06,
                    couleur: `hsl(${100 + Math.random() * 40},70%,${35 + Math.random() * 20}%)`,
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.04,
                    sinPhase: Math.random() * Math.PI * 2,
                    dureeVie: 0,
                });
            }
            break;

        case 'glace':
            for (let i = 0; i < 30; i++) {
                creerParticulAmbiance({
                    type: 'flocon',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: Math.random() * 0.4 + 0.08,
                    taille: Math.random() * 2.5 + 0.8,
                    opacite: Math.random() * 0.18 + 0.04,
                    couleur: '#ddf4ff',
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.02,
                    sinPhase: Math.random() * Math.PI * 2,
                    dureeVie: 0,
                });
            }
            break;

        case 'desert':
            for (let i = 0; i < 25; i++) {
                creerParticulAmbiance({
                    type: 'grain_sable',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: Math.random() * 1.5 + 0.5,
                    vy: (Math.random() - 0.5) * 0.15,
                    taille: Math.random() * 2 + 0.8,
                    opacite: Math.random() * 0.12 + 0.03,
                    couleur: `hsl(${35 + Math.random() * 15},60%,${55 + Math.random() * 20}%)`,
                    dureeVie: 0,
                });
            }
            break;

        case 'cyber':
            for (let i = 0; i < 18; i++) {
                creerParticulAmbiance({
                    type: 'code_hex',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: 0,
                    vy: Math.random() * 0.8 + 0.3,
                    taille: Math.random() * 3 + 5,
                    opacite: Math.random() * 0.12 + 0.03,
                    couleur: Math.random() > 0.5 ? '#ff00ff' : '#00ffff',
                    char: HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)],
                    age: Math.random() * 2000,
                    dureeVie: 2500 + Math.random() * 1500,
                });
            }
            break;

        case 'fuochi':
            for (let i = 0; i < 5; i++) {
                creerParticulAmbiance({
                    type: 'braise',
                    x: Math.random() * w,
                    y: h * 0.5 + Math.random() * h * 0.5,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -(Math.random() * 1.5 + 0.5),
                    taille: Math.random() * 3 + 1.5,
                    opacite: Math.random() * 0.4 + 0.2,
                    couleur: `hsl(${Math.random() * 60},100%,${60 + Math.random() * 20}%)`,
                    dureeVie: 0,
                });
            }
            break;

        case 'cosmos':
            for (let i = 0; i < 35; i++) {
                creerParticulAmbiance({
                    type: 'etoile_cosmos',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: 0,
                    vy: 0,
                    taille: Math.random() * 1.8 + 0.4,
                    opacite: Math.random() * 0.35 + 0.05,
                    couleur:
                        Math.random() > 0.8 ? `hsl(${Math.random() * 360},70%,85%)` : '#ffffff',
                    scintille: Math.random() * Math.PI * 2,
                    vRot: Math.random() * 0.02 + 0.005,
                    dureeVie: 0,
                });
            }
            break;
    }
}

export function mettreAJourParticulesAmbiance(dt) {
    if (particulesAmbiance.length === 0) return;
    const canvas = obtenirCanvasPlateau();
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const t = performance.now() / 1000;

    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];
        if (!p.actif) continue;

        p.age += dt;
        if (p.dureeVie > 0 && p.age >= p.dureeVie && p.type !== 'code_hex') {
            recyclerParticulAmbiance(p, w, h);
            continue;
        }

        switch (p.type) {
            case 'bulle_lave':
            case 'bulle_eau':
                p.x += p.vx + Math.sin(t * 0.8 + p.sinPhase) * 0.3;
                p.y += p.vy;
                if (p.y < -p.taille) {
                    p.y = h + p.taille;
                    p.x = Math.random() * w;
                    p.opacite = Math.random() * 0.18 + 0.04;
                }
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                break;

            case 'rayon_eau':
                p.opacite = 0.04 + Math.sin(t * 0.3 + p.sinPhase) * 0.02;
                break;

            case 'feuille':
                p.x += p.vx + Math.sin(t * 0.5 + p.sinPhase) * 0.5;
                p.y += p.vy;
                p.rotation += p.vRot;
                if (p.y > h + p.taille) {
                    p.y = -p.taille;
                    p.x = Math.random() * w;
                }
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                break;

            case 'flocon':
                p.x += p.vx + Math.sin(t * 0.4 + p.sinPhase) * 0.4;
                p.y += p.vy;
                p.rotation += p.vRot;
                if (p.y > h + p.taille) {
                    p.y = -p.taille;
                    p.x = Math.random() * w;
                }
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                break;

            case 'grain_sable':
                p.x += p.vx;
                p.y += p.vy;
                if (p.x > w + p.taille) {
                    p.x = -p.taille;
                    p.y = Math.random() * h;
                }
                break;

            case 'code_hex':
                p.y += p.vy;
                if (p.age >= p.dureeVie) {
                    p.char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
                    p.age = 0;
                    p.opacite = Math.random() * 0.12 + 0.03;
                }
                if (p.y > h + 10) {
                    p.y = -10;
                    p.x = Math.random() * w;
                }
                break;

            case 'braise':
                p.x += p.vx;
                p.y += p.vy;
                p.opacite -= 0.003 * (dt / 16);
                if (p.opacite <= 0 || p.y < -p.taille) {
                    recyclerParticulAmbiance(p, w, h);
                }
                break;

            case 'etoile_cosmos':
                p.scintille += p.vRot * (dt / 16);
                p.opacite = Math.max(0.02, 0.15 + Math.sin(p.scintille) * 0.13);
                break;
        }
    }

    if (obtenirBiomeActif() === 'fuochi' && Math.random() < 0.04) {
        creerParticulAmbiance({
            type: 'braise',
            x: Math.random() * w,
            y: h * 0.4 + Math.random() * h * 0.6,
            vx: (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 3 + 1),
            taille: Math.random() * 4 + 1,
            opacite: Math.random() * 0.5 + 0.3,
            couleur: `hsl(${Math.random() * 60},100%,65%)`,
            dureeVie: 0,
        });
    }
}

function dessinerFondLave(ctx2d, w, h, t) {
    const lueur = ctx2d.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.9);
    lueur.addColorStop(0, `rgba(255,69,0,${0.12 + Math.sin(t * 0.7) * 0.05})`);
    lueur.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = lueur;
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.save();
    for (let k = 0; k < 3; k++) {
        ctx2d.beginPath();
        ctx2d.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
            const y =
                h * (0.78 + k * 0.07) + Math.sin((x / w) * Math.PI * 3 + t * (0.4 + k * 0.15)) * 8;
            if (x === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.lineTo(w, h);
        ctx2d.lineTo(0, h);
        ctx2d.closePath();
        ctx2d.fillStyle = `rgba(${180 + k * 20},${40 + k * 10},0,${0.08 - k * 0.02})`;
        ctx2d.fill();
    }
    ctx2d.restore();
}

function dessinerFondOcean(ctx2d, w, h, t) {
    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];
        if (!p.actif || p.type !== 'rayon_eau') continue;
        ctx2d.save();
        const grad = ctx2d.createLinearGradient(p.x - p.taille / 2, 0, p.x + p.taille / 2, h);
        grad.addColorStop(0, `rgba(0,180,255,${p.opacite})`);
        grad.addColorStop(0.6, `rgba(0,100,200,${p.opacite * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = grad;
        ctx2d.transform(1, 0, Math.sin(t * 0.2 + p.sinPhase) * 0.15, 1, 0, 0);
        ctx2d.fillRect(p.x - p.taille / 2, 0, p.taille, h);
        ctx2d.restore();
    }

    ctx2d.save();
    ctx2d.globalAlpha = 0.025;
    ctx2d.fillStyle = '#000000';
    for (let y = 0; y < h; y += 4) {
        ctx2d.fillRect(0, y, w, 1);
    }
    ctx2d.restore();
}

function dessinerFondForet(ctx2d, w, h, t) {
    for (let i = 0; i < 4; i++) {
        const bx = w * (0.15 + i * 0.22) + Math.sin(t * 0.2 + i) * 8;
        const by = h * 0.15 + Math.sin(t * 0.15 + i * 1.3) * 15;
        const br = 25 + Math.sin(t * 0.3 + i * 0.7) * 8;
        const bokeh = ctx2d.createRadialGradient(bx, by, 0, bx, by, br);
        bokeh.addColorStop(0, `rgba(180,230,100,${0.06 + i * 0.01})`);
        bokeh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = bokeh;
        ctx2d.fillRect(0, 0, w, h);
    }
    const brume = ctx2d.createLinearGradient(0, h * 0.7, 0, h);
    brume.addColorStop(0, 'rgba(0,80,20,0)');
    brume.addColorStop(1, 'rgba(0,60,10,0.08)');
    ctx2d.fillStyle = brume;
    ctx2d.fillRect(0, 0, w, h);
}

function dessinerFondGlace(ctx2d, w, h, t) {
    for (let i = 0; i < 3; i++) {
        const ax = w * (0.2 + i * 0.3);
        const ay = h * 0.08;
        const hue = 160 + i * 30;
        const aurora = ctx2d.createRadialGradient(ax, ay, 0, ax, ay, h * 0.35);
        aurora.addColorStop(0, `hsla(${hue},80%,70%,${0.04 + Math.sin(t * 0.3 + i) * 0.02})`);
        aurora.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = aurora;
        ctx2d.fillRect(0, 0, w, h);
    }
    const brume = ctx2d.createLinearGradient(0, h * 0.8, 0, h);
    brume.addColorStop(0, 'rgba(170,220,255,0)');
    brume.addColorStop(1, 'rgba(200,240,255,0.06)');
    ctx2d.fillStyle = brume;
    ctx2d.fillRect(0, 0, w, h);
}

function dessinerFondDesert(ctx2d, w, h, t) {
    const soleil = ctx2d.createRadialGradient(w * 0.75, h * 0.05, 0, w * 0.75, h * 0.05, h * 0.5);
    soleil.addColorStop(0, `rgba(255,200,50,${0.08 + Math.sin(t * 0.4) * 0.02})`);
    soleil.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = soleil;
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.save();
    ctx2d.globalAlpha = 0.015;
    ctx2d.strokeStyle = '#ffaa00';
    ctx2d.lineWidth = 0.5;
    for (let y = h * 0.5; y < h; y += 8) {
        ctx2d.beginPath();
        for (let x = 0; x <= w; x += 4) {
            const dy = Math.sin((x / w) * Math.PI * 6 + t * 1.5) * 1.2;
            if (x === 0) ctx2d.moveTo(x, y + dy);
            else ctx2d.lineTo(x, y + dy);
        }
        ctx2d.stroke();
    }
    ctx2d.restore();
}

function dessinerFondCyber(ctx2d, w, h, t) {
    ctx2d.save();
    ctx2d.globalAlpha = 0.04;
    ctx2d.strokeStyle = '#ff00ff';
    ctx2d.lineWidth = 0.5;
    const espH = 20;
    for (let y = 0; y < h; y += espH) {
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
    }
    for (let x = 0; x < w; x += espH) {
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, h);
        ctx2d.stroke();
    }
    ctx2d.restore();

    const lueur = ctx2d.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.7);
    lueur.addColorStop(0, `rgba(180,0,255,${0.04 + Math.sin(t * 1.2) * 0.02})`);
    lueur.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = lueur;
    ctx2d.fillRect(0, 0, w, h);
}

function dessinerFondFuochi(ctx2d, w, h, t) {
    const coulsFuochi = [
        { hx: w * 0.2, hy: h * 0.3, coul: '#ff2244' },
        { hx: w * 0.8, hy: h * 0.2, coul: '#ffe600' },
        { hx: w * 0.5, hy: h * 0.6, coul: '#00aaff' },
    ];
    for (let i = 0; i < coulsFuochi.length; i++) {
        const { hx, hy, coul } = coulsFuochi[i];
        const halo = ctx2d.createRadialGradient(
            hx + Math.sin(t * 0.4) * 15,
            hy + Math.cos(t * 0.3) * 10,
            0,
            hx,
            hy,
            h * 0.4
        );
        halo.addColorStop(
            0,
            `${coul}${Math.floor(8 + Math.sin(t) * 3)
                .toString(16)
                .padStart(2, '0')}`
        );
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = halo;
        ctx2d.fillRect(0, 0, w, h);
    }
}

function dessinerFondCosmos(ctx2d, w, h, t) {
    const neb = ctx2d.createRadialGradient(
        w / 2 + Math.sin(t * 0.1) * 20,
        h / 2 + Math.cos(t * 0.08) * 15,
        0,
        w / 2,
        h / 2,
        h * 0.65
    );
    neb.addColorStop(0, `rgba(80,0,200,${0.08 + Math.sin(t * 0.2) * 0.02})`);
    neb.addColorStop(0.4, `rgba(0,50,180,${0.04 + Math.sin(t * 0.15) * 0.01})`);
    neb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = neb;
    ctx2d.fillRect(0, 0, w, h);
}

function dessinerParticulesAmbiance() {
    if (obtenirEffetsReduits() || particulesAmbiance.length === 0) return;
    const ctx = obtenirCtx();
    ctx.save();

    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];
        if (!p.actif || p.type === 'rayon_eau') continue;
        ctx.globalAlpha = p.opacite;

        switch (p.type) {
            case 'bulle_lave':
            case 'bulle_eau':
                ctx.strokeStyle = p.couleur;
                ctx.lineWidth = 0.8;
                ctx.shadowColor = p.couleur;
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = p.opacite * 0.5;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(
                    p.x - p.taille * 0.3,
                    p.y - p.taille * 0.3,
                    p.taille * 0.25,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                break;

            case 'feuille':
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.couleur;
                ctx.shadowColor = p.couleur;
                ctx.shadowBlur = 3;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.taille, p.taille * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                break;

            case 'flocon':
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.strokeStyle = p.couleur;
                ctx.lineWidth = 0.6;
                ctx.shadowBlur = 2;
                ctx.shadowColor = '#ffffff';
                for (let b = 0; b < 6; b++) {
                    ctx.save();
                    ctx.rotate(b * (Math.PI / 3));
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -p.taille * 3);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
                break;

            case 'grain_sable':
                ctx.fillStyle = p.couleur;
                ctx.shadowBlur = 0;
                ctx.fillRect(p.x, p.y, p.taille * 2, p.taille * 0.5);
                break;

            case 'code_hex':
                ctx.fillStyle = p.couleur;
                ctx.shadowColor = p.couleur;
                ctx.shadowBlur = 4;
                ctx.font = `${p.taille}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(p.char, p.x, p.y);
                break;

            case 'braise':
                ctx.fillStyle = p.couleur;
                ctx.shadowColor = p.couleur;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'etoile_cosmos':
                ctx.fillStyle = p.couleur;
                ctx.shadowColor = p.couleur;
                ctx.shadowBlur = p.taille * 3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
}

function dessinerGrille() {
    const ctx = obtenirCtx();
    ctx.save();
    ctx.strokeStyle = BIOMES[obtenirBiomeActif()]?.grilleCoul ?? 'rgba(255,255,255,0.038)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= CONFIG.colonnes; c++) {
        ctx.beginPath();
        ctx.moveTo(c * CONFIG.taille, 0);
        ctx.lineTo(c * CONFIG.taille, CONFIG.lignes * CONFIG.taille);
        ctx.stroke();
    }
    for (let l = 0; l <= CONFIG.lignes; l++) {
        ctx.beginPath();
        ctx.moveTo(0, l * CONFIG.taille);
        ctx.lineTo(CONFIG.colonnes * CONFIG.taille, l * CONFIG.taille);
        ctx.stroke();
    }
    ctx.restore();
}

export function dessinerFondBiome() {
    const ctx = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    if (!ctx || !canvas) return;

    const b = BIOMES[obtenirBiomeActif()];
    const w = canvas.width;
    const h = canvas.height;
    const t = performance.now() / 1000;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, b.fondCiel);
    grad.addColorStop(1, b.fondSol);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (!obtenirEffetsReduits()) {
        switch (obtenirBiomeActif()) {
            case 'lave':
                dessinerFondLave(ctx, w, h, t);
                break;
            case 'ocean':
                dessinerFondOcean(ctx, w, h, t);
                break;
            case 'foret':
                dessinerFondForet(ctx, w, h, t);
                break;
            case 'glace':
                dessinerFondGlace(ctx, w, h, t);
                break;
            case 'desert':
                dessinerFondDesert(ctx, w, h, t);
                break;
            case 'cyber':
                dessinerFondCyber(ctx, w, h, t);
                break;
            case 'fuochi':
                dessinerFondFuochi(ctx, w, h, t);
                break;
            case 'cosmos':
                dessinerFondCosmos(ctx, w, h, t);
                break;
        }
    }

    dessinerParticulesAmbiance();
    dessinerGrille();
}
