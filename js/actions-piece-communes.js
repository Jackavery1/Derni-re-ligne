import { CONFIG, TETROMINOS } from './config.js';
import { extraireForme } from './moteur-piece.js';

/**
 * Pose les cellules d'une pièce active sur le plateau.
 * @param {(number|string)[][]} plateau
 * @param {{ x?: number, y?: number, rotation: number, type: string, reliqueForme?: number[][] }} piece
 * @param {number | string} couleur
 * @param {{ onCellule?: (x: number, y: number) => void }} [options]
 * @returns {{ gameOver: boolean, cellulesPosees: Array<{ x: number, y: number }> }}
 */
export function poserPieceSurPlateau(plateau, piece, couleur, options = {}) {
    const forme = extraireForme(piece);
    const cellulesPosees = [];

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const y = piece.y + l;
            const x = piece.x + c;
            if (y < 0) return { gameOver: true, cellulesPosees };
            plateau[y][x] = couleur;
            options.onCellule?.(x, y);
            cellulesPosees.push({ x, y });
        }
    }

    return { gameOver: false, cellulesPosees };
}

/**
 * @param {number} niveau
 * @returns {number}
 */
export function vitesseChuteDepuisNiveau(niveau) {
    return Math.max(
        CONFIG.vitesseBase - (niveau - 1) * CONFIG.reductionParNiveau,
        CONFIG.vitesseMin
    );
}

/**
 * @param {{ x: number, y: number, rotation: number, type: string }} piece
 * @param {number} dx
 * @param {number} dy
 * @param {(piece: object, dx: number, dy: number, rotation?: number | null) => boolean} estValide
 * @returns {boolean}
 */
export function deplacerPieceSiValide(piece, dx, dy, estValide) {
    if (!estValide(piece, dx, dy)) return false;
    piece.x += dx;
    piece.y += dy;
    return true;
}

/**
 * Rotation simple avec wall kicks basiques (mode coop).
 * @param {{ x: number, y: number, rotation: number, type: string }} piece
 * @param {number} sens
 * @param {(piece: object, dx: number, dy: number, rotation: number) => boolean} estValide
 * @returns {boolean}
 */
export function tenterRotationSimple(piece, sens, estValide) {
    const nbRots = TETROMINOS[piece.type].rotations.length;
    const rotationCible = (((piece.rotation + sens) % nbRots) + nbRots) % nbRots;

    for (const dx of [0, 1, -1, 2, -2]) {
        if (estValide(piece, dx, 0, rotationCible)) {
            piece.rotation = rotationCible;
            piece.x += dx;
            return true;
        }
    }
    return false;
}

/**
 * @param {'j1' | 'j2'} joueur
 * @param {number} largeurForme
 * @param {number} [demiLargeur]
 * @returns {number}
 */
export function calculerSpawnXCoop(joueur, largeurForme, demiLargeur = 5) {
    const offset = joueur === 'j1' ? 0 : demiLargeur;
    return offset + Math.floor(demiLargeur / 2) - Math.floor(largeurForme / 2);
}

/**
 * @param {{ x: number, y: number }} piece
 * @param {(piece: object, dx: number, dy: number) => boolean} estValide
 * @returns {number}
 */
export function executerChuteRapide(piece, estValide) {
    let distance = 0;
    while (estValide(piece, 0, distance + 1)) distance++;
    piece.y += distance;
    return distance;
}
