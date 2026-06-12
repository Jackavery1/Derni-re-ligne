/** Utilitaires partagés — portraits canvas (couche statique + cache). */

export function seedFraction(index) {
    return Math.abs(Math.sin(index * 12.9898 + 78.233) * 43758.5453) % 1;
}

/**
 * @param {number} w
 * @param {number} h
 * @returns {OffscreenCanvas | HTMLCanvasElement | null}
 */
export function creerSurfaceCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        try {
            const surface = new OffscreenCanvas(w, h);
            if (typeof surface.getContext === 'function') return surface;
        } catch {
            /* OffscreenCanvas indisponible */
        }
    }
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
        const canvas = document.createElement('canvas');
        if (typeof canvas.getContext === 'function') {
            canvas.width = w;
            canvas.height = h;
            return canvas;
        }
    }
    return null;
}

/**
 * @param {Map<string, OffscreenCanvas | HTMLCanvasElement>} cache
 * @param {string} cle
 * @param {number} w
 * @param {number} h
 * @param {(ctx: CanvasRenderingContext2D, w: number, h: number) => void} dessiner
 */
export function obtenirCoucheStatique(cache, cle, w, h, dessiner) {
    const existant = cache.get(cle);
    if (existant) return existant;

    const surface = creerSurfaceCanvas(w, h);
    if (!surface) return null;

    const ctx = surface.getContext('2d');
    if (!ctx) return null;

    dessiner(ctx, w, h);
    cache.set(cle, surface);
    return surface;
}

/**
 * @param {Record<string, number | boolean | number[]>} params
 * @returns {'calme'|'agressif'|'vacillant'}
 */
export function etatBossDepuisParams(params) {
    if (params.vacillant === true) return 'vacillant';
    if (/** @type {number} */ (params.vitesseAnim ?? 1) > 1.2) return 'agressif';
    return 'calme';
}
