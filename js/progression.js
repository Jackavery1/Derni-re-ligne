import { BIOMES } from './config.js';
import { logger } from './logger.js';

export const SEUIL_ETOILE_2 = 5000;
export const SEUIL_ETOILE_3 = 15000;

const CLES_STOCKAGE = new Set([
    'tetrisNeo_volume',
    'tetrisNeo_volumeMusique',
    'tetrisNeo_muet',
    'tetrisNeo_contraste',
    'tetrisNeo_niveauGlobal',
    'tetrisNeo_biomeActif',
    'tetrisNeo_codex',
    'tetrisNeo_codexVus',
    'tetrisNeo_statsGlobales',
    'tetrisNeo_profilDernier',
]);

/** @param {string} cle */
function estCleValide(cle) {
    if (CLES_STOCKAGE.has(cle)) return true;
    if (/^tetrisNeo_record_[a-z]+$/.test(cle)) return true;
    return /^tetrisNeo_archi_[a-z_]+$/.test(cle);
}

/** @param {unknown} valeur @returns {value is string[]} */
export function estTableauIds(valeur) {
    return (
        Array.isArray(valeur) && valeur.every((item) => typeof item === 'string' && item.length > 0)
    );
}

/** @param {string} brut @returns {Set<string>} */
export function parserIdsStockage(brut) {
    if (!brut) return new Set();
    try {
        const parsed = JSON.parse(brut);
        return estTableauIds(parsed) ? new Set(parsed) : new Set();
    } catch {
        return new Set();
    }
}

/** @param {string} cle @param {unknown} defaut @returns {unknown} */
export function lireStockageJson(cle, defaut) {
    const brut = lireStockage(cle, '');
    if (!brut) return defaut;
    try {
        return JSON.parse(brut);
    } catch (err) {
        logger.warn('JSON localStorage invalide:', cle, err);
        return defaut;
    }
}

/** @param {string} cle @param {unknown} valeur @returns {boolean} */
export function ecrireStockageJson(cle, valeur) {
    try {
        return ecrireStockage(cle, JSON.stringify(valeur));
    } catch (err) {
        logger.warn('Sérialisation localStorage impossible:', cle, err);
        return false;
    }
}

/** @param {string} cle @param {string} defaut @returns {string} */
export function lireStockage(cle, defaut) {
    if (!estCleValide(cle)) {
        logger.warn('Clé localStorage inconnue:', cle);
        return defaut;
    }
    try {
        return localStorage.getItem(cle) ?? defaut;
    } catch (err) {
        logger.warn('Lecture localStorage impossible:', err);
        return defaut;
    }
}

/** @param {string} cle @param {string} valeur @returns {boolean} */
export function ecrireStockage(cle, valeur) {
    if (!estCleValide(cle)) {
        logger.warn('Écriture localStorage refusée, clé inconnue:', cle);
        return false;
    }
    try {
        localStorage.setItem(cle, valeur);
        return true;
    } catch (err) {
        logger.warn('Écriture localStorage impossible:', err);
        return false;
    }
}

/** @param {number} score @param {number} lignes @returns {number} */
export function calculerPointsProgression(score, lignes) {
    if (score <= 0) return 0;
    const parScore = Math.floor(score / 2000);
    const parLignes = Math.floor(lignes / 8);
    return Math.max(1, parScore + parLignes);
}

/** @param {number} niveauGlobal @param {number} niveauDeblocage @returns {boolean} */
export function biomeEstDebloque(niveauGlobal, niveauDeblocage) {
    return niveauGlobal >= niveauDeblocage;
}

/** @param {number} record @returns {0|1|2|3} */
export function calculerEtoiles(record) {
    if (record >= SEUIL_ETOILE_3) return 3;
    if (record >= SEUIL_ETOILE_2) return 2;
    if (record > 0) return 1;
    return 0;
}

/** @param {number} nbEtoiles @returns {string} */
export function formaterEtoiles(nbEtoiles) {
    const n = Math.max(0, Math.min(3, nbEtoiles));
    return '★'.repeat(n) + '☆'.repeat(3 - n);
}

/** @returns {number} */
export function chargerNiveauGlobal() {
    const brut = parseInt(lireStockage('tetrisNeo_niveauGlobal', '0'), 10);
    return Number.isFinite(brut) && brut >= 0 ? brut : 0;
}

/** @param {number} niveauGlobal */
export function sauvegarderNiveauGlobal(niveauGlobal) {
    ecrireStockage('tetrisNeo_niveauGlobal', Math.max(0, Math.floor(niveauGlobal)).toString());
}

/** @returns {string} */
export function chargerBiomeActif() {
    const biomeSauve = lireStockage('tetrisNeo_biomeActif', 'classique');
    return BIOMES[biomeSauve] ? biomeSauve : 'classique';
}

/** @param {string} biomeId */
export function sauvegarderBiomeActif(biomeId) {
    if (!BIOMES[biomeId]) return;
    ecrireStockage('tetrisNeo_biomeActif', biomeId);
}

/** @param {string} idBiome @returns {number} */
export function obtenirRecordBiome(idBiome) {
    if (!BIOMES[idBiome]) return 0;
    const brut = parseInt(lireStockage(`tetrisNeo_record_${idBiome}`, '0'), 10);
    return Number.isFinite(brut) && brut >= 0 ? brut : 0;
}

/** @param {string} idBiome @param {number} score @returns {boolean} */
export function sauvegarderRecordBiome(idBiome, score) {
    if (!BIOMES[idBiome] || !Number.isFinite(score) || score < 0) return false;
    const recordActuel = obtenirRecordBiome(idBiome);
    if (score > recordActuel) {
        ecrireStockage(`tetrisNeo_record_${idBiome}`, Math.floor(score).toString());
        return true;
    }
    return false;
}
