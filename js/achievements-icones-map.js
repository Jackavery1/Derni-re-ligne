/** @type {Record<string, string>} */
export const ICONE_PAR_CATEGORIE = {
    score: 'ach_score',
    lignes: 'ach_score',
    survie: 'ach_score',
    meteo: 'ach_score',
    coop: 'ach_score',
    oracle: 'ach_vera',
    biomes: 'ach_biomes',
    reliques: 'ach_biomes',
    vivant: 'ach_biomes',
    histoire: 'ach_histoire',
    histoire_boss: 'ach_boss',
    histoire_vera: 'ach_vera',
    histoire_fins: 'ach_fins',
    histoire_secrets: 'ach_secrets',
    histoire_prouesses: 'ach_prouesses',
    maitrise: 'ach_prouesses',
    architecte: 'ach_fins',
};

/** @type {Record<string, string>} */
export const ICONE_PAR_ACHIEVEMENT = {
    premier_tetris: 'chronique_eclair',
    centenaire: 'ach_score',
    millenaire: 'chronique_trophee',
    score_10k: 'ach_etoile',
    score_50k: 'ach_etoile',
    score_100k: 'ach_couronne',
    survivant_3min: 'ach_sablier',
    survivant_10min: 'ach_flamme',
    explorateur: 'ach_biomes',
    globe_trotter: 'chronique_globe',
    inferno_survivor: 'monde_lave',
    cosmos_master: 'monde_cosmos',
    reliquaire: 'relique_omega',
    collectionneur: 'relique_nexus',
    meteorologue: 'chronique_foudre',
    chaos_maitrise: 'chronique_chaos',
    combo_fou: 'ach_prouesses',
    robo_ami: 'ach_robot',
    compositeur: 'chronique_musique',
    grand_maitre: 'chronique_medaille',
    oracle_debutant: 'chronique_oracle',
    oracle_maitre: 'ach_etoile',
    premiers_pas_coop: 'ach_score',
    synchro_parfaite: 'ach_prouesses',
    archi_premier: 'chronique_architecte',
    archi_etoiles: 'ach_etoile',
    archi_parfait: 'ach_fragment',
    archi_econome: 'ach_fragment',
    vivant_premier: 'relique_spore',
    vivant_survivant: 'monde_foret',
    vivant_tous_biomes: 'chronique_globe',
    vivant_maitre: 'ach_flamme',
};

/** @type {Record<string, string>} */
export const ACCENT_PAR_CATEGORIE = {
    score: '#00ddc8',
    lignes: '#00ddc8',
    survie: '#00ddc8',
    meteo: '#00ddc8',
    coop: '#00ddc8',
    oracle: '#00ddc8',
    biomes: '#ff6a00',
    reliques: '#ff6a00',
    vivant: '#ff6a00',
    histoire: '#ff2d78',
    histoire_boss: '#ff006e',
    histoire_vera: '#ff99ff',
    histoire_fins: '#ffbb44',
    histoire_secrets: '#b400ff',
    histoire_prouesses: '#44ff88',
    maitrise: '#44ff88',
    architecte: '#ffbb44',
};

/** @type {Record<string, string>} */
export const ACCENT_PAR_FILTRE = {
    tous: '#ffbb44',
    score: '#00ddc8',
    biomes: '#ff6a00',
    histoire: '#ff2d78',
    histoire_boss: '#ff006e',
    histoire_vera: '#ff99ff',
    histoire_fins: '#ffbb44',
    histoire_secrets: '#b400ff',
    histoire_prouesses: '#44ff88',
};

const CATEGORIES_INDICE_MASQUE = new Set([
    'histoire',
    'histoire_vera',
    'histoire_fins',
    'histoire_secrets',
]);

const FRAGMENT_NON_GRAVE = 'Fragment non gravé';

/**
 * @param {string} achievementId
 * @param {string} categorie
 * @returns {string}
 */
export function obtenirIdIconeAchievement(achievementId, categorie) {
    return ICONE_PAR_ACHIEVEMENT[achievementId] ?? ICONE_PAR_CATEGORIE[categorie] ?? 'ach_fragment';
}

/**
 * @param {string} categorie
 * @returns {string}
 */
export function obtenirAccentCategorie(categorie) {
    return ACCENT_PAR_CATEGORIE[categorie] ?? '#6644cc';
}

/**
 * @param {string} filtre
 * @returns {string}
 */
export function obtenirAccentFiltre(filtre) {
    return ACCENT_PAR_FILTRE[filtre] ?? '#ffbb44';
}

/**
 * @param {string} categorie
 * @param {string} description
 * @returns {string}
 */
export function obtenirTexteVerrouille(categorie, description) {
    if (CATEGORIES_INDICE_MASQUE.has(categorie)) return FRAGMENT_NON_GRAVE;
    return description;
}
