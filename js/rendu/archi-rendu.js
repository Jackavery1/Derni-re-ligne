import { CONFIG, BIOMES } from '../config/config.js';
import { obtenirForme, obtenirCouleurPieceParType } from '../logique/piece-jeu.js';
import {
    obtenirCtx,
    obtenirCanvasPlateau,
    obtenirEffetsAccessibiliteReduits,
} from '../etat/store-jeu.js';
import { dessinerCellule } from './rendu-cellule.js';
import { dessinerParticules } from './rendu-jeu.js';
import { archi, archi_estPositionValide } from '../logique/archi-logique.js';
import { dessinerMotifsAccessibilite, dessinerMotifsCoopPieces } from './rendu-accessibilite.js';

function archi_dessinerGrille(ctx2d, biomeId) {
    const biome = BIOMES[biomeId] ?? BIOMES.classique;
    ctx2d.strokeStyle = biome.grilleCoul;
    ctx2d.lineWidth = 0.5;
    const colonneMilieu = CONFIG.colonnes / 2;
    for (let c = 0; c <= CONFIG.colonnes; c++) {
        if (Number.isInteger(colonneMilieu) && c === colonneMilieu) continue;
        ctx2d.beginPath();
        ctx2d.moveTo(c * CONFIG.taille, 0);
        ctx2d.lineTo(c * CONFIG.taille, CONFIG.lignes * CONFIG.taille);
        ctx2d.stroke();
    }
    for (let l = 0; l <= CONFIG.lignes; l++) {
        ctx2d.beginPath();
        ctx2d.moveTo(0, l * CONFIG.taille);
        ctx2d.lineTo(CONFIG.colonnes * CONFIG.taille, l * CONFIG.taille);
        ctx2d.stroke();
    }
}

export function archi_dessinerPlateau() {
    const ctx2d = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    const biomeId = archi.niveauActuel?.biome ?? 'classique';

    ctx2d.fillStyle = 'rgba(5,5,18,0.97)';
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    archi_dessinerGrille(ctx2d, biomeId);

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (archi.plateau[l][c]) {
                dessinerCellule(ctx2d, c, l, archi.plateau[l][c]);
            }
        }
    }
}

export function archi_dessinerSilhouette() {
    const ctx2d = obtenirCtx();
    const t = performance.now() / 1000;
    const biome = BIOMES[archi.niveauActuel?.biome ?? 'classique'];
    const couleur = biome?.lueurCoul ?? '#00f5ff';

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (!archi.silhouetteParsee[l][c]) continue;

            const px = c * CONFIG.taille;
            const py = l * CONFIG.taille;
            const dejaCouvert = archi.plateau[l][c] !== 0;

            if (dejaCouvert) {
                ctx2d.save();
                ctx2d.globalAlpha = 0.25;
                ctx2d.fillStyle = '#00ff88';
                ctx2d.shadowColor = '#00ff88';
                ctx2d.shadowBlur = 8;
                ctx2d.fillRect(px, py, CONFIG.taille, CONFIG.taille);
                ctx2d.restore();
            } else if (!obtenirEffetsAccessibiliteReduits()) {
                const pulse = 0.15 + Math.sin(t * 2 + l * 0.3) * 0.08;
                ctx2d.save();
                ctx2d.globalAlpha = pulse;
                ctx2d.fillStyle = couleur;
                ctx2d.fillRect(px + 1, py + 1, CONFIG.taille - 2, CONFIG.taille - 2);
                ctx2d.strokeStyle = `${couleur}aa`;
                ctx2d.lineWidth = 1;
                ctx2d.strokeRect(px + 1, py + 1, CONFIG.taille - 2, CONFIG.taille - 2);
                ctx2d.restore();
            }
        }
    }

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (archi.plateau[l][c] === 0) continue;
            if (archi.silhouetteParsee[l][c]) continue;
            ctx2d.save();
            ctx2d.globalAlpha = 0.35;
            ctx2d.fillStyle = '#ff006e';
            ctx2d.shadowColor = '#ff006e';
            ctx2d.shadowBlur = 6;
            ctx2d.fillRect(
                c * CONFIG.taille + 1,
                l * CONFIG.taille + 1,
                CONFIG.taille - 2,
                CONFIG.taille - 2
            );
            ctx2d.restore();
        }
    }
}

export function archi_dessinerFantome() {
    if (!archi.pieceActuelle) return;
    const ctx2d = obtenirCtx();
    let dist = 0;
    while (archi_estPositionValide(archi.pieceActuelle, 0, dist + 1)) dist++;
    const forme = obtenirForme(archi.pieceActuelle);
    const couleur = obtenirCouleurPieceParType(archi.pieceActuelle.type);
    forme.forEach((l, li) =>
        l.forEach((c, ci) => {
            if (!c) return;
            const py = archi.pieceActuelle.y + li + dist;
            if (py >= 0) {
                dessinerCellule(
                    ctx2d,
                    archi.pieceActuelle.x + ci,
                    py,
                    couleur,
                    CONFIG.taille,
                    0.18
                );
            }
        })
    );
}

export function archi_dessinerPieceActive() {
    if (!archi.pieceActuelle) return;
    const ctx2d = obtenirCtx();
    const forme = obtenirForme(archi.pieceActuelle);
    const couleur = obtenirCouleurPieceParType(archi.pieceActuelle.type);
    forme.forEach((l, li) =>
        l.forEach((c, ci) => {
            if (!c) return;
            const py = archi.pieceActuelle.y + li;
            if (py >= 0) dessinerCellule(ctx2d, archi.pieceActuelle.x + ci, py, couleur);
        })
    );
}

export function archi_dessinerScoreTempsReel() {
    const ctx2d = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    const pct = Math.round(archi.precisionActuelle * 100);
    ctx2d.save();
    ctx2d.font = '6px monospace';
    ctx2d.textAlign = 'right';
    ctx2d.fillStyle = pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffe600' : '#ff006e';
    ctx2d.fillText(`PRÉCISION ${pct}%`, canvas.width - 4, 10);
    ctx2d.restore();
}

export function archi_rendreFrame() {
    const ctx2d = obtenirCtx();
    archi_dessinerPlateau();
    if (ctx2d) dessinerMotifsAccessibilite(ctx2d, archi.plateau, CONFIG.taille);
    archi_dessinerSilhouette();
    archi_dessinerFantome();
    archi_dessinerPieceActive();
    if (ctx2d && archi.pieceActuelle) {
        let dist = 0;
        while (archi_estPositionValide(archi.pieceActuelle, 0, dist + 1)) dist++;
        dessinerMotifsCoopPieces(
            ctx2d,
            [{ piece: archi.pieceActuelle, distFantome: dist }],
            obtenirForme
        );
    }
    archi_dessinerScoreTempsReel();
    dessinerParticules();
}
