import { CONFIG, BIOMES } from './config.js';
import { store } from './store-core.js';
import {
    dessinerFondCosmos,
    dessinerFondCyber,
    dessinerFondDesert,
    dessinerFondForet,
    dessinerFondFuochi,
    dessinerFondGlace,
    dessinerFondLave,
    dessinerFondOcean,
} from './rendu-ambiance-fonds.js';
import {
    dessinerFlickerTrame,
    dessinerFondTrame,
    dessinerLigneEclipse,
} from './rendu-ambiance-histoire.js';
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

    if (store.histoire.actif && BIOMES[obtenirBiomeActif()]?.mecaniqueSpeciale === 'eclipse') {
        dessinerLigneEclipse();
    }
    if (store.histoire.actif && BIOMES[obtenirBiomeActif()]?.mecaniqueSpeciale === 'trame') {
        dessinerFondTrame();
        dessinerFlickerTrame();
    }
}
