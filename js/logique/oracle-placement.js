/** Heuristique de placement Oracle — évaluation plateau et recherche SRS. */
import { CONFIG, TETROMINOS } from '../config/config-jeu.js';
import { estPositionValidePlateau, obtenirEssaisKick } from './logique-pure.js';
import { extraireForme } from './moteur-piece.js';

export function evaluerPlateau(plateau) {
    let score = 0;

    let lignesCompletes = 0;
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (plateau[l].every((c) => c !== 0)) lignesCompletes++;
    }
    score += lignesCompletes * lignesCompletes * 800;

    let hauteurTotale = 0;
    for (let c = 0; c < CONFIG.colonnes; c++) {
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) {
                hauteurTotale += CONFIG.lignes - l;
                break;
            }
        }
    }
    score -= hauteurTotale * 5;

    let trous = 0;
    for (let c = 0; c < CONFIG.colonnes; c++) {
        let bloqueParDessus = false;
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) bloqueParDessus = true;
            else if (bloqueParDessus) trous++;
        }
    }
    score -= trous * 35;

    const hauteurs = new Array(CONFIG.colonnes).fill(0);
    for (let c = 0; c < CONFIG.colonnes; c++) {
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) {
                hauteurs[c] = CONFIG.lignes - l;
                break;
            }
        }
    }
    let relief = 0;
    for (let c = 0; c < CONFIG.colonnes - 1; c++) {
        relief += Math.abs(hauteurs[c] - hauteurs[c + 1]);
    }
    score -= relief * 4;

    for (let c = 0; c < CONFIG.colonnes; c++) {
        const gauche = c > 0 ? hauteurs[c - 1] : 99;
        const droite = c < CONFIG.colonnes - 1 ? hauteurs[c + 1] : 99;
        const profond = Math.min(gauche, droite) - hauteurs[c];
        if (profond > 2) score -= profond * profond * 2;
    }

    return score;
}

function simulerChute(plateau, piece, forme) {
    let y = piece.y;
    while (estPositionValidePlateau(plateau, { ...piece, y: y + 1 }, forme, 0, 0)) y++;
    return y;
}

function evaluerPlacement(piece, plateau, x, y, rotation, forme) {
    const pieceFinale = { ...piece, x, y, rotation };
    const plateauTmp = plateau.map((l) => [...l]);
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const py = pieceFinale.y + l;
            const px = pieceFinale.x + c;
            if (py < 0 || py >= CONFIG.lignes || px < 0 || px >= CONFIG.colonnes) return null;
            plateauTmp[py][px] = '#ffffff';
        }
    }
    return evaluerPlateau(plateauTmp);
}

export function calculerMeilleurPlacement(piece, plateau) {
    if (piece.reliqueForme) {
        const forme = piece.reliqueForme;
        let meilleurScore = -Infinity;
        let meilleurX = piece.x;
        let meilleureRotation = piece.rotation;
        for (let x = -2; x < CONFIG.colonnes + 2; x++) {
            const pieceTmp = { ...piece, x, rotation: 0 };
            if (!estPositionValidePlateau(plateau, pieceTmp, forme, 0, 0)) continue;
            const yFinal = simulerChute(plateau, pieceTmp, forme);
            const scorePos = evaluerPlacement(piece, plateau, x, yFinal, 0, forme);
            if (scorePos !== null && scorePos > meilleurScore) {
                meilleurScore = scorePos;
                meilleurX = x;
                meilleureRotation = 0;
            }
        }
        return { x: meilleurX, rotation: meilleureRotation, score: meilleurScore };
    }

    let meilleurScore = -Infinity;
    let meilleurX = piece.x;
    let meilleureRotation = piece.rotation;
    const nbRots = TETROMINOS[piece.type].rotations.length;

    for (let targetRot = 0; targetRot < nbRots; targetRot++) {
        const essais = obtenirEssaisKick(piece.type, piece.rotation, targetRot);
        for (const [kdx, kdy] of essais) {
            for (let slide = -2; slide <= 2; slide++) {
                const pieceTmp = {
                    ...piece,
                    rotation: targetRot,
                    x: piece.x + kdx + slide,
                    y: piece.y + kdy,
                };
                const forme = extraireForme(pieceTmp, targetRot);
                if (!estPositionValidePlateau(plateau, pieceTmp, forme, 0, 0)) continue;

                const yFinal = simulerChute(plateau, pieceTmp, forme);
                const scorePos = evaluerPlacement(
                    piece,
                    plateau,
                    pieceTmp.x,
                    yFinal,
                    targetRot,
                    forme
                );
                if (scorePos === null || scorePos <= meilleurScore) continue;

                meilleurScore = scorePos;
                meilleurX = pieceTmp.x;
                meilleureRotation = targetRot;
            }
        }
    }

    return { x: meilleurX, rotation: meilleureRotation, score: meilleurScore };
}
