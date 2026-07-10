import { CONFIG } from '../config/config-jeu.js';
import { BIOMES } from '../config/biomes.js';
import {
    store,
    etat,
    obtenirBiomeActif,
    obtenirCanvasPlateau,
    obtenirCtx,
} from '../etat/store-jeu.js';
import { obtenirForme } from '../logique/piece-jeu.js';
import { oracle } from '../logique/oracle-jeu.js';

export function dessinerFlammesBords(intensite, effetsReduits) {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const t = performance.now() / 1000;
    const nb = Math.floor(12 * intensite * (effetsReduits ? 0.5 : 1));
    for (let i = 0; i < nb; i++) {
        const progres = (t * (0.4 + i * 0.07) + i * 0.23) % 1;
        const y = h * (1 - progres);
        const vacille = Math.sin(t * 3 + i * 1.7) * 4;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = (1 - progres) * 0.5 * intensite;
        obtenirCtx().fillStyle = `hsl(${20 + i * 4}, 100%, ${50 + progres * 30}%)`;
        obtenirCtx().shadowColor = '#ff4500';
        obtenirCtx().shadowBlur = 8;
        obtenirCtx().fillRect(vacille, y, 3 + Math.sin(t + i) * 2, 8);
        obtenirCtx().fillRect(w - 5 + vacille, y, 3 + Math.sin(t + i) * 2, 8);
        obtenirCtx().restore();
    }
}

export function dessinerEclairsBords() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const t = performance.now() / 1000;
    for (let i = 0; i < 4; i++) {
        if (Math.sin(t * 2.5 + i * 2.1) < 0.6) continue;
        const y0 = (t * 80 + i * 120) % h;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = 0.35;
        obtenirCtx().strokeStyle = '#cceeff';
        obtenirCtx().shadowColor = '#00f5ff';
        obtenirCtx().shadowBlur = 10;
        obtenirCtx().lineWidth = 1.5;
        obtenirCtx().beginPath();
        obtenirCtx().moveTo(2, y0);
        obtenirCtx().lineTo(6, y0 + 12);
        obtenirCtx().lineTo(3, y0 + 18);
        obtenirCtx().stroke();
        obtenirCtx().beginPath();
        obtenirCtx().moveTo(w - 2, y0 + 20);
        obtenirCtx().lineTo(w - 7, y0 + 32);
        obtenirCtx().lineTo(w - 3, y0 + 40);
        obtenirCtx().stroke();
        obtenirCtx().restore();
    }
}

export function dessinerBordurePulse() {
    const pulsation = 0.5 + 0.5 * Math.sin(performance.now() / 600);
    const couleur = BIOMES[obtenirBiomeActif()]?.ui?.bordureCanvas || '#00f5ff';
    const multSurtension = store.surtensionActive ? 1.4 : 1;
    const intensite = (12 + pulsation * 18) * multSurtension;
    obtenirCanvasPlateau().style.boxShadow = `0 0 ${intensite}px ${couleur}, 0 0 ${intensite * 2}px ${couleur}44`;
}

export function dessinerPoulsBordure() {
    const pulsation = 0.5 + 0.5 * Math.sin(performance.now() / 900);
    const couleur = BIOMES[obtenirBiomeActif()]?.ui?.bordureCanvas || '#00f5ff';
    const intensite = 8 + pulsation * 12;
    obtenirCanvasPlateau().style.boxShadow = `0 0 ${intensite}px ${couleur}88`;
}

export function dessinerAuraDoree() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const grad = obtenirCtx().createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'rgba(255, 230, 0, 0.06)');
    grad.addColorStop(1, 'transparent');
    obtenirCtx().save();
    obtenirCtx().fillStyle = grad;
    obtenirCtx().fillRect(0, 0, w, h);
    obtenirCtx().restore();
}

export function dessinerAuraCosmos() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const t = performance.now() / 2000;
    for (let i = 0; i < 3; i++) {
        const angle = t + (i * Math.PI * 2) / 3;
        const cx = w / 2 + Math.cos(angle) * (w * 0.55);
        const cy = h / 2 + Math.sin(angle) * (h * 0.55);
        const grad = obtenirCtx().createRadialGradient(cx, cy, 0, cx, cy, 60);
        const hue = (120 * i + t * 30) % 360;
        grad.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.1)`);
        grad.addColorStop(1, 'transparent');
        obtenirCtx().save();
        obtenirCtx().fillStyle = grad;
        obtenirCtx().fillRect(0, 0, w, h);
        obtenirCtx().restore();
    }
}

export function dessinerVortexBords() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const t = performance.now() / 1500;
    obtenirCtx().save();
    obtenirCtx().globalAlpha = 0.2;
    obtenirCtx().strokeStyle = '#b400ff';
    obtenirCtx().lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const angle = t + i * 0.5;
        obtenirCtx().beginPath();
        obtenirCtx().arc(0, h / 2, 30 + i * 8, angle, angle + 1.2);
        obtenirCtx().stroke();
        obtenirCtx().beginPath();
        obtenirCtx().arc(w, h / 2, 30 + i * 8, -angle, -angle + 1.2);
        obtenirCtx().stroke();
    }
    obtenirCtx().restore();
}

export function dessinerNotesFlottantes() {
    const notes = ['♩', '♪', '♫', '♬'];
    const t = performance.now() / 1000;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    for (let i = 0; i < 5; i++) {
        const progres = (t * 0.2 + i * 0.37) % 1;
        const x = (i * 0.2 + Math.sin(t + i) * 0.05) * w;
        const y = h * (1 - progres);
        obtenirCtx().save();
        obtenirCtx().globalAlpha = Math.sin(progres * Math.PI) * 0.4;
        obtenirCtx().fillStyle = `hsl(${(t * 60 + i * 72) % 360}, 80%, 70%)`;
        obtenirCtx().font = `${10 + i * 2}px serif`;
        obtenirCtx().fillText(notes[i % notes.length], x, y);
        obtenirCtx().restore();
    }
}

export function dessinerGemmesOrbitales() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const t = performance.now() / 1500;
    const gemCouleurs = ['#ff006e', '#00f5ff', '#ffe600'];
    gemCouleurs.forEach((coul, i) => {
        const angle = t + i * ((Math.PI * 2) / 3);
        const rayon = 18;
        const cx = w / 2 + Math.cos(angle) * (w / 2 + rayon + 4);
        const cy = h / 2 + Math.sin(angle) * (h / 2 + rayon + 4);
        obtenirCtx().save();
        obtenirCtx().shadowColor = coul;
        obtenirCtx().shadowBlur = 10;
        obtenirCtx().fillStyle = coul;
        obtenirCtx().globalAlpha = 0.75;
        obtenirCtx().fillRect(cx - 4, cy - 4, 8, 8);
        obtenirCtx().restore();
    });
}

export function dessinerFlashCyan() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 400);
    obtenirCtx().save();
    obtenirCtx().globalAlpha = 0.04 * pulse;
    obtenirCtx().fillStyle = '#00f5ff';
    obtenirCtx().fillRect(0, 0, 8, h);
    obtenirCtx().fillRect(w - 8, 0, 8, h);
    obtenirCtx().restore();
}

export function dessinerParticulesBiome() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const couleur = BIOMES[obtenirBiomeActif()]?.ui?.couleurPrimaire || '#00f5ff';
    const t = performance.now() / 1000;
    for (let i = 0; i < 6; i++) {
        const progres = (t * 0.15 + i * 0.17) % 1;
        const x = (i % 2 === 0 ? 4 : w - 8) + Math.sin(t + i) * 3;
        const y = h * (1 - progres);
        obtenirCtx().save();
        obtenirCtx().globalAlpha = (1 - progres) * 0.35;
        obtenirCtx().fillStyle = couleur;
        obtenirCtx().shadowColor = couleur;
        obtenirCtx().shadowBlur = 6;
        obtenirCtx().fillRect(x, y, 2, 2);
        obtenirCtx().restore();
    }
}

export function dessinerHaloRelique() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const grad = obtenirCtx().createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.5);
    grad.addColorStop(0, 'rgba(180, 0, 255, 0.08)');
    grad.addColorStop(1, 'transparent');
    obtenirCtx().save();
    obtenirCtx().fillStyle = grad;
    obtenirCtx().fillRect(0, 0, w, h);
    obtenirCtx().restore();
}

export function dessinerBordureBicolore() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const xSep = 5 * CONFIG.taille;
    const ctx = obtenirCtx();
    const lw = 2;
    ctx.save();
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.rect(0, 0, xSep, h);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,245,255,0.35)';
    ctx.strokeRect(lw / 2, lw / 2, w - lw, h - lw);
    ctx.restore();
    ctx.save();
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.rect(xSep, 0, w - xSep, h);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,0,110,0.35)';
    ctx.strokeRect(lw / 2, lw / 2, w - lw, h - lw);
    ctx.restore();
}

export function dessinerHaloOracle() {
    if (!etat.pieceActuelle || !oracle.actif) return;
    const forme = obtenirForme(etat.pieceActuelle);
    const t = performance.now() / 800;
    const ctx = obtenirCtx();
    ctx.save();
    ctx.shadowColor = '#aa44ff';
    ctx.shadowBlur = 15 + Math.sin(t) * 5;
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#cc66ff';
    ctx.lineWidth = 1;
    forme.forEach((ligne, li) => {
        ligne.forEach((cellule, ci) => {
            if (!cellule) return;
            ctx.strokeRect(
                (etat.pieceActuelle.x + ci) * CONFIG.taille + 1,
                (etat.pieceActuelle.y + li) * CONFIG.taille + 1,
                CONFIG.taille - 2,
                CONFIG.taille - 2
            );
        });
    });
    ctx.restore();
}
