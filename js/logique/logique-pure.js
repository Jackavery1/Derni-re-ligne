import { CONFIG, TABLE_KICK_I, TABLE_KICK_STANDARD } from '../config/config-jeu.js';

export function remplirSac() {
    const sac = Object.keys({ I: 1, O: 1, T: 1, S: 1, Z: 1, J: 1, L: 1 });
    for (let i = sac.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sac[i], sac[j]] = [sac[j], sac[i]];
    }
    return sac;
}

export function verifierSacValide(sac) {
    if (sac.length !== 7) return false;
    const types = new Set(sac);
    return types.size === 7;
}

export function obtenirEssaisKick(type, rotationActuelle, rotationCible) {
    if (type === 'O') return [[0, 0]];
    const table = type === 'I' ? TABLE_KICK_I : TABLE_KICK_STANDARD;
    const sens = (rotationCible - rotationActuelle + 4) % 4;
    if (sens !== 1 && sens !== 3) return [[0, 0]];
    const index = sens === 1 ? rotationActuelle : (rotationActuelle + 3) % 4;
    return table[index];
}

export function estPositionValidePlateau(plateau, piece, forme, dx = 0, dy = 0) {
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const nx = piece.x + c + dx;
            const ny = piece.y + l + dy;
            if (nx < 0 || nx >= CONFIG.colonnes) return false;
            if (ny >= CONFIG.lignes) return false;
            if (ny >= 0 && plateau[ny][nx] !== 0) return false;
        }
    }
    return true;
}

export function compterLignesCompletes(plateau) {
    let n = 0;
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (plateau[l].every((c) => c !== 0)) n++;
    }
    return n;
}

/**
 * Retire les lignes indiquées et ajoute des lignes vides en haut.
 * @param {(number | string)[][]} plateau
 * @param {number[]} lignesEffacees
 */
function retirerLignesIndices(plateau, lignesEffacees) {
    const aRetirer = new Set(lignesEffacees);
    const lignesConservees = plateau.filter((_, i) => !aRetirer.has(i));
    const nbVides = CONFIG.lignes - lignesConservees.length;
    return [
        ...Array.from({ length: nbVides }, () => Array(CONFIG.colonnes).fill(0)),
        ...lignesConservees,
    ];
}

/**
 * Supprime les lignes completes et retourne un nouveau plateau.
 * @param {(number | string)[][]} plateau
 * @returns {{ plateau: (number | string)[][], nbSupprimees: number, lignesEffacees: number[] }}
 */
export function supprimerLignesDuPlateau(plateau) {
    const lignesEffacees = [];
    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        if (plateau[l].every((c) => c !== 0)) lignesEffacees.push(l);
    }
    if (lignesEffacees.length === 0) {
        return { plateau, nbSupprimees: 0, lignesEffacees: [] };
    }
    return {
        plateau: retirerLignesIndices(plateau, lignesEffacees),
        nbSupprimees: lignesEffacees.length,
        lignesEffacees,
    };
}

/**
 * Efface les lignes complètes (y compris si des cellules sont rouillées).
 * @param {(number | string)[][]} plateau
 * @param {(x: number, y: number) => boolean} _estRouillee
 */
export function supprimerLignesDuPlateauExcluantRouille(plateau, _estRouillee) {
    return supprimerLignesDuPlateau(plateau);
}

/** @param {number[][]} forme */
function _trouverCentreT(forme) {
    for (let y = 0; y < forme.length; y++) {
        for (let x = 0; x < forme[y].length; x++) {
            if (!forme[y][x]) continue;
            let adj = 0;
            if (forme[y - 1]?.[x]) adj++;
            if (forme[y + 1]?.[x]) adj++;
            if (forme[y][x - 1]) adj++;
            if (forme[y][x + 1]) adj++;
            if (adj >= 2) return { x, y };
        }
    }
    return { x: 1, y: 1 };
}

function _coinOccupe(plateau, x, y, forme, piece) {
    if (x < 0 || x >= CONFIG.colonnes || y < 0 || y >= CONFIG.lignes) return true;
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            if (piece.x + c === x && piece.y + l === y) return false;
        }
    }
    return plateau[y][x] !== 0;
}

/**
 * Détecte un T-Spin (guideline simplifiée : 3 coins sur 4 remplis après rotation).
 * @param {(number | string)[][]} plateau
 * @param {{ type: string, x?: number, y?: number, rotation: number }} piece
 * @param {number[][]} forme
 * @returns {null | 'mini' | 'full'}
 */
export function detecterTSpin(plateau, piece, forme) {
    if (piece.type !== 'T' || piece.x == null || piece.y == null) return null;
    const centre = _trouverCentreT(forme);
    const cx = piece.x + centre.x;
    const cy = piece.y + centre.y;
    const coins = [
        [cx - 1, cy - 1],
        [cx + 1, cy - 1],
        [cx - 1, cy + 1],
        [cx + 1, cy + 1],
    ];
    const remplis = coins.filter(([x, y]) => _coinOccupe(plateau, x, y, forme, piece)).length;
    if (remplis < 3) return null;
    const avant = coins
        .slice(0, 2)
        .filter(([x, y]) => _coinOccupe(plateau, x, y, forme, piece)).length;
    return avant === 2 ? 'full' : 'mini';
}

/** @param {null | 'mini' | 'full'} type @param {number} nbLignes @param {number} niveau */
export function calculerPointsTSpin(type, nbLignes, niveau) {
    if (!type) return 0;
    if (nbLignes === 0) return (type === 'full' ? 400 : 100) * niveau;
    const base = type === 'full' ? [0, 800, 1200, 1600, 2000] : [0, 200, 400, 600, 800];
    return (base[nbLignes] ?? base[4]) * niveau;
}

const POINTS_PAR_LIGNES = [0, 100, 300, 500, 800];

/** @param {number} nbLignes @param {number} niveau @returns {number} */
export function calculerPointsLignes(nbLignes, niveau) {
    return (POINTS_PAR_LIGNES[nbLignes] ?? 800) * niveau;
}

/** @param {number} lignes @returns {number} */
export function calculerNiveauDepuisLignes(lignes) {
    return Math.floor(lignes / CONFIG.lignesParNiveau) + 1;
}

/**
 * @param {(number | string)[][]} plateau
 * @param {{ x: number, y: number }} piece
 * @param {number[][]} forme
 * @param {number} [dx]
 * @param {number} [dy]
 */
export function estPositionValideAvecForme(plateau, piece, forme, dx = 0, dy = 0) {
    return estPositionValidePlateau(plateau, piece, forme, dx, dy);
}
