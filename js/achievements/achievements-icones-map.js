/** @type {Record<string, string>} */
export const ICONE_PAR_CATEGORIE = {
    score: 'ach_score',
    lignes: 'ach_score',
    survie: 'ach_sablier',
    meteo: 'chronique_foudre',
    coop: 'ach_biomes',
    oracle: 'chronique_oracle',
    biomes: 'ach_biomes',
    reliques: 'relique_omega',
    vivant: 'monde_foret',
    histoire: 'monde_prologue',
    histoire_boss: 'ach_boss',
    histoire_vera: 'chronique_vera',
    histoire_fins: 'chronique_fins',
    histoire_secrets: 'ach_secrets',
    histoire_prouesses: 'ach_prouesses',
    maitrise: 'ach_prouesses',
    architecte: 'chronique_architecte',
};

/** @type {Record<string, string>} */
export const ICONE_PAR_ACHIEVEMENT = {
    premiere_ligne: 'ach_score',
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
    combo_fou: 'chronique_eclair',
    robo_ami: 'ach_robot',
    compositeur: 'chronique_musique',
    grand_maitre: 'chronique_medaille',
    oracle_debutant: 'chronique_oracle',
    oracle_maitre: 'chronique_oracle',
    premiers_pas_coop: 'ach_biomes',
    synchro_parfaite: 'chronique_chaos',
    archi_premier: 'chronique_architecte',
    archi_etoiles: 'ach_etoile',
    archi_parfait: 'chronique_architecte',
    archi_econome: 'ach_sablier',
    vivant_premier: 'monde_foret',
    vivant_survivant: 'monde_foret',
    vivant_tous_biomes: 'chronique_globe',
    vivant_maitre: 'relique_spore',
    premier_monde: 'monde_prologue',
    premier_chapitre: 'monde_boss_1',
    tous_chapitres: 'chronique_globe',
    premier_boss: 'monde_boss_1',
    tous_boss: 'monde_finale',
    sans_continue: 'ach_couronne',
    boss_rapide: 'chronique_eclair',
    premier_journal: 'chronique_vera',
    cinq_journaux: 'chronique_vera',
    tous_journaux: 'chronique_vera',
    labo_vera: 'monde_cyber',
    fin_normale_obtenue: 'chronique_fins',
    fin_vraie_obtenue: 'monde_miroir',
    fin_secrete_obtenue: 'monde_trame',
    toutes_fins: 'chronique_fins',
    miroir_decouvert: 'monde_miroir',
    miroir_complete: 'monde_miroir',
    trame_decouverte: 'monde_trame',
    trame_complete: 'monde_trame',
    paradoxe_atteint: 'monde_trame',
    rouille_maitrise: 'monde_rouille',
    eclipse_equilibre: 'monde_eclipse',
    vide_survivant: 'monde_vide',
    miroir_sans_erreur: 'monde_miroir',
    patience_distorsion: 'monde_finale',
};

/** @type {Record<string, string>} */
export const ACCENT_PAR_CATEGORIE = {
    score: '#00ddc8',
    lignes: '#00ddc8',
    survie: '#00ddc8',
    meteo: '#00cfff',
    coop: '#ff2d78',
    oracle: '#b400ff',
    biomes: '#ff6a00',
    reliques: '#6644cc',
    vivant: '#00cc44',
    histoire: '#ff2d78',
    histoire_boss: '#ff006e',
    histoire_vera: '#ff99ff',
    histoire_fins: '#ffbb44',
    histoire_secrets: '#7700ff',
    histoire_prouesses: '#cd6839',
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
    histoire_secrets: '#7700ff',
    histoire_prouesses: '#44ff88',
};

const CATEGORIES_INDICE_MASQUE = new Set([
    'histoire',
    'histoire_vera',
    'histoire_fins',
    'histoire_secrets',
]);

const FRAGMENT_NON_GRAVE = 'Fragment non gravé';
const FRAGMENT_PANNEAU = 'Fragment non gravé. La Trame ne révèle pas encore ce souvenir.';
const FRAGMENT_PANNEAU_HISTOIRE =
    'Fragment non gravé. Progressez en MODE HISTOIRE pour révéler cet exploit.';

/** @type {Record<string, string>} */
const LIBELLE_CATEGORIE_FILTRE = {
    score: 'SCORE',
    lignes: 'SCORE',
    survie: 'SCORE',
    meteo: 'SCORE',
    coop: 'SCORE',
    oracle: 'SCORE',
    biomes: 'BIOMES',
    reliques: 'BIOMES',
    vivant: 'BIOMES',
    histoire: 'HISTOIRE',
    histoire_boss: 'BOSS',
    histoire_vera: 'VERA',
    histoire_fins: 'FINS',
    histoire_secrets: 'SECRETS',
    histoire_prouesses: 'PROUESSES',
    maitrise: 'PROUESSES',
    architecte: 'FINS',
};

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
 * @returns {boolean}
 */
export function estCategorieIndiceMasque(categorie) {
    return CATEGORIES_INDICE_MASQUE.has(categorie);
}

/**
 * @param {string} categorie
 * @returns {string}
 */
export function obtenirLibelleCategorieFiltre(categorie) {
    return LIBELLE_CATEGORIE_FILTRE[categorie] ?? categorie.toUpperCase();
}

export function obtenirTexteVerrouille(categorie, description) {
    if (CATEGORIES_INDICE_MASQUE.has(categorie)) return FRAGMENT_NON_GRAVE;
    if (categorie.startsWith('histoire')) return 'Fragment non gravé (Mode Histoire)';
    return description;
}

/**
 * @param {string} categorie
 * @param {string} description
 * @returns {string}
 */
export function obtenirTexteVerrouillePanneau(categorie, description) {
    if (CATEGORIES_INDICE_MASQUE.has(categorie)) return FRAGMENT_PANNEAU;
    if (categorie.startsWith('histoire')) return FRAGMENT_PANNEAU_HISTOIRE;
    return description;
}
