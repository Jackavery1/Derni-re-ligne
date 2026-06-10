import { BIOMES } from './config.js';
import { ETAT_HISTOIRE_VIDE, JOURNAUX_VERA } from './histoire-donnees.js';
import { logger } from './logger.js';
import { modeDevActif } from './mode-dev-etat.js';

export const SEUIL_ETOILE_2 = 5000;
export const SEUIL_ETOILE_3 = 15000;

const PREFIXE_STOCKAGE = 'derniereLigne_';
const PREFIXE_LEGACY = 'tetrisNeo_';

const CLES_STOCKAGE = new Set([
    'derniereLigne_volume',
    'derniereLigne_volumeMusique',
    'derniereLigne_muet',
    'derniereLigne_contraste',
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
]);

const CLES_LEGACY = new Set([
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
function cleCanonique(cle) {
    return cle.startsWith(PREFIXE_LEGACY) ? cle.replace(PREFIXE_LEGACY, PREFIXE_STOCKAGE) : cle;
}

/** @param {string} cle */
function cleLegacy(cle) {
    return cle.startsWith(PREFIXE_STOCKAGE) ? cle.replace(PREFIXE_STOCKAGE, PREFIXE_LEGACY) : cle;
}

/**
 * Migration des cles localStorage tetrisNeo_* → derniereLigne_*
 * Executee une seule fois au premier lancement post-renommage.
 * Conserve les sauvegardes existantes.
 */
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
    console.info('[DerniereLigne] migration localStorage effectuee');
}

/** @param {string} cle */
function estCleValide(cle) {
    if (CLES_STOCKAGE.has(cle)) return true;
    if (CLES_LEGACY.has(cle)) return true;
    if (cle.startsWith(PREFIXE_STOCKAGE)) return true;
    if (/^tetrisNeo_record_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_record_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_recniv_[a-z]+$/.test(cle)) return true;
    if (/^derniereLigne_recordcoop_[a-z]+$/.test(cle)) return true;
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

/** @param {string} cle @param {string} valeur @returns {boolean} */
export function ecrireStockage(cle, valeur) {
    if (!estCleValide(cle)) {
        logger.warn('Écriture localStorage refusee, cle inconnue:', cle);
        return false;
    }
    try {
        localStorage.setItem(cleCanonique(cle), valeur);
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
    if (modeDevActif()) return true;
    return niveauGlobal >= niveauDeblocage;
}

/** @param {number} record @param {number} [niveauAtteint] @returns {0|1|2|3} */
export function calculerEtoiles(record, niveauAtteint = 1) {
    const n = Math.max(1, Math.min(15, Math.floor(niveauAtteint) || 1));
    const seuil2 = SEUIL_ETOILE_2 * n;
    const seuil3 = SEUIL_ETOILE_3 * n;
    if (record >= seuil3) return 3;
    if (record >= seuil2) return 2;
    if (record > 0) return 1;
    return 0;
}

/** @param {number} nbEtoiles @returns {string} */
export function formaterEtoiles(nbEtoiles) {
    const n = Math.max(0, Math.min(3, nbEtoiles));
    return '\u2605'.repeat(n) + '\u2606'.repeat(3 - n);
}

/** @returns {number} */
export function chargerNiveauGlobal() {
    const brut = parseInt(lireStockage('derniereLigne_niveauGlobal', '0'), 10);
    return Number.isFinite(brut) && brut >= 0 ? brut : 0;
}

/** @param {number} niveauGlobal */
export function sauvegarderNiveauGlobal(niveauGlobal) {
    ecrireStockage('derniereLigne_niveauGlobal', Math.max(0, Math.floor(niveauGlobal)).toString());
}

/** @returns {string} */
export function chargerBiomeActif() {
    const biomeSauve = lireStockage('derniereLigne_biomeActif', 'classique');
    return BIOMES[biomeSauve] ? biomeSauve : 'classique';
}

/** @param {string} biomeId */
export function sauvegarderBiomeActif(biomeId) {
    if (!BIOMES[biomeId]) return;
    ecrireStockage('derniereLigne_biomeActif', biomeId);
}

/** @param {string} idBiome @returns {number} */
export function obtenirRecordBiome(idBiome) {
    if (!BIOMES[idBiome]) return 0;
    const brut = parseInt(lireStockage(`derniereLigne_record_${idBiome}`, '0'), 10);
    return Number.isFinite(brut) && brut >= 0 ? brut : 0;
}

/** @param {string} idBiome @returns {number} */
export function obtenirRecordNiveauBiome(idBiome) {
    if (!BIOMES[idBiome]) return 1;
    const brut = parseInt(lireStockage(`derniereLigne_recniv_${idBiome}`, '1'), 10);
    return Number.isFinite(brut) && brut >= 1 ? brut : 1;
}

/** @param {string} idBiome @param {number} score @param {number} [niveauAtteint] @returns {boolean} */
export function sauvegarderRecordBiome(idBiome, score, niveauAtteint = 1) {
    if (!BIOMES[idBiome] || !Number.isFinite(score) || score < 0) return false;
    const recordActuel = obtenirRecordBiome(idBiome);
    if (score > recordActuel) {
        ecrireStockage(`derniereLigne_record_${idBiome}`, Math.floor(score).toString());
        const niv = Math.max(1, Math.floor(niveauAtteint) || 1);
        ecrireStockage(`derniereLigne_recniv_${idBiome}`, String(niv));
        return true;
    }
    return false;
}

/**
 * Record du mode coop, stocke separement du record solo pour ne pas
 * fausser les scores et etoiles affiches à l'ecran de selection.
 * @param {string} idBiome @returns {number}
 */
export function obtenirRecordCoopBiome(idBiome) {
    if (!BIOMES[idBiome]) return 0;
    const brut = parseInt(lireStockage(`derniereLigne_recordcoop_${idBiome}`, '0'), 10);
    return Number.isFinite(brut) && brut >= 0 ? brut : 0;
}

/** @param {string} idBiome @param {number} score @returns {boolean} */
export function sauvegarderRecordCoopBiome(idBiome, score) {
    if (!BIOMES[idBiome] || !Number.isFinite(score) || score < 0) return false;
    if (score > obtenirRecordCoopBiome(idBiome)) {
        ecrireStockage(`derniereLigne_recordcoop_${idBiome}`, Math.floor(score).toString());
        return true;
    }
    return false;
}

/** @param {typeof ETAT_HISTOIRE_VIDE} etat */
function _fusionnerLegacyHistoire(etat) {
    const clesLegacy = [
        'derniereLigne_histoireJournaux',
        'derniereLigne_histoireBoss',
        'derniereLigne_histoireFin',
        'tetrisNeo_histoireJournaux',
        'tetrisNeo_histoireBoss',
        'tetrisNeo_histoireFin',
    ];
    let fusionEffectuee = false;

    const journaux = lireStockageJson('derniereLigne_histoireJournaux', null);
    if (Array.isArray(journaux)) {
        for (const id of journaux) {
            if (typeof id === 'string' && !etat.journauxTrouves.includes(id)) {
                etat.journauxTrouves.push(id);
                fusionEffectuee = true;
            }
        }
    }

    const boss = lireStockageJson('derniereLigne_histoireBoss', null);
    if (Array.isArray(boss)) {
        for (const id of boss) {
            if (typeof id === 'string' && !etat.bossVaincus.includes(id)) {
                etat.bossVaincus.push(id);
                fusionEffectuee = true;
            }
        }
    }

    const fins = lireStockageJson('derniereLigne_histoireFin', null);
    if (Array.isArray(fins)) {
        for (const id of fins) {
            if (typeof id === 'string' && !etat.toutesFinObtenues.includes(id)) {
                etat.toutesFinObtenues.push(id);
                fusionEffectuee = true;
            }
        }
    }

    if (fusionEffectuee) {
        sauvegarderEtatHistoire(etat);
        for (const cle of clesLegacy) {
            try {
                localStorage.removeItem(cle);
            } catch {
                /* ignore */
            }
        }
    }
}

const TOUS_BOSS_HISTOIRE = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];

/**
 * Recalcule les flags derives (conditionsMiroir / conditionsTrame / conditionsParadoxe)
 * depuis les tableaux sources (bossVaincus, journauxTrouves, mondesCompletes).
 * Indispensable apres une fusion legacy ou une sauvegarde partiellement corrompue.
 * @param {import('./histoire-donnees.js').EtatHistoire} etat
 */
const TOUS_BOSS_MONDES = [
    'monde_boss_1',
    'monde_boss_2',
    'monde_boss_3',
    'monde_boss_4',
    'monde_finale',
];

function _reconcilierFlagsHistoire(etat) {
    if (!Array.isArray(etat.bossVaincus)) etat.bossVaincus = [];
    if (!Array.isArray(etat.journauxTrouves)) etat.journauxTrouves = [];
    if (!Array.isArray(etat.mondesCompletes)) etat.mondesCompletes = [];
    if (!Array.isArray(etat.toutesFinObtenues)) etat.toutesFinObtenues = [];
    if (!Array.isArray(etat.mondesCachesDebloques)) etat.mondesCachesDebloques = [];
    if (!etat.etoilesParMonde) etat.etoilesParMonde = {};
    if (!etat.continuesParBoss) etat.continuesParBoss = {};

    if (etat.bossVaincus.includes('archiviste')) {
        etat.conditionsMiroir.bossArchivisteVaincu = true;
    }
    if (etat.journauxTrouves.length >= JOURNAUX_VERA.length) {
        etat.conditionsTrame.tousJournauxTrouves = true;
    }
    if (etat.mondesCompletes.includes('monde_miroir')) {
        etat.conditionsTrame.miroirComplete = true;
    }

    const continuesBossTotal = TOUS_BOSS_MONDES.reduce(
        (sum, id) => sum + (etat.continuesParBoss[id] ?? 0),
        0
    );
    if (continuesBossTotal > 0 || (etat.nbContinuesUtilises ?? 0) > 0) {
        etat.conditionsTrame.tousBossSansContinue = false;
    } else if (TOUS_BOSS_HISTOIRE.every((id) => etat.bossVaincus.includes(id))) {
        etat.conditionsTrame.tousBossSansContinue = true;
    }
    if (etat.toutesFinObtenues.includes('fin_secrete')) {
        etat.conditionsParadoxe.finSecreteObtenue = true;
    }
    if (
        etat.conditionsMiroir.bossArchivisteVaincu &&
        (etat.conditionsMiroir.tetrisTriplesCyber ?? 0) >= 3 &&
        !etat.mondesCachesDebloques.includes('monde_miroir')
    ) {
        etat.mondesCachesDebloques.push('monde_miroir');
    }
}

/** @returns {typeof ETAT_HISTOIRE_VIDE} */
export function chargerEtatHistoire() {
    const parsed = /** @type {Partial<typeof ETAT_HISTOIRE_VIDE> | null} */ (
        lireStockageJson('derniereLigne_histoire', null)
    );
    if (!parsed || typeof parsed !== 'object') {
        // Copie profonde : une copie superficielle partagerait les tableaux/objets
        // imbriques avec la constante ETAT_HISTOIRE_VIDE, qui serait alors mutee.
        const etatVide = structuredClone(ETAT_HISTOIRE_VIDE);
        _fusionnerLegacyHistoire(etatVide);
        _reconcilierFlagsHistoire(etatVide);
        return etatVide;
    }
    const base = structuredClone(ETAT_HISTOIRE_VIDE);
    const etat = {
        ...base,
        ...parsed,
        fragmentsVusIds: parsed.fragmentsVusIds ?? [],
        interludesVusIds: parsed.interludesVusIds ?? [],
        outroVue: parsed.outroVue ?? false,
        etoilesParMonde: parsed.etoilesParMonde ?? {},
        continuesParBoss: parsed.continuesParBoss ?? {},
        conditionsMiroir: {
            ...base.conditionsMiroir,
            ...(parsed.conditionsMiroir ?? {}),
        },
        conditionsTrame: {
            ...base.conditionsTrame,
            ...(parsed.conditionsTrame ?? {}),
        },
        conditionsParadoxe: {
            ...base.conditionsParadoxe,
            ...(parsed.conditionsParadoxe ?? {}),
        },
        prouessesHistoire: {
            ...base.prouessesHistoire,
            ...(parsed.prouessesHistoire ?? {}),
        },
    };
    _fusionnerLegacyHistoire(etat);
    _reconcilierFlagsHistoire(etat);
    return etat;
}

/**
 * Retourne l'etat de deblocage des fonctionnalites selon l'avancement histoire.
 * Les IDs de boss correspondent à ceux definis dans js/histoire-donnees.js.
 * @returns {{ codex: boolean, mondeLibre: boolean, profil: boolean, achievements: boolean, oracleCoop: boolean, architecte: boolean }}
 */
export function obtenirEtatDeblocage() {
    if (modeDevActif()) {
        return {
            codex: true,
            mondeLibre: true,
            profil: true,
            achievements: true,
            oracleCoop: true,
            architecte: true,
        };
    }

    let etat = null;
    try {
        etat = chargerEtatHistoire();
    } catch {
        // Pas encore d'historique → tout verrouille sauf MODE HISTOIRE
    }
    if (!etat) {
        return {
            codex: false,
            mondeLibre: false,
            profil: false,
            achievements: false,
            oracleCoop: false,
            architecte: false,
        };
    }

    const bossVaincus = Array.isArray(etat.bossVaincus) ? etat.bossVaincus : [];
    const mondesCompletes = Array.isArray(etat.mondesCompletes) ? etat.mondesCompletes : [];

    return {
        codex: mondesCompletes.includes('monde_prologue'),
        mondeLibre: bossVaincus.includes('brasier'),
        profil: bossVaincus.includes('sentinelle'),
        achievements: bossVaincus.includes('archiviste'),
        oracleCoop: bossVaincus.includes('avantgarde'),
        architecte:
            bossVaincus.includes('distorsion') ||
            (etat.finObtenue !== null && etat.finObtenue !== undefined),
    };
}

const BIOME_VERS_MONDE_HISTOIRE = {
    classique: null,
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
 * Retourne true si le biome est debloque en Mode Libre.
 * Un biome est debloque si son monde Histoire correspondant a ete complete.
 * Le biome classique est toujours debloque.
 * @param {string} biomeId
 * @returns {boolean}
 */
export function biomeEstDebloqueParHistoire(biomeId) {
    if (modeDevActif()) return true;
    const mondeRequis = BIOME_VERS_MONDE_HISTOIRE[biomeId];
    if (mondeRequis === null) return true;
    if (mondeRequis === undefined) return false;

    try {
        const etatHist = chargerEtatHistoire();
        return (
            Array.isArray(etatHist.mondesCompletes) &&
            etatHist.mondesCompletes.includes(mondeRequis)
        );
    } catch {
        return false;
    }
}

/** @param {typeof ETAT_HISTOIRE_VIDE} etat */
export function sauvegarderEtatHistoire(etat) {
    ecrireStockageJson('derniereLigne_histoire', etat);
}
