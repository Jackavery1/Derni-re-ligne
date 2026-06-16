/** Couche localStorage : clés autorisées, lecture/écriture sécurisée. */
import { logger } from './logger.js';
import { estCleProgressionB10 } from './progression-export-b10.js';

export const PREFIXE_STOCKAGE = 'derniereLigne_';
export const PREFIXE_LEGACY = 'tetrisNeo_';

export const CLES_STOCKAGE = new Set([
    'derniereLigne_volume',
    'derniereLigne_volumeMusique',
    'derniereLigne_muet',
    'derniereLigne_contraste',
    'derniereLigne_daltonien',
    'derniereLigne_reduireEffets',
    'derniereLigne_constellationClicSeul',
    'derniereLigne_mixBiomes',
    'derniereLigne_niveauGlobal',
    'derniereLigne_biomeActif',
    'derniereLigne_codex',
    'derniereLigne_codexVus',
    'derniereLigne_statsGlobales',
    'derniereLigne_profilDernier',
    'derniereLigne_histoire',
    'derniereLigne_histoireJournaux',
    'derniereLigne_histoireBoss',
    'derniereLigne_histoireFin',
    'derniereLigne_journalErreurs',
    'derniereLigne_introHistoireVue',
    'derniereLigne_tutorielVu',
    'derniereLigne_tutorielHistoireVu',
    'derniereLigne_tutorielCoopVu',
    'derniereLigne_tutorielArchitecteVu',
    'derniereLigne_tutorielOracleVu',
    'derniereLigne_tutorielDistorsionVu',
    'derniereLigne_touches',
    'derniereLigne_infobullesBiome',
    'derniereLigne_accentsUi',
    'derniereLigne_infobulleOracleCoop',
    'derniereLigne_defiJour',
    'derniereLigne_devActif',
    'derniereLigne_haptique',
    'derniereLigne_controlesTactiles',
    'derniereLigne_enchainementCampagne',
    'derniereLigne_syncCloudActif',
    'derniereLigne_syncCloudId',
    'derniereLigne_supabaseUrl',
    'derniereLigne_supabaseAnonKey',
]);

/** Préférences conservées lors d'une nouvelle partie. */
export const CLES_PREFERENCES = new Set([
    'derniereLigne_volume',
    'derniereLigne_volumeMusique',
    'derniereLigne_muet',
    'derniereLigne_contraste',
    'derniereLigne_daltonien',
    'derniereLigne_reduireEffets',
    'derniereLigne_constellationClicSeul',
    'derniereLigne_controlesTactiles',
    'derniereLigne_haptique',
    'derniereLigne_enchainementCampagne',
    'derniereLigne_mixBiomes',
    'derniereLigne_touches',
    'derniereLigne_accentsUi',
    'dl_migration_v1',
]);

const MOTIFS_CLES_PROGRESSION = [
    /^derniereLigne_record_[a-z]+$/,
    /^derniereLigne_recniv_[a-z]+$/,
    /^derniereLigne_recordcoop_[a-z]+$/,
    /^derniereLigne_sprint_[a-z]+$/,
    /^derniereLigne_archi_[a-z_]+$/,
    /^derniereLigne_monde_histoire_[a-z_]+$/,
    /^tetrisNeo_record_[a-z]+$/,
    /^tetrisNeo_recniv_[a-z]+$/,
    /^tetrisNeo_recordcoop_[a-z]+$/,
    /^tetrisNeo_sprint_[a-z]+$/,
    /^tetrisNeo_archi_[a-z_]+$/,
    /^tetrisNeo_monde_histoire_[a-z_]+$/,
];

export const CLES_LEGACY = new Set([
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
    'tetrisNeo_histoire',
    'tetrisNeo_histoireJournaux',
    'tetrisNeo_histoireBoss',
    'tetrisNeo_histoireFin',
    'tetrisNeo_journalErreurs',
]);

/** @param {string} cle */
export function estClePreference(cle) {
    return CLES_PREFERENCES.has(cle);
}

/** @param {string} cle */
export function estCleProgression(cle) {
    if (!cle || estClePreference(cle)) return false;
    if (MOTIFS_CLES_PROGRESSION.some((re) => re.test(cle))) return true;
    if (CLES_STOCKAGE.has(cle) && !estClePreference(cle)) return true;
    if (CLES_LEGACY.has(cle)) return true;
    return false;
}

/** Supprime toutes les clés de progression (conserve les préférences joueur). */
export function supprimerStockageProgression() {
    const aSupprimer = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const cle = localStorage.key(i);
            if (!cle) continue;
            if (cle === 'dl_migration_v1') continue;
            if (estClePreference(cle)) continue;
            if (
                cle.startsWith(PREFIXE_STOCKAGE) ||
                cle.startsWith(PREFIXE_LEGACY) ||
                estCleProgression(cle)
            ) {
                aSupprimer.push(cle);
            }
        }
        for (const cle of aSupprimer) {
            localStorage.removeItem(cle);
        }
    } catch (err) {
        logger.warn('[progression] suppression stockage progression:', err);
    }
    return aSupprimer.length;
}

/** @param {string} cle */
function cleCanonique(cle) {
    return cle.startsWith(PREFIXE_LEGACY) ? cle.replace(PREFIXE_LEGACY, PREFIXE_STOCKAGE) : cle;
}

/** @param {string} cle */
function cleLegacy(cle) {
    return cle.startsWith(PREFIXE_STOCKAGE) ? cle.replace(PREFIXE_STOCKAGE, PREFIXE_LEGACY) : cle;
}

export function migrerClesLocalStorage() {
    const MIGRATION_KEY = 'dl_migration_v1';
    if (localStorage.getItem(MIGRATION_KEY)) return;

    const keysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIXE_LEGACY)) keysToMigrate.push(key);
    }

    for (const oldKey of keysToMigrate) {
        const newKey = oldKey.replace(PREFIXE_LEGACY, PREFIXE_STOCKAGE);
        const value = localStorage.getItem(oldKey);
        if (value !== null && localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, value);
        }
    }

    localStorage.setItem(MIGRATION_KEY, '1');
    logger.info('[progression] migration localStorage effectuee');
}

/** @param {string} cle */
export function estCleValide(cle) {
    if (CLES_STOCKAGE.has(cle)) return true;
    if (CLES_LEGACY.has(cle)) return true;
    if (/^tetrisNeo_record_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_record_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_recniv_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_recordcoop_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_sprint_[a-z]+$/.test(cle)) return true;
    if (/^tetrisNeo_monde_histoire_[a-z_]+$/.test(cle)) return true;
    if (/^derniereLigne_monde_histoire_[a-z_]+$/.test(cle)) return true;
    if (/^tetrisNeo_archi_[a-z_]+$/.test(cle)) return true;
    return /^derniereLigne_archi_[a-z_]+$/.test(cle);
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
        logger.warn('Serialisation localStorage impossible:', cle, err);
        return false;
    }
}

/** @param {string} cle @returns {boolean} */
export function existeStockage(cle) {
    if (!estCleValide(cle)) return false;
    const cleN = cleCanonique(cle);
    const cleA = cleLegacy(cleN);
    try {
        if (localStorage.getItem(cleN) !== null) return true;
        if (cleA !== cleN && localStorage.getItem(cleA) !== null) return true;
        return false;
    } catch {
        return false;
    }
}

/** @param {string} cle @param {string} defaut @returns {string} */
export function lireStockage(cle, defaut) {
    if (!estCleValide(cle)) {
        logger.warn('Cle localStorage inconnue:', cle);
        return defaut;
    }
    const cleN = cleCanonique(cle);
    const cleA = cleLegacy(cleN);
    try {
        const valeur = localStorage.getItem(cleN);
        if (valeur !== null) return valeur;
        if (cleA !== cleN) {
            const legacy = localStorage.getItem(cleA);
            if (legacy !== null) return legacy;
        }
        return defaut;
    } catch (err) {
        logger.warn('Lecture localStorage impossible:', err);
        return defaut;
    }
}

/** @type {(() => void) | null} */
let planificateurPushCloud = null;

/** @param {() => void} fn */
export function enregistrerPlanificateurPushCloud(fn) {
    planificateurPushCloud = fn;
}

/** @param {string} cle @param {string} valeur @returns {boolean} */
export function ecrireStockage(cle, valeur) {
    if (!estCleValide(cle)) {
        logger.warn('Écriture localStorage refusee, cle inconnue:', cle);
        return false;
    }
    try {
        localStorage.setItem(cleCanonique(cle), valeur);
        if (estCleProgressionB10(cleCanonique(cle))) {
            planificateurPushCloud?.();
        }
        return true;
    } catch (err) {
        logger.warn('Écriture localStorage impossible:', err);
        return false;
    }
}

export {
    VERSION_EXPORT_PROGRESSION,
    estCleProgressionB10,
    listerClesProgressionB10Locales,
    exporterProgressionB10,
    importerProgressionB10,
} from './progression-export-b10.js';
