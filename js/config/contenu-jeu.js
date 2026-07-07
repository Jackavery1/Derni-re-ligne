export const RELIQUES = {};
export const METEO_BIOMES = {};
export const INFOBULLES_MODES_JEU = {};

/** @type {Promise<void> | null} */
let _chargePromise = null;

export function contenuJeuCharge() {
    return Object.keys(RELIQUES).length > 0;
}

/** @returns {Promise<void>} */
export async function chargerContenuJeu() {
    if (contenuJeuCharge()) return;
    if (_chargePromise) return _chargePromise;
    _chargePromise = fetch('./data/contenu-jeu.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`contenu-jeu.json : ${reponse.status}`);
            return reponse.json();
        })
        .then((donnees) => {
            Object.assign(RELIQUES, donnees.RELIQUES ?? {});
            Object.assign(METEO_BIOMES, donnees.METEO_BIOMES ?? {});
            Object.assign(INFOBULLES_MODES_JEU, donnees.INFOBULLES_MODES ?? {});
        });
    return _chargePromise;
}
