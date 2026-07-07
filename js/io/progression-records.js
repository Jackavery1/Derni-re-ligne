/** Records solo/coop et déblocage des biomes en mode libre. */
import { BIOMES, ORDRE_BIOMES_LIBRE } from '../config/config.js';
import { modeDevActif } from '../mode-dev-etat.js';
import { lireStockage, ecrireStockage } from './progression-stockage.js';
import { chargerEtatHistoire } from './progression-histoire.js';

export const SEUIL_ETOILE_2 = 5000;
export const SEUIL_ETOILE_3 = 15000;

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

/** @param {string} idBiome @returns {number} */
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

/** @param {string} idBiome @returns {number} Meilleur temps sprint en ms (0 si aucun). */
export function obtenirRecordSprintBiome(idBiome) {
    if (!BIOMES[idBiome]) return 0;
    const brut = parseInt(lireStockage(`derniereLigne_sprint_${idBiome}`, '0'), 10);
    return Number.isFinite(brut) && brut > 0 ? brut : 0;
}

/** @param {string} idBiome @param {number} tempsMs @returns {boolean} */
export function sauvegarderRecordSprintBiome(idBiome, tempsMs) {
    if (!BIOMES[idBiome] || !Number.isFinite(tempsMs) || tempsMs <= 0) return false;
    const actuel = obtenirRecordSprintBiome(idBiome);
    if (actuel === 0 || tempsMs < actuel) {
        ecrireStockage(`derniereLigne_sprint_${idBiome}`, Math.floor(tempsMs).toString());
        return true;
    }
    return false;
}

/**
 * @returns {{ id: string, nom: string, record: number, sprintMs: number, debloque: boolean }[]}
 */
export function obtenirResumeRecordsLocaux() {
    return ORDRE_BIOMES_LIBRE.filter((id) => BIOMES[id]).map((id) => ({
        id,
        nom: BIOMES[id].nom,
        record: obtenirRecordBiome(id),
        sprintMs: obtenirRecordSprintBiome(id),
        debloque: biomeEstDebloqueParHistoire(id),
    }));
}

export const BIOME_VERS_MONDE_HISTOIRE = {
    classique: null,
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
    paradoxe: 'monde_paradoxe',
};

/**
 * @param {string} biomeId
 * @returns {string | null | undefined}
 */
export function obtenirMondeHistoirePourBiome(biomeId) {
    return BIOME_VERS_MONDE_HISTOIRE[biomeId];
}

/**
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
