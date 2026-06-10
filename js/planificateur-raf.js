/** @type {Map<string, { id: number | null }>} */
const boucles = new Map();

/**
 * Boucle RAF secondaire (menus, carte, portraits…) — distincte de boucle-jeu.js.
 * @param {string} cle
 * @param {(timestamp: number) => void} callback
 */
export function planifierBoucleSecondaire(cle, callback) {
    arreterBoucleSecondaire(cle);
    const etat = { id: null };
    boucles.set(cle, etat);

    /** @param {number} timestamp */
    function frame(timestamp) {
        if (!boucles.has(cle)) return;
        callback(timestamp);
        etat.id = requestAnimationFrame(frame);
    }

    etat.id = requestAnimationFrame(frame);
}

/** @param {string} cle */
export function arreterBoucleSecondaire(cle) {
    const etat = boucles.get(cle);
    if (etat?.id != null) cancelAnimationFrame(etat.id);
    boucles.delete(cle);
}

/** @param {string} cle */
export function boucleSecondaireActive(cle) {
    return boucles.has(cle);
}

/** Visible en tests uniquement. */
export function _reinitialiserPlanificateurRaf() {
    for (const cle of [...boucles.keys()]) {
        arreterBoucleSecondaire(cle);
    }
}
