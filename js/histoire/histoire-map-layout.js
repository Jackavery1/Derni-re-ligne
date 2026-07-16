import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { mondePeutEtreJoue } from './histoire-mondes.js';

/** @type {[string, number, number][]} */
const LAYOUT_PRINCIPAL = [
    ['monde_prologue', 0.5, 20],
    ['monde_lave', 0.32, 20],
    ['monde_rouille', 0.68, 20],
    ['monde_boss_1', 0.5, 28],
    ['monde_ocean', 0.3, 20],
    ['monde_foret', 0.65, 20],
    ['monde_glace', 0.38, 20],
    ['monde_boss_2', 0.5, 28],
    ['monde_desert', 0.64, 20],
    ['monde_eclipse', 0.32, 20],
    ['monde_cyber', 0.62, 20],
    ['monde_boss_3', 0.5, 28],
    ['monde_fuochi', 0.28, 20],
    ['monde_cosmos', 0.68, 20],
    ['monde_vide', 0.38, 20],
    ['monde_boss_4', 0.5, 28],
    ['monde_finale', 0.5, 32],
];

/** @param {Record<string, { x: number, y: number, rayon: number }>} positions @param {string} id @param {number} x @param {number} y @param {number} rayon */
function placerNoeud(positions, id, x, y, rayon) {
    positions[id] = { x, y, rayon };
}

/** @param {{ canvasCarte: HTMLCanvasElement | null, positionsNoeuds: Record<string, { x: number, y: number, rayon: number }> }} etatCarte */
export function calculerPositionsNoeuds(etatCarte) {
    const canvas = etatCarte.canvasCarte;
    if (!canvas) return;
    const w = canvas.width;

    const PAS_Y = 140;
    const MARGE_Y = 100;

    etatCarte.positionsNoeuds = {};
    LAYOUT_PRINCIPAL.forEach(([id, xFrac, rayon], index) => {
        placerNoeud(
            etatCarte.positionsNoeuds,
            id,
            Math.round(w * xFrac),
            Math.round(MARGE_Y + index * PAS_Y),
            rayon
        );
    });

    const etatHist = obtenirEtatHistoirePersiste();

    if (mondePeutEtreJoue('monde_miroir', etatHist)) {
        placerNoeud(
            etatCarte.positionsNoeuds,
            'monde_miroir',
            Math.round(0.06 * w),
            etatCarte.positionsNoeuds['monde_eclipse']?.y ?? MARGE_Y + 9 * PAS_Y,
            Math.round(20 * 0.85)
        );
    }

    if (mondePeutEtreJoue('monde_trame', etatHist)) {
        placerNoeud(
            etatCarte.positionsNoeuds,
            'monde_trame',
            Math.round(0.94 * w),
            etatCarte.positionsNoeuds['monde_foret']?.y ?? MARGE_Y + 5 * PAS_Y,
            Math.round(20 * 0.85)
        );
    }

    if (mondePeutEtreJoue('monde_paradoxe', etatHist)) {
        const yPrologue = etatCarte.positionsNoeuds['monde_prologue']?.y ?? MARGE_Y;
        placerNoeud(
            etatCarte.positionsNoeuds,
            'monde_paradoxe',
            Math.round(0.12 * w),
            yPrologue - 55,
            Math.round(20 * 0.7)
        );
    }
}
