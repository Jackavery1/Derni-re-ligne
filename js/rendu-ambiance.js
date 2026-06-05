import { CONFIG, BIOMES } from './config.js';
import {
    particulesAmbiance,
    NB_PARTICULES_AMBIANCE,
    CARACTERES_HEX,
    VERTS_FORET,
    obtenirBiomeActif,
    obtenirEffetsReduits,
    obtenirTempsAmbianceDecor,
    obtenirCanvasPlateau,
    obtenirCtx,
    reinitialiserTempsAmbianceDecor,
    ajouterTempsAmbianceDecor,
} from './store-jeu.js';

function aleaEntre(min, max) {
    return min + Math.random() * (max - min);
}

function creerParticuleAmbiance(idBiome) {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const base = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        taille: 4,
        opacite: 0.2,
        couleur: '#ffffff',
        rotation: 0,
        vRot: 0,
        timer: 0,
        char: null,
    };

    switch (idBiome) {
        case 'lave':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(h * 0.3, h),
                vx: aleaEntre(-0.2, 0.2),
                vy: aleaEntre(-0.9, -0.35),
                taille: aleaEntre(4, 11),
                opacite: aleaEntre(0.15, 0.3),
                couleur: Math.random() < 0.5 ? '#ff4500' : '#ff6a00',
            });
        case 'ocean':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(h * 0.4, h),
                vx: aleaEntre(-0.08, 0.08),
                vy: aleaEntre(-0.35, -0.12),
                taille: aleaEntre(3, 8),
                opacite: aleaEntre(0.1, 0.2),
                couleur: Math.random() < 0.5 ? '#00cfff' : '#00e5ff',
            });
        case 'foret':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(-20, h * 0.3),
                vx: aleaEntre(-0.25, 0.25),
                vy: aleaEntre(0.2, 0.55),
                taille: aleaEntre(5, 10),
                opacite: aleaEntre(0.1, 0.25),
                couleur: VERTS_FORET[Math.floor(Math.random() * VERTS_FORET.length)],
                rotation: aleaEntre(0, Math.PI * 2),
                vRot: aleaEntre(-0.02, 0.02),
            });
        case 'glace':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(-15, h * 0.2),
                vx: aleaEntre(-0.15, 0.15),
                vy: aleaEntre(0.15, 0.4),
                taille: aleaEntre(1.5, 4),
                opacite: aleaEntre(0.08, 0.2),
                couleur: '#ffffff',
            });
        case 'desert':
            return Object.assign(base, {
                x: aleaEntre(-10, w * 0.3),
                y: aleaEntre(0, h),
                vx: aleaEntre(0.4, 1.1),
                vy: aleaEntre(-0.05, 0.05),
                taille: aleaEntre(1.5, 3.5),
                opacite: aleaEntre(0.05, 0.15),
                couleur: Math.random() < 0.5 ? '#ffbb44' : '#ffcc66',
            });
        case 'cyber':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(-20, h * 0.15),
                vx: aleaEntre(-0.05, 0.05),
                vy: aleaEntre(0.35, 0.75),
                taille: aleaEntre(6, 9),
                opacite: aleaEntre(0.05, 0.12),
                couleur: Math.random() < 0.5 ? '#ff00ff' : '#aa00ff',
                char: CARACTERES_HEX[Math.floor(Math.random() * 16)],
            });
        case 'fuochi': {
            const couleurs = BIOMES.fuochi.couleursBlocs;
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(0, h),
                vx: aleaEntre(-0.6, 0.6),
                vy: aleaEntre(-0.6, 0.6),
                taille: aleaEntre(2, 5),
                opacite: aleaEntre(0.3, 0.6),
                couleur: couleurs[Math.floor(Math.random() * couleurs.length)],
                timer: aleaEntre(200, 600),
            });
        }
        case 'cosmos':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(0, h),
                vx: 0,
                vy: 0,
                taille: aleaEntre(1, 2.5),
                opacite: aleaEntre(0.05, 0.4),
                couleur: '#ffffff',
                timer: Math.random() * Math.PI * 2,
            });
        default:
            return base;
    }
}

export function initParticulesAmbiance() {
    particulesAmbiance.length = 0;
    const nb = NB_PARTICULES_AMBIANCE[obtenirBiomeActif()] ?? 0;
    for (let i = 0; i < nb; i++) {
        particulesAmbiance.push(creerParticuleAmbiance(obtenirBiomeActif()));
    }
    reinitialiserTempsAmbianceDecor();
}

function reinitialiserParticuleAmbiance(p) {
    const frais = creerParticuleAmbiance(obtenirBiomeActif());
    p.x = frais.x;
    p.y = frais.y;
    p.vx = frais.vx;
    p.vy = frais.vy;
    p.taille = frais.taille;
    p.opacite = frais.opacite;
    p.couleur = frais.couleur;
    p.rotation = frais.rotation;
    p.vRot = frais.vRot;
    p.timer = frais.timer;
    p.char = frais.char;
}

export function mettreAJourParticulesAmbiance(dt) {
    if (particulesAmbiance.length === 0) return;
    const facteur = dt / 16;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    ajouterTempsAmbianceDecor(dt);

    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];

        switch (obtenirBiomeActif()) {
            case 'lave':
            case 'ocean':
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                if (p.y < -p.taille) reinitialiserParticuleAmbiance(p);
                break;
            case 'foret':
            case 'glace':
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                p.rotation += p.vRot * facteur;
                if (p.y > h + p.taille) reinitialiserParticuleAmbiance(p);
                break;
            case 'desert':
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                if (p.x > w + p.taille) reinitialiserParticuleAmbiance(p);
                break;
            case 'cyber':
                p.y += p.vy * facteur;
                if (p.y > h + 10) reinitialiserParticuleAmbiance(p);
                break;
            case 'fuochi':
                p.timer -= dt;
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                p.opacite = Math.max(0, p.timer / 400) * 0.6;
                if (p.timer <= 0) reinitialiserParticuleAmbiance(p);
                break;
            case 'cosmos':
                p.timer += dt * 0.003;
                p.opacite = 0.05 + (Math.sin(p.timer) * 0.5 + 0.5) * 0.35;
                break;
        }
    }
}

function dessinerScanlinesOcean() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const offset = (obtenirTempsAmbianceDecor() * 0.025) % 48;
    obtenirCtx().save();
    for (let y = -48 + offset; y < h; y += 48) {
        const grad = obtenirCtx().createLinearGradient(0, y, w, y + 6);
        grad.addColorStop(0, 'rgba(0,160,255,0)');
        grad.addColorStop(0.5, 'rgba(0,200,255,0.035)');
        grad.addColorStop(1, 'rgba(0,160,255,0)');
        obtenirCtx().fillStyle = grad;
        obtenirCtx().fillRect(0, y, w, 6);
    }
    obtenirCtx().restore();
}

function dessinerParticulesAmbiance() {
    if (obtenirEffetsReduits() || particulesAmbiance.length === 0) return;

    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];
        obtenirCtx().save();
        obtenirCtx().globalAlpha = p.opacite;

        if (obtenirBiomeActif() === 'cyber' && p.char) {
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().font = `${Math.round(p.taille)}px monospace`;
            obtenirCtx().fillText(p.char, p.x, p.y);
        } else if (obtenirBiomeActif() === 'foret') {
            obtenirCtx().translate(p.x + p.taille / 2, p.y + p.taille / 2);
            obtenirCtx().rotate(p.rotation);
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().fillRect(
                -p.taille * 0.6,
                -p.taille * 0.25,
                p.taille * 1.2,
                p.taille * 0.5
            );
        } else if (obtenirBiomeActif() === 'lave' || obtenirBiomeActif() === 'ocean') {
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().beginPath();
            obtenirCtx().arc(p.x, p.y, p.taille * 0.5, 0, Math.PI * 2);
            obtenirCtx().fill();
        } else {
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().fillRect(p.x, p.y, p.taille, p.taille);
        }
        obtenirCtx().restore();
    }
}

function dessinerGrille() {
    obtenirCtx().strokeStyle = BIOMES[obtenirBiomeActif()].grilleCoul;
    obtenirCtx().lineWidth = 0.5;
    for (let c = 0; c <= CONFIG.colonnes; c++) {
        obtenirCtx().beginPath();
        obtenirCtx().moveTo(c * CONFIG.taille, 0);
        obtenirCtx().lineTo(c * CONFIG.taille, CONFIG.lignes * CONFIG.taille);
        obtenirCtx().stroke();
    }
    for (let l = 0; l <= CONFIG.lignes; l++) {
        obtenirCtx().beginPath();
        obtenirCtx().moveTo(0, l * CONFIG.taille);
        obtenirCtx().lineTo(CONFIG.colonnes * CONFIG.taille, l * CONFIG.taille);
        obtenirCtx().stroke();
    }
}

export function dessinerFondBiome() {
    const b = BIOMES[obtenirBiomeActif()];
    const grad = obtenirCtx().createLinearGradient(0, 0, 0, obtenirCanvasPlateau().height);
    grad.addColorStop(0, b.fondCiel);
    grad.addColorStop(1, b.fondSol);
    obtenirCtx().fillStyle = grad;
    obtenirCtx().fillRect(0, 0, obtenirCanvasPlateau().width, obtenirCanvasPlateau().height);

    if (obtenirBiomeActif() === 'ocean' && !obtenirEffetsReduits()) {
        dessinerScanlinesOcean();
    }

    dessinerParticulesAmbiance();
    dessinerGrille();
}
