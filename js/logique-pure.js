import { CONFIG, TABLE_KICK_I, TABLE_KICK_STANDARD } from './config.js';

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
 * Supprime les lignes complètes et retourne un nouveau plateau.
 * @param {number[][]} plateau
 * @returns {{ plateau: number[][], nbSupprimees: number, lignesEffacees: number[] }}
 */
export function supprimerLignesDuPlateau(plateau) {
    const lignesEffacees = [];
    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        if (plateau[l].every((c) => c !== 0)) lignesEffacees.push(l);
    }
    if (lignesEffacees.length === 0) {
        return { plateau, nbSupprimees: 0, lignesEffacees: [] };
    }
    const copie = plateau.map((ligne) => [...ligne]);
    for (const l of [...lignesEffacees].sort((a, b) => b - a)) {
        copie.splice(l, 1);
        copie.unshift(Array(CONFIG.colonnes).fill(0));
    }
    return { plateau: copie, nbSupprimees: lignesEffacees.length, lignesEffacees };
}

const POINTS_PAR_LIGNES = [0, 100, 300, 500, 800];

/** @param {number} nbLignes @param {number} niveau @returns {number} */
export function calculerPointsLignes(nbLignes, niveau) {
    return (POINTS_PAR_LIGNES[nbLignes] ?? 800) * niveau;
}

/** @param {number} lignes @returns {number} */
export function calculerNiveauDepuisLignes(lignes) {
    return Math.floor(lignes / 10) + 1;
}

/**
 * @param {number[][]} plateau
 * @param {{ x: number, y: number }} piece
 * @param {number[][]} forme
 * @param {number} [dx]
 * @param {number} [dy]
 */
export function estPositionValideAvecForme(plateau, piece, forme, dx = 0, dy = 0) {
    return estPositionValidePlateau(plateau, piece, forme, dx, dy);
}
