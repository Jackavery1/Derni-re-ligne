import {
    particulesAmbiance,
    CARACTERES_HEX,
    obtenirBiomeActif,
    obtenirEffetsReduits,
    obtenirCanvasPlateau,
    obtenirCtx,
} from '../etat/store-jeu.js';
import { creerParticulAmbiance, initParticulesAmbiance } from './rendu-ambiance-particules-init.js';

export { initParticulesAmbiance };

const HEX_CHARS = CARACTERES_HEX;

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

function _mettreAJourParticuleAmbiance(p, dt, w, h, t) {
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

        _mettreAJourParticuleAmbiance(p, dt, w, h, t);
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

export function dessinerParticulesAmbiance() {
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
