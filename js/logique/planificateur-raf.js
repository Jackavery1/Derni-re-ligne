/** @type {Map<string, { id: number | null }>} */
const boucles = new Map();

const CLE_MENU_UNIFIE = 'menu-unifie';
/** @type {Set<(timestamp: number) => void>} */
const abonnesMenuUnifie = new Set();

function _tickMenuUnifie(timestamp) {
    for (const fn of abonnesMenuUnifie) {
        fn(timestamp);
    }
}

/**
 * Abonne un callback à la boucle RAF menu unifiée (constellation, ROBO, fonds meta).
 * @param {(timestamp: number) => void} callback
 */
export function abonnerBoucleMenuUnifiee(callback) {
    abonnesMenuUnifie.add(callback);
    if (abonnesMenuUnifie.size === 1) {
        planifierBoucleSecondaire(CLE_MENU_UNIFIE, _tickMenuUnifie);
    }
}

/** @param {(timestamp: number) => void} callback */
export function desabonnerBoucleMenuUnifiee(callback) {
    abonnesMenuUnifie.delete(callback);
    if (abonnesMenuUnifie.size === 0) {
        arreterBoucleSecondaire(CLE_MENU_UNIFIE);
    }
}

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
    abonnesMenuUnifie.clear();
    for (const cle of [...boucles.keys()]) {
        arreterBoucleSecondaire(cle);
    }
}
