/** Chargement runtime des textes histoire depuis JSON (fallback module source en dev). */
import { logger } from './logger.js';

/** @type {typeof import('./histoire-textes.js') | null} */
let cache = null;

/** @type {Promise<typeof import('./histoire-textes.js')> | null} */
let promesse = null;

async function chargerDepuisJson() {
    const reponse = await fetch('./data/histoire-textes.json');
    if (!reponse.ok) {
        throw new Error('Impossible de charger data/histoire-textes.json');
    }
    return /** @type {typeof import('./histoire-textes.js')} */ (await reponse.json());
}

async function chargerDepuisModuleSource() {
    logger.warn('[histoire] fallback vers histoire-textes.js');
    return import('./histoire-textes.js');
}

export async function chargerHistoireTextes() {
    if (cache) return cache;
    if (!promesse) {
        promesse = chargerDepuisJson()
            .catch(async (err) => {
                logger.warn('[histoire] JSON indisponible, tentative fallback', err);
                return chargerDepuisModuleSource();
            })
            .then((textes) => {
                cache = textes;
                return textes;
            });
    }
    return promesse;
}

/** @returns {typeof import('./histoire-textes.js')} */
export function obtenirHistoireTextesSync() {
    if (!cache) {
        throw new Error(
            '[histoire] Textes non disponibles — appelez await chargerHistoireTextes() avant obtenirHistoireTextesSync()'
        );
    }
    return cache;
}
