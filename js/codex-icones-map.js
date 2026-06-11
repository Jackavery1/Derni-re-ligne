/** @type {Record<string, string>} */
export const ICONE_PAR_ENTREE = {
    monde_classique: 'monde_prologue',
    monde_lave: 'monde_lave',
    monde_ocean: 'monde_ocean',
    monde_foret: 'monde_foret',
    monde_glace: 'monde_glace',
    monde_desert: 'monde_desert',
    monde_cyber: 'monde_cyber',
    monde_fuochi: 'monde_fuochi',
    monde_cosmos: 'monde_cosmos',
    monde_rouille: 'monde_rouille',
    monde_eclipse: 'monde_eclipse',
    monde_vide: 'monde_vide',
    monde_miroir_codex: 'monde_miroir',
    monde_trame_codex: 'monde_trame',
    relique_omega: 'relique_omega',
    relique_magma: 'relique_magma',
    relique_bulle: 'relique_bulle',
    relique_spore: 'relique_spore',
    relique_blizzard: 'relique_blizzard',
    relique_sable: 'relique_sable',
    relique_virus: 'relique_virus',
    relique_fusee: 'relique_fusee',
    relique_nexus: 'relique_nexus',
    chronique_premier_tetris: 'chronique_eclair',
    chronique_inferno_survivant: 'monde_lave',
    chronique_meteo_survive: 'chronique_foudre',
    chronique_chaos_maitrise: 'chronique_chaos',
    chronique_compositeur: 'chronique_musique',
    chronique_mille_lignes: 'chronique_trophee',
    chronique_globe_trotter: 'chronique_globe',
    chronique_grand_maitre: 'chronique_medaille',
    chronique_oracle: 'chronique_oracle',
    chronique_architecte: 'chronique_architecte',
    chronique_vivant: 'relique_spore',
    chronique_vera: 'chronique_vera',
    chronique_distorsion: 'monde_finale',
    chronique_brasier: 'monde_boss_1',
    chronique_sentinelle: 'monde_boss_2',
    chronique_archiviste: 'monde_boss_3',
    chemins_caches: 'ach_secrets',
    chronique_avantgarde: 'monde_boss_4',
    chronique_fins: 'chronique_fins',
};

/** @type {Record<string, string>} */
export const ACCENT_PAR_ENTREE = {
    monde_classique: '#00ddc8',
    monde_lave: '#ff6a00',
    monde_rouille: '#ff6a00',
    monde_ocean: '#00cfff',
    monde_foret: '#00cfff',
    monde_glace: '#00cfff',
    monde_desert: '#ffbb44',
    monde_eclipse: '#ffbb44',
    monde_cyber: '#ffbb44',
    monde_fuochi: '#b400ff',
    monde_cosmos: '#b400ff',
    monde_vide: '#b400ff',
    monde_miroir_codex: '#ffffff',
    monde_trame_codex: '#ffffff',
    relique_omega: '#6644cc',
    relique_magma: '#ff6a00',
    relique_bulle: '#00cfff',
    relique_spore: '#44ff88',
    relique_blizzard: '#aaddff',
    relique_sable: '#ffbb44',
    relique_virus: '#44ff88',
    relique_fusee: '#ff2d78',
    relique_nexus: '#b400ff',
    chronique_premier_tetris: '#00ddc8',
    chronique_inferno_survivant: '#ff6a00',
    chronique_meteo_survive: '#00cfff',
    chronique_chaos_maitrise: '#6644cc',
    chronique_compositeur: '#ff2d78',
    chronique_mille_lignes: '#ffbb44',
    chronique_globe_trotter: '#00ddc8',
    chronique_grand_maitre: '#ffbb44',
    chronique_oracle: '#b400ff',
    chronique_architecte: '#6644cc',
    chronique_vivant: '#44ff88',
    chronique_vera: '#b400ff',
    chronique_distorsion: '#ff006e',
    chronique_brasier: '#ff6a00',
    chronique_sentinelle: '#00cfff',
    chronique_archiviste: '#ffbb44',
    chemins_caches: '#b400ff',
    chronique_avantgarde: '#b400ff',
    chronique_fins: '#ffffff',
};

const ACCENT_DEFAUT = '#6644cc';

/**
 * @param {string} entreeId
 * @returns {string}
 */
export function obtenirIdIcone(entreeId) {
    return ICONE_PAR_ENTREE[entreeId] ?? 'monde_prologue';
}

/**
 * @param {string} entreeId
 * @returns {string}
 */
export function obtenirAccentEntree(entreeId) {
    return ACCENT_PAR_ENTREE[entreeId] ?? ACCENT_DEFAUT;
}
