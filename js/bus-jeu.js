/** @typedef {(payload?: unknown) => void} EcouteurBus */

/** @type {Map<string, Set<EcouteurBus>>} */
const ecouteurs = new Map();

/**
 * @param {string} evenement
 * @param {EcouteurBus} callback
 * @returns {() => void}
 */
export function ecouter(evenement, callback) {
    if (!ecouteurs.has(evenement)) ecouteurs.set(evenement, new Set());
    ecouteurs.get(evenement).add(callback);
    return () => ecouteurs.get(evenement)?.delete(callback);
}

/** @param {string} evenement @param {unknown} [payload] */
export function emettre(evenement, payload) {
    ecouteurs.get(evenement)?.forEach((fn) => fn(payload));
}

/** Réinitialise tous les écouteurs (tests uniquement). */
export function reinitialiserBusJeu() {
    ecouteurs.clear();
}
