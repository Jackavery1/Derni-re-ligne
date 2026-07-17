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
    rouille: 'monde_rouille',
    eclipse: 'monde_eclipse',
    vide: 'monde_vide',
    miroir: 'monde_miroir',
    trame: 'monde_trame',
    paradoxe: 'monde_trame',
};

/** @type {Record<string, string>} */
export const ICONE_MONDE_HISTOIRE = {
    monde_prologue: 'monde_prologue',
    monde_lave: 'monde_lave',
    monde_rouille: 'monde_rouille',
    monde_boss_1: 'monde_boss_1',
    monde_ocean: 'monde_ocean',
    monde_foret: 'monde_foret',
    monde_glace: 'monde_glace',
    monde_boss_2: 'monde_boss_2',
    monde_desert: 'monde_desert',
    monde_eclipse: 'monde_eclipse',
    monde_cyber: 'monde_cyber',
    monde_boss_3: 'monde_boss_3',
    monde_fuochi: 'monde_fuochi',
    monde_cosmos: 'monde_cosmos',
    monde_vide: 'monde_vide',
    monde_boss_4: 'monde_boss_4',
    monde_finale: 'monde_finale',
    monde_miroir: 'monde_miroir',
    monde_trame: 'monde_trame',
    monde_paradoxe: 'monde_trame',
};

/**
 * @param {string} biomeId
 * @returns {string}
 */
export function obtenirIdIconeBiome(biomeId) {
    return ICONE_BIOME[biomeId] ?? 'chronique_architecte';
}

/**
 * @param {string} mondeId
 * @param {string} [biomeId]
 * @returns {string}
 */
export function obtenirIdIconeMondeHistoire(mondeId, biomeId = 'classique') {
    return ICONE_MONDE_HISTOIRE[mondeId] ?? obtenirIdIconeBiome(biomeId);
}
