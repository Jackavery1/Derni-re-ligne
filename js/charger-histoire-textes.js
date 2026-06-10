/** @type {typeof import('./histoire-textes.js') | null} */
let cache = null;

/** @type {Promise<typeof import('./histoire-textes.js')> | null} */
let promesse = null;

export async function chargerHistoireTextes() {
    if (cache) return cache;
    if (!promesse) {
        promesse = fetch('./data/histoire-textes.json').then(async (reponse) => {
            if (!reponse.ok) {
                throw new Error('Impossible de charger data/histoire-textes.json');
            }
            cache = /** @type {typeof import('./histoire-textes.js')} */ (await reponse.json());
            return cache;
        });
    }
    return promesse;
}

/** @returns {typeof import('./histoire-textes.js')} */
export function obtenirHistoireTextesSync() {
    if (!cache) {
        throw new Error('Textes histoire non charges — appeler chargerHistoireTextes() avant');
    }
    return cache;
}
