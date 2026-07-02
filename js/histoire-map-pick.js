import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { ecranVersMonde } from './histoire-map-camera.js';

/** @param {{ canvasCarte: HTMLCanvasElement | null }} etatCarte @param {number} clientX @param {number} clientY */
export function coordsCanvas(etatCarte, clientX, clientY) {
    if (!etatCarte.canvasCarte) return { cx: clientX, cy: clientY };
    const rect = etatCarte.canvasCarte.getBoundingClientRect();
    const scaleX = etatCarte.canvasCarte.width / rect.width;
    const scaleY = etatCarte.canvasCarte.height / rect.height;
    return {
        cx: (clientX - rect.left) * scaleX,
        cy: (clientY - rect.top) * scaleY,
    };
}

/**
 * @param {{
 *   canvasCarte: HTMLCanvasElement | null,
 *   camera: { y: number, zoom: number, cibleY: number, cibleZoom: number, vitesseLerp: number, scrollMin: number, scrollMax: number, initialise: boolean },
 *   positionsNoeuds: Record<string, { x: number, y: number, rayon: number }>,
 *   mondesVisibles: Set<string>,
 * }} etatCarte
 * @param {number} cx
 * @param {number} cy
 */
export function noeudSousCurseur(etatCarte, cx, cy) {
    const cvs = etatCarte.canvasCarte;
    const w = cvs?.width ?? 0;
    const h = cvs?.height ?? 0;
    const { mx, my } = ecranVersMonde(etatCarte.camera, cx, cy, w, h);
    for (const [id, pos] of Object.entries(etatCarte.positionsNoeuds)) {
        if (!etatCarte.mondesVisibles.has(id)) continue;
        const dx = mx - pos.x;
        const dy = my - pos.y;
        const hitRadius = pos.rayon + 10;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === id);
            if (!monde) continue;
            return { id, monde, pos };
        }
    }
    return null;
}
