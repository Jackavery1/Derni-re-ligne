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
    chronique_vivant: 'monde_foret',
    chronique_vera: 'chronique_vera',
    chronique_distorsion: 'monde_finale',
    chronique_brasier: 'monde_boss_1',
    chronique_sentinelle: 'monde_boss_2',
    chronique_archiviste: 'monde_boss_3',
    chemins_caches: 'monde_miroir',
    chronique_avantgarde: 'monde_boss_4',
    chronique_fins: 'chronique_fins',
    chronique_paradoxe: 'monde_trame',
};

/** @type {Record<string, string>} */
export const ACCENT_PAR_ENTREE = {
    monde_classique: '#00f5ff',
    monde_lave: '#ff4500',
    monde_rouille: '#cd6839',
    monde_ocean: '#00cfff',
    monde_foret: '#00cc44',
    monde_glace: '#aaeeff',
    monde_desert: '#ffbb44',
    monde_eclipse: '#ffd700',
    monde_cyber: '#ff00ff',
    monde_fuochi: '#ffe600',
    monde_cosmos: '#7700ff',
    monde_vide: '#6a5878',
    monde_miroir_codex: '#ff8800',
    monde_trame_codex: '#7700ff',
    relique_omega: '#6644cc',
    relique_magma: '#ff4500',
    relique_bulle: '#00cfff',
    relique_spore: '#44ff88',
    relique_blizzard: '#aaeeff',
    relique_sable: '#ffbb44',
    relique_virus: '#ff00ff',
    relique_fusee: '#ffe600',
    relique_nexus: '#7700ff',
    chronique_premier_tetris: '#00f5ff',
    chronique_inferno_survivant: '#ff4500',
    chronique_meteo_survive: '#00cfff',
    chronique_chaos_maitrise: '#6644cc',
    chronique_compositeur: '#ff2d78',
    chronique_mille_lignes: '#ffbb44',
    chronique_globe_trotter: '#00f5ff',
    chronique_grand_maitre: '#ffe600',
    chronique_oracle: '#b400ff',
    chronique_architecte: '#ffbb44',
    chronique_vivant: '#00cc44',
    chronique_vera: '#ff99ff',
    chronique_distorsion: '#ff006e',
    chronique_brasier: '#ff4500',
    chronique_sentinelle: '#aaeeff',
    chronique_archiviste: '#ff00ff',
    chemins_caches: '#ff8800',
    chronique_avantgarde: '#7700ff',
    chronique_fins: '#ffe600',
    chronique_paradoxe: '#7700ff',
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
