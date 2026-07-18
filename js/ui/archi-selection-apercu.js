import { rendreIconeSurCanvas } from '../rendu/icones-pixel.js';
import { dessinerSilhouetteApercu } from '../rendu/archi-apercu-silhouette.js';
import { obtenirIdIconeBiome } from '../config/biome-icones.js';

/** @param {HTMLCanvasElement} canvas @param {{ silhouette?: unknown[], biome: string }} niv @param {string} accent */
export function dessinerApercuCarteArchi(canvas, niv, accent) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (niv.silhouette?.length) {
        dessinerSilhouetteApercu(canvas, ctx, niv.silhouette, accent, { tailleCelluleMax: 6 });
        return;
    }
    rendreIconeSurCanvas(canvas, obtenirIdIconeBiome(niv.biome));
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ silhouette?: unknown[], biome: string }} niv
 * @param {string} accent
 */
export function dessinerIconeDetailArchi(canvas, ctx, niv, accent) {
    if (niv.silhouette?.length) {
        dessinerSilhouetteApercu(canvas, ctx, niv.silhouette, accent, {
            tailleCelluleMax: 10,
        });
        return;
    }
    rendreIconeSurCanvas(canvas, obtenirIdIconeBiome(niv.biome));
}
