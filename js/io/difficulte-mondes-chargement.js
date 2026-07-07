export const PALIERS_VITESSE_MS = {};
export let VITESSE_PLANCHER_MS = 120;
export const DIFFICULTE_MONDES = {};

/** @type {Promise<void> | null} */
let _chargePromise = null;

export function difficulteMondesChargee() {
    return Object.keys(DIFFICULTE_MONDES).length > 0;
}

/** @returns {Promise<void>} */
export async function chargerDifficulteMondes() {
    if (difficulteMondesChargee()) return;
    if (_chargePromise) return _chargePromise;
    _chargePromise = fetch('./data/difficulte-mondes.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`difficulte-mondes.json : ${reponse.status}`);
            return reponse.json();
        })
        .then((donnees) => {
            Object.assign(PALIERS_VITESSE_MS, donnees.PALIERS_VITESSE_MS ?? {});
            if (typeof donnees.VITESSE_PLANCHER_MS === 'number') {
                VITESSE_PLANCHER_MS = donnees.VITESSE_PLANCHER_MS;
            }
            Object.assign(DIFFICULTE_MONDES, donnees.DIFFICULTE_MONDES ?? {});
        });
    return _chargePromise;
}
