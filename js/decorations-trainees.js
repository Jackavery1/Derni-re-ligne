import { CONFIG } from './config.js';
import { etat, obtenirCtx } from './store-jeu.js';
import { obtenirForme, obtenirCouleurPiece } from './piece-jeu.js';

const MAX_HISTORIQUE = 6;
const historiquePositions = [];

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

export function dessinerTrainee(intensite) {
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

export function dessinerTraineeArcEnCiel() {
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

export function dessinerTraineeCombo() {
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

export function dessinerEtoilesTrainee() {
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
