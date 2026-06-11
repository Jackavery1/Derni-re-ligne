import { lireStockageJson, ecrireStockageJson } from './progression.js';
import { MUSIQUE_BIOMES } from './audio-donnees.js';

const CLE_MIX = 'derniereLigne_mixBiomes';

/** @typedef {{ musique: number, effets: number }} MixBiome */

/** @returns {Record<string, MixBiome>} */
function lireTousMix() {
    const brut = lireStockageJson(CLE_MIX, {});
    return typeof brut === 'object' && brut !== null
        ? /** @type {Record<string, MixBiome>} */ (brut)
        : {};
}

/** @param {string} biomeId @returns {MixBiome} */
function mixProfilDefaut(biomeId) {
    const profil = MUSIQUE_BIOMES[biomeId];
    const musique = profil?.volumeMelodie != null ? Math.min(1.2, profil.volumeMelodie / 0.28) : 1;
    return { musique, effets: 1 };
}

/** @param {string} biomeId @returns {MixBiome} */
export function obtenirMixBiome(biomeId) {
    const id = biomeId || 'classique';
    const perso = lireTousMix()[id];
    const defaut = mixProfilDefaut(id);
    return {
        musique: perso?.musique ?? defaut.musique,
        effets: perso?.effets ?? defaut.effets,
    };
}

/** @param {string} biomeId @param {Partial<MixBiome>} mix */
export function persisterMixBiome(biomeId, mix) {
    const id = biomeId || 'classique';
    const tous = lireTousMix();
    const actuel = obtenirMixBiome(id);
    tous[id] = {
        musique: mix.musique ?? actuel.musique,
        effets: mix.effets ?? actuel.effets,
    };
    ecrireStockageJson(CLE_MIX, tous);
}

/** @param {string} biomeId @returns {number} */
export function obtenirMultiplicateurMusiqueBiome(biomeId) {
    return obtenirMixBiome(biomeId).musique;
}

/** @param {string} biomeId @returns {number} */
export function obtenirMultiplicateurEffetsBiome(biomeId) {
    return obtenirMixBiome(biomeId).effets;
}
