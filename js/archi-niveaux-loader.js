/** @typedef {import('./archi-donnees.js').NiveauArchi} NiveauArchi */

/** @type {NiveauArchi[] | null} */
let cache = null;
/** @type {Promise<NiveauArchi[]> | null} */
let promesse = null;

export async function chargerNiveauxArchi() {
    if (cache) return cache;
    if (!promesse) {
        promesse = fetch('./data/archi-niveaux.json')
            .then((reponse) => {
                if (!reponse.ok) {
                    throw new Error('Impossible de charger data/archi-niveaux.json');
                }
                return reponse.json();
            })
            .then((niveaux) => {
                cache = niveaux;
                return cache;
            })
            .catch((err) => {
                promesse = null;
                throw err;
            });
    }
    return promesse;
}
