import { CONFIG, TETROMINOS } from './config.js';
import { estPositionValidePlateau } from './logique-pure.js';

/**
 * Extrait la matrice de forme d'une pièce (tétromino ou relique).
 * @param {{ type: string, rotation: number, reliqueForme?: number[][] }} piece
 * @param {number | null} [rotation]
 * @returns {number[][]}
 */
export function extraireForme(piece, rotation = null) {
    if (piece.reliqueForme) return piece.reliqueForme;
    const rotations = TETROMINOS[piece.type].rotations;
    const nbRot = rotations.length;
    if (rotation !== null) {
        return rotations[((rotation % nbRot) + nbRot) % nbRot];
    }
    return rotations[piece.rotation % nbRot];
}

/**
 * Valide une position avec bornes horizontales personnalisées (mode coop).
 * @param {number[][]} plateau
 * @param {{ x: number, y: number }} piece
 * @param {number[][]} forme
 * @param {number} dx
 * @param {number} dy
 * @param {number} xMin
 * @param {number} xMax
 */
export function estPositionValideAvecBornes(plateau, piece, forme, dx, dy, xMin, xMax) {
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const nx = piece.x + c + dx;
            const ny = piece.y + l + dy;
            if (nx < xMin || nx >= xMax) return false;
            if (ny >= CONFIG.lignes) return false;
            if (ny >= 0 && plateau[ny][nx] !== 0) return false;
        }
    }
    return true;
}

/**
 * Valide une position sur le plateau complet (mode solo).
 * @param {number[][]} plateau
 * @param {{ x: number, y: number }} piece
 * @param {number[][]} forme
 * @param {number} [dx]
 * @param {number} [dy]
 */
export function estPositionValideSurPlateau(plateau, piece, forme, dx = 0, dy = 0) {
    return estPositionValidePlateau(plateau, piece, forme, dx, dy);
}

/**
 * Valide une pièce sur un plateau (solo, architecte, etc.).
 * @param {{ type: string, rotation: number, x: number, y: number, reliqueForme?: number[][] }} piece
 * @param {number[][]} plateau
 * @param {number} [dx]
 * @param {number} [dy]
 * @param {number | null} [rotation]
 * @param {number} [colonnes]
 */
export function estPositionValidePiece(
    piece,
    plateau,
    dx = 0,
    dy = 0,
    rotation = null,
    colonnes = CONFIG.colonnes
) {
    if (!piece) return false;
    const forme = extraireForme(piece, rotation);
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const nx = piece.x + c + dx;
            const ny = piece.y + l + dy;
            if (nx < 0 || nx >= colonnes) return false;
            if (ny >= CONFIG.lignes) return false;
            if (ny >= 0 && plateau[ny][nx] !== 0) return false;
        }
    }
    return true;
}

/**
 * @param {number[][]} plateau
 * @param {{ x: number, y: number }} piece
 * @param {(piece: object, dx: number, dy: number) => boolean} estValide
 */
export function calculerDistanceChuteSurPlateau(plateau, piece, estValide) {
    let distance = 0;
    while (estValide(piece, 0, distance + 1)) distance++;
    return distance;
}
