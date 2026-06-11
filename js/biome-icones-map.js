/** @type {Record<string, string>} */
export const ICONE_BIOME = {
    classique: 'monde_prologue',
    lave: 'monde_lave',
    ocean: 'monde_ocean',
    foret: 'monde_foret',
    glace: 'monde_glace',
    desert: 'monde_desert',
    cyber: 'monde_cyber',
    fuochi: 'monde_fuochi',
    cosmos: 'monde_cosmos',
};

/**
 * @param {string} biomeId
 * @returns {string}
 */
export function obtenirIdIconeBiome(biomeId) {
    return ICONE_BIOME[biomeId] ?? 'chronique_architecte';
}
