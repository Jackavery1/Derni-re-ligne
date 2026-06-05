/**
 * Helpers DOM typés pour checkJs sur l’ensemble du projet.
 */

/** @param {string} id @returns {HTMLElement | null} */
export function obtenirElement(id) {
    if (typeof document === 'undefined') return null;
    return document.getElementById(id);
}

/** @param {string} id @returns {HTMLCanvasElement | null} */
export function obtenirCanvas(id) {
    const el = obtenirElement(id);
    if (!el || el.tagName !== 'CANVAS') return null;
    return /** @type {HTMLCanvasElement} */ (el);
}

/** @param {string} id @returns {HTMLButtonElement | null} */
export function obtenirBouton(id) {
    const el = obtenirElement(id);
    if (!el || el.tagName !== 'BUTTON') return null;
    return /** @type {HTMLButtonElement} */ (el);
}

/** @param {string} id @returns {HTMLInputElement | null} */
export function obtenirInput(id) {
    const el = obtenirElement(id);
    if (!el || el.tagName !== 'INPUT') return null;
    return /** @type {HTMLInputElement} */ (el);
}

/** @param {string} selecteur @returns {HTMLCanvasElement | null} */
export function queryCanvas(selecteur) {
    if (typeof document === 'undefined') return null;
    const el = document.querySelector(selecteur);
    if (!el || el.tagName !== 'CANVAS') return null;
    return /** @type {HTMLCanvasElement} */ (el);
}

/** @returns {AudioContext | null} */
export function creerContexteAudio() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
}
