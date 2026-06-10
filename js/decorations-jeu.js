import { CONFIG, BIOMES } from './config.js';
import { statsGlobales } from './achievements.js';
import { store } from './store-core.js';
import {
    etat,
    obtenirBiomeActif,
    obtenirCanvasPlateau,
    obtenirCtx,
    obtenirEffetsReduits,
    obtenirEffetsAccessibiliteReduits,
} from './store-jeu.js';
import { obtenirForme, obtenirCouleurPiece } from './piece-jeu.js';
import { oracle } from './oracle-jeu.js';
import { definirArcEnCiel } from './rendu-robo.js';

const MAX_HISTORIQUE = 6;
export const historiquePositions = [];

export function reinitialiserHistoriquePositions() {
    historiquePositions.length = 0;
}

export function mettreAJourHistoriquePositions() {
    if (!etat.pieceActuelle || !etat.estEnCours || etat.estEnPause) return;
    const pos = { x: etat.pieceActuelle.x, y: etat.pieceActuelle.y };
    const dernier = historiquePositions[historiquePositions.length - 1];
    if (dernier && dernier.x === pos.x && dernier.y === pos.y) return;
    historiquePositions.push(pos);
    if (historiquePositions.length > MAX_HISTORIQUE) historiquePositions.shift();
}

function dessinerTrainee(intensite) {
    if (!etat.pieceActuelle || historiquePositions.length === 0) return;
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    const forme = obtenirForme(etat.pieceActuelle);
    historiquePositions.forEach((pos, i) => {
        const alpha = (i / historiquePositions.length) * 0.14 * intensite;
        if (alpha < 0.02) return;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = alpha;
        const rgb = couleur.startsWith('#')
            ? `${parseInt(couleur.slice(1, 3), 16)},${parseInt(couleur.slice(3, 5), 16)},${parseInt(couleur.slice(5, 7), 16)}`
            : '255,255,255';
        obtenirCtx().fillStyle = `rgba(${rgb},0.55)`;
        for (let l = 0; l < forme.length; l++) {
            for (let c = 0; c < forme[l].length; c++) {
                if (!forme[l][c]) continue;
                obtenirCtx().fillRect(
                    (pos.x + c) * CONFIG.taille + 2,
                    (pos.y + l) * CONFIG.taille + 2,
                    CONFIG.taille - 4,
                    CONFIG.taille - 4
                );
            }
        }
        obtenirCtx().restore();
    });
}

function dessinerTraineeArcEnCiel() {
    if (!etat.pieceActuelle || historiquePositions.length === 0) return;
    const hue = (performance.now() / 20) % 360;
    const forme = obtenirForme(etat.pieceActuelle);
    historiquePositions.forEach((pos, i) => {
        const alpha = (i / historiquePositions.length) * 0.2;
        if (alpha < 0.025) return;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = alpha;
        obtenirCtx().fillStyle = `hsl(${(hue + i * 30) % 360}, 95%, 58%)`;
        for (let l = 0; l < forme.length; l++) {
            for (let c = 0; c < forme[l].length; c++) {
                if (!forme[l][c]) continue;
                obtenirCtx().fillRect(
                    (pos.x + c) * CONFIG.taille + 2,
                    (pos.y + l) * CONFIG.taille + 2,
                    CONFIG.taille - 4,
                    CONFIG.taille - 4
                );
            }
        }
        obtenirCtx().restore();
    });
}

function dessinerTraineeCombo() {
    if (!etat.pieceActuelle || historiquePositions.length === 0) return;
    const forme = obtenirForme(etat.pieceActuelle);
    historiquePositions.forEach((pos, i) => {
        const alpha = (i / historiquePositions.length) * 0.17;
        if (alpha < 0.025) return;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = alpha;
        obtenirCtx().fillStyle = i % 2 === 0 ? 'rgba(0,255,136,0.65)' : 'rgba(0,245,255,0.65)';
        for (let l = 0; l < forme.length; l++) {
            for (let c = 0; c < forme[l].length; c++) {
                if (!forme[l][c]) continue;
                obtenirCtx().fillRect(
                    (pos.x + c) * CONFIG.taille + 2,
                    (pos.y + l) * CONFIG.taille + 2,
                    CONFIG.taille - 4,
                    CONFIG.taille - 4
                );
            }
        }
        obtenirCtx().restore();
    });
}

function dessinerEtoilesTrainee() {
    if (!etat.pieceActuelle || historiquePositions.length === 0) return;
    const t = performance.now() / 1000;
    historiquePositions.forEach((pos, i) => {
        const alpha = (i / historiquePositions.length) * 0.26;
        if (alpha < 0.03) return;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = alpha;
        obtenirCtx().fillStyle = 'rgba(255,255,255,0.7)';
        const px = (pos.x + 1) * CONFIG.taille;
        const py = (pos.y + 1) * CONFIG.taille;
        const r = 1.5 + Math.sin(t + i) * 0.35;
        obtenirCtx().beginPath();
        obtenirCtx().arc(px, py, r, 0, Math.PI * 2);
        obtenirCtx().fill();
        obtenirCtx().restore();
    });
}

function dessinerFlammesBords(intensite) {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const t = performance.now() / 1000;
    const nb = Math.floor(12 * intensite * (obtenirEffetsReduits() ? 0.5 : 1));
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

function dessinerEclairsBords() {
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

function dessinerBordurePulse() {
    const pulsation = 0.5 + 0.5 * Math.sin(performance.now() / 600);
    const couleur = BIOMES[obtenirBiomeActif()]?.ui?.bordureCanvas || '#00f5ff';
    const multSurtension = store.surtensionActive ? 1.4 : 1;
    const intensite = (12 + pulsation * 18) * multSurtension;
    obtenirCanvasPlateau().style.boxShadow = `0 0 ${intensite}px ${couleur}, 0 0 ${intensite * 2}px ${couleur}44`;
}

function dessinerPoulsBordure() {
    const pulsation = 0.5 + 0.5 * Math.sin(performance.now() / 900);
    const couleur = BIOMES[obtenirBiomeActif()]?.ui?.bordureCanvas || '#00f5ff';
    const intensite = 8 + pulsation * 12;
    obtenirCanvasPlateau().style.boxShadow = `0 0 ${intensite}px ${couleur}88`;
}

function dessinerAuraDoree() {
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

function dessinerAuraCosmos() {
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

function dessinerVortexBords() {
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

function dessinerNotesFlottantes() {
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

function dessinerGemmesOrbitales() {
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

function dessinerFlashCyan() {
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

function dessinerParticulesBiome() {
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

function dessinerHaloRelique() {
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

function dessinerBordureBicolore() {
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

function dessinerHaloOracle() {
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

function reinitialiserEffetsHorsCanvas() {
    if (!statsGlobales.decorationsActives.includes('robo_arc_en_ciel')) {
        definirArcEnCiel(false);
    }
}

export function dessinerDecorations() {
    const actives = statsGlobales.decorationsActives;
    if (!actives.length || !etat.estEnCours || etat.estEnPause) {
        reinitialiserEffetsHorsCanvas();
        return;
    }

    const reduits = obtenirEffetsAccessibiliteReduits();
    if (reduits) {
        const canvas = obtenirCanvasPlateau();
        if (canvas) canvas.style.boxShadow = '';
    }

    actives.forEach((deco) => {
        switch (deco) {
            case 'trainee_simple':
                dessinerTrainee(1);
                break;
            case 'trainee_double':
                dessinerTrainee(2);
                break;
            case 'trainee_arc_en_ciel':
                dessinerTraineeArcEnCiel();
                break;
            case 'trainee_combo':
                dessinerTraineeCombo();
                break;
            case 'etoiles_trainee':
                dessinerEtoilesTrainee();
                break;
            case 'flammes_bords':
                dessinerFlammesBords(0.6);
                break;
            case 'flammes_intenses':
                dessinerFlammesBords(1);
                break;
            case 'eclairs_bords':
                dessinerEclairsBords();
                break;
            case 'bordure_pulse':
                if (!reduits) dessinerBordurePulse();
                break;
            case 'pouls_bordure':
                if (!reduits) dessinerPoulsBordure();
                break;
            case 'aura_doree':
                dessinerAuraDoree();
                break;
            case 'aura_cosmos':
                dessinerAuraCosmos();
                break;
            case 'vortex_bords':
                dessinerVortexBords();
                break;
            case 'notes_flottantes':
                dessinerNotesFlottantes();
                break;
            case 'gemmes_orbitales':
                dessinerGemmesOrbitales();
                break;
            case 'flash_cyan':
                if (!reduits) dessinerFlashCyan();
                break;
            case 'particules_biome':
                dessinerParticulesBiome();
                break;
            case 'halo_relique':
                dessinerHaloRelique();
                break;
            case 'halo_oracle':
                dessinerHaloOracle();
                break;
            case 'bordure_bicolore':
                dessinerBordureBicolore();
                break;
            case 'couronne_lumineuse':
                break;
            case 'robo_arc_en_ciel':
                definirArcEnCiel(true);
                break;
        }
    });
}
