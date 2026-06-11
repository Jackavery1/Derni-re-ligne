import { MUSIQUE_BIOMES } from './audio-donnees.js';
import { BIOMES_HISTOIRE } from './biomes-histoire.js';

/** Profils solo utilisés comme gabarit mélodique pour les biomes histoire. */
const TEMPLATE_PAR_BIOME_HISTOIRE = {
    rouille: 'lave',
    eclipse: 'glace',
    vide: 'cosmos',
    miroir: 'cyber',
    trame: 'cosmos',
    paradoxe: 'classique',
};

/** @type {Record<string, import('./audio-donnees.js').MUSIQUE_BIOMES[string]>} */
const cacheFallback = {};

/**
 * Fallback procédural : réutilise la mélodie d'un biome solo proche
 * avec tempo/gamme/timbre du biome histoire (champ `musique` dans biomes-histoire.js).
 * @param {string} biomeId
 */
export function obtenirConfigMusiqueBiome(biomeId) {
    if (MUSIQUE_BIOMES[biomeId]) return MUSIQUE_BIOMES[biomeId];
    if (cacheFallback[biomeId]) return cacheFallback[biomeId];

    const meta = BIOMES_HISTOIRE[biomeId]?.musique;
    if (!meta) return null;

    const templateId = TEMPLATE_PAR_BIOME_HISTOIRE[biomeId] ?? 'classique';
    const template = MUSIQUE_BIOMES[templateId];
    if (!template) return null;

    const config = {
        ...template,
        tempo: meta.tempo ?? template.tempo,
        gamme: meta.gamme ?? template.gamme,
        timbre: meta.timbre ?? template.timbre,
        basse: meta.basse ?? template.basse,
    };

    if (!config.basse) {
        config.basseLine = null;
    }

    cacheFallback[biomeId] = config;
    return config;
}

export function _reinitialiserCacheMusiqueFallback() {
    for (const k of Object.keys(cacheFallback)) delete cacheFallback[k];
}
