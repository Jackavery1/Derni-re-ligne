export const BIOMES = {};
export const ORDRE_BIOMES = [];
export const ORDRE_BIOMES_LIBRE = [];
export const BIOMES_HISTOIRE = {};
export const ORDRE_BIOMES_HISTOIRE = [];

/** @type {Promise<void> | null} */
let _chargePromise = null;

export function biomesCharges() {
    return ORDRE_BIOMES.length > 0;
}

/** @returns {Promise<void>} */
export async function chargerBiomesJeu() {
    if (biomesCharges()) return;
    if (_chargePromise) return _chargePromise;
    _chargePromise = fetch('./data/biomes.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`biomes.json : ${reponse.status}`);
            return reponse.json();
        })
        .then((donnees) => {
            Object.assign(BIOMES, donnees.BIOMES ?? {});
            if (donnees.BIOMES_HISTOIRE) {
                Object.assign(BIOMES_HISTOIRE, donnees.BIOMES_HISTOIRE);
                Object.assign(BIOMES, donnees.BIOMES_HISTOIRE);
            }
            ORDRE_BIOMES.push(...(donnees.ORDRE_BIOMES ?? []));
            ORDRE_BIOMES_HISTOIRE.push(...(donnees.ORDRE_BIOMES_HISTOIRE ?? []));
            ORDRE_BIOMES_LIBRE.push(
                ...(donnees.ORDRE_BIOMES_LIBRE ?? [...ORDRE_BIOMES, ...ORDRE_BIOMES_HISTOIRE])
            );
        });
    return _chargePromise;
}
