import { CONDITIONS_CODEX } from './codex-conditions.js';

/** @typedef {import('./codex/codex-types.js').EntreeCodex} EntreeCodex */
/** @typedef {Record<string, EntreeCodex>} CODEX */

/** @param {Record<string, object>} textes */
function assemblerCodex(textes) {
    /** @type {CODEX} */
    const codex = {};
    for (const [id, entree] of Object.entries(textes)) {
        const condition = CONDITIONS_CODEX[id];
        if (typeof condition !== 'function') {
            throw new Error(`[codex] condition manquante pour ${id}`);
        }
        codex[id] = { ...entree, condition };
    }
    return codex;
}

/** @type {CODEX | null} */
let cache = null;
/** @type {Promise<CODEX> | null} */
let promesse = null;

export async function chargerCodexComplet() {
    if (cache) return cache;
    if (!promesse) {
        promesse = fetch('./data/codex-textes.json')
            .then((reponse) => {
                if (!reponse.ok) {
                    throw new Error('Impossible de charger data/codex-textes.json');
                }
                return reponse.json();
            })
            .then((textes) => {
                cache = assemblerCodex(textes);
                return cache;
            })
            .catch((err) => {
                promesse = null;
                throw err;
            });
    }
    return promesse;
}
