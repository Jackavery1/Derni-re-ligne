import { CONFIG } from '../config/config-jeu.js';
import { BIOMES } from '../config/biomes.js';
import { obtenirLigneEclipse, obtenirFondTrame } from '../histoire/mecaniques-histoire.js';
import { obtenirCanvasPlateau, obtenirCtx } from '../etat/store-jeu.js';

export function dessinerLigneEclipse() {
    const ctx = obtenirCtx();
    const w = obtenirCanvasPlateau().width;
    const lig = obtenirLigneEclipse();
    const y = lig * CONFIG.taille;
    const t = performance.now() / 1200;

    ctx.save();
    const grad = ctx.createLinearGradient(0, y - 4, 0, y + 4);
    grad.addColorStop(0, 'rgba(255, 220, 50, 0)');
    grad.addColorStop(0.5, `rgba(255, 220, 50, ${0.35 + 0.15 * Math.sin(t)})`);
    grad.addColorStop(1, 'rgba(100, 80, 200, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 4, w, 8);

    ctx.strokeStyle = `rgba(255, 200, 0, ${0.4 + 0.2 * Math.sin(t * 1.5)})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,220,50,0.45)';
    ctx.fillText('JOUR', w - 4, y - 6);
    ctx.fillStyle = 'rgba(100,80,200,0.45)';
    ctx.fillText('NUIT', w - 4, y + 12);

    ctx.restore();
}

export function dessinerFondTrame() {
    const ctx = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    const { biomeId, alpha } = obtenirFondTrame();
    const biome = BIOMES[biomeId];
    if (!biome) return;

    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, biome.fondCiel);
    grad.addColorStop(1, biome.fondSol);
    ctx.globalAlpha = (1 - alpha) * 0.65;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    const glow = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
    );
    glow.addColorStop(0, 'transparent');
    glow.addColorStop(0.7, 'transparent');
    glow.addColorStop(1, `${biome.lueurCoul}33`);
    ctx.globalAlpha = (1 - alpha) * 0.8;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

export function dessinerFlickerTrame() {
    const ctx = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    const t = performance.now() / 1000;

    const colonnesFlicker = [0, CONFIG.colonnes - 1];
    for (const col of colonnesFlicker) {
        const seuil = col === 0 ? Math.sin(t * 0.7 + 1.0) : Math.sin(t * 0.9 + 2.5);
        if (seuil < 0.5) continue;

        const alpha = (seuil - 0.5) * 0.25;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#b400ff';
        ctx.fillRect(col * CONFIG.taille, 0, CONFIG.taille, canvas.height);
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (Math.sin(t * 3 + l * 0.5 + col) > 0.7) {
                ctx.globalAlpha = alpha * 1.5;
                ctx.fillStyle = '#ffe600';
                ctx.fillRect(
                    col * CONFIG.taille + 4,
                    l * CONFIG.taille + 4,
                    CONFIG.taille - 8,
                    CONFIG.taille - 8
                );
            }
        }
        ctx.restore();
    }
}
