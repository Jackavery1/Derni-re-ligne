export const SEQUENCE_HISTOIRE = [];
export const JOURNAUX_VERA = [];
export const BOSS = {};
export const FINS = {};

/** @type {Promise<void> | null} */
let _chargePromise = null;

export function histoireDonneesMetierChargees() {
    return SEQUENCE_HISTOIRE.length > 0;
}

/** @returns {Promise<void>} */
export async function chargerHistoireDonneesMetier() {
    if (histoireDonneesMetierChargees()) return;
    if (_chargePromise) return _chargePromise;
    _chargePromise = fetch('./data/histoire-donnees.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`histoire-donnees.json : ${reponse.status}`);
            return reponse.json();
        })
        .then((donnees) => {
            SEQUENCE_HISTOIRE.push(...(donnees.SEQUENCE_HISTOIRE ?? []));
            JOURNAUX_VERA.push(...(donnees.JOURNAUX_VERA ?? []));
            Object.assign(BOSS, donnees.BOSS ?? {});
            Object.assign(FINS, donnees.FINS ?? {});
        });
    return _chargePromise;
}
