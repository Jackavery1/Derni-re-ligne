import { CONFIG, TETROMINOS } from './config.js';
import { obtenirCanvasPlateau, obtenirCtx } from './store-jeu.js';
import { etat } from './store-jeu.js';
import { obtenirCouleurPieceParType } from './piece-jeu.js';
import { dessinerCellule, dessinerPreview, dessinerParticules } from './rendu-jeu.js';
import { coop, DEMI_LARGEUR, coop_estPositionValide } from './coop-logique.js';

function obtenirFormeCoop(piece) {
    const rotations = TETROMINOS[piece.type].rotations;
    return rotations[piece.rotation % rotations.length];
}

export function coop_dessinerPreview(joueur) {
    const jData = coop[joueur];
    if (joueur === 'j1') {
        const canvas = document.getElementById('canvas-coop-preview-j1');
        const hold = document.getElementById('canvas-coop-hold-j1');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dessinerPreview(ctx, canvas, jData.prochainePiece);
        }
        if (hold) {
            const ctxH = hold.getContext('2d');
            ctxH.clearRect(0, 0, hold.width, hold.height);
            if (jData.pieceEnReserve) dessinerPreview(ctxH, hold, jData.pieceEnReserve);
        }
    } else {
        const canvas = document.getElementById('canvas-coop-preview-j2');
        const hold = document.getElementById('canvas-coop-hold-j2');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dessinerPreview(ctx, canvas, jData.prochainePiece);
        }
        if (hold) {
            const ctxH = hold.getContext('2d');
            ctxH.clearRect(0, 0, hold.width, hold.height);
            if (jData.pieceEnReserve) dessinerPreview(ctxH, hold, jData.pieceEnReserve);
        }
    }
}

export function coop_dessinerPlateau() {
    const ctx = obtenirCtx();
    const canvasPlateau = obtenirCanvasPlateau();
    if (!ctx || !canvasPlateau) return;

    ctx.fillStyle = 'rgba(5,5,18,0.97)';
    ctx.fillRect(0, 0, canvasPlateau.width, canvasPlateau.height);

    const xSep = DEMI_LARGEUR * CONFIG.taille;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(xSep, 0);
    ctx.lineTo(xSep, canvasPlateau.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,245,255,0.5)';
    ctx.fillText('J1', xSep * 0.5, 10);
    ctx.fillStyle = 'rgba(255,0,110,0.5)';
    ctx.fillText('J2', xSep * 1.5, 10);
    ctx.restore();

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c]) {
                dessinerCellule(ctx, c, l, etat.plateau[l][c]);
            }
        }
    }
}

export function coop_dessinerPiecesActives() {
    const ctx = obtenirCtx();
    if (!ctx) return;

    for (const j of ['j1', 'j2']) {
        const piece = coop[j].pieceActuelle;
        if (!piece) continue;
        const forme = obtenirFormeCoop(piece);
        const couleur = obtenirCouleurPieceParType(piece.type);
        forme.forEach((ligne, li) => {
            ligne.forEach((cellule, ci) => {
                if (!cellule) return;
                const py = piece.y + li;
                if (py >= 0) dessinerCellule(ctx, piece.x + ci, py, couleur);
            });
        });
    }
}

export function coop_dessinerPiecesFantomes() {
    const ctx = obtenirCtx();
    if (!ctx) return;

    for (const j of ['j1', 'j2']) {
        const piece = coop[j].pieceActuelle;
        if (!piece) continue;
        let dist = 0;
        while (coop_estPositionValide(piece, 0, dist + 1)) dist++;
        const forme = obtenirFormeCoop(piece);
        const couleur = obtenirCouleurPieceParType(piece.type);
        forme.forEach((ligne, li) => {
            ligne.forEach((cellule, ci) => {
                if (!cellule) return;
                const py = piece.y + li + dist;
                if (py >= 0) dessinerCellule(ctx, piece.x + ci, py, couleur, CONFIG.taille, 0.15);
            });
        });
    }
}

export function coop_dessinerLignesEnAttente() {
    if (!coop.estEnCours) return;
    const ctx = obtenirCtx();
    if (!ctx) return;

    const t = performance.now() / 400;
    const pulse = 0.08 + Math.sin(t) * 0.06;

    if (coop.lignesEnAttenteJ1 >= 0) {
        const l = coop.lignesEnAttenteJ1;
        if (etat.plateau[l] && etat.plateau[l].slice(0, 5).every((c) => c !== 0)) {
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#00f5ff';
            ctx.fillRect(0, l * CONFIG.taille, DEMI_LARGEUR * CONFIG.taille, CONFIG.taille);
            ctx.restore();
        } else {
            coop.lignesEnAttenteJ1 = -1;
        }
    }

    if (coop.lignesEnAttenteJ2 >= 0) {
        const l = coop.lignesEnAttenteJ2;
        if (etat.plateau[l] && etat.plateau[l].slice(5, 10).every((c) => c !== 0)) {
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#ff006e';
            ctx.fillRect(
                DEMI_LARGEUR * CONFIG.taille,
                l * CONFIG.taille,
                DEMI_LARGEUR * CONFIG.taille,
                CONFIG.taille
            );
            ctx.restore();
        } else {
            coop.lignesEnAttenteJ2 = -1;
        }
    }
}

export function coop_dessinerFlashSynchro() {
    if (coop.flashSynchro <= 0) return;
    const ctx = obtenirCtx();
    const canvasPlateau = obtenirCanvasPlateau();
    if (!ctx || !canvasPlateau) return;

    const alpha = (coop.flashSynchro / 300) * 0.6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(0, 0, canvasPlateau.width, canvasPlateau.height);
    ctx.restore();
}

export function coop_rendreFrame() {
    coop_dessinerPlateau();
    coop_dessinerPiecesFantomes();
    coop_dessinerPiecesActives();
    coop_dessinerLignesEnAttente();
    coop_dessinerFlashSynchro();
    dessinerParticules();
}
