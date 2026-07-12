/** Export / import records et profil (B10) — fusion locale sans serveur. */
import { logger } from '../io/logger.js';

const PREFIXE_STOCKAGE = 'derniereLigne_';

export const VERSION_EXPORT_PROGRESSION = 1;

const MOTIFS_CLES_B10 = [
    /^derniereLigne_record_[a-z]+$/,
    /^derniereLigne_recniv_[a-z]+$/,
    /^derniereLigne_recordcoop_[a-z]+$/,
    /^derniereLigne_sprint_[a-z]+$/,
    /^derniereLigne_archi_[a-z_]+$/,
];

const CLES_B10_FIXES = new Set(['derniereLigne_profilDernier', 'derniereLigne_niveauGlobal']);

/** @param {string} cle */
export function estCleProgressionB10(cle) {
    if (CLES_B10_FIXES.has(cle)) return true;
    return MOTIFS_CLES_B10.some((re) => re.test(cle));
}

/** @returns {string[]} */
export function listerClesProgressionB10Locales() {
    /** @type {string[]} */
    const cles = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const cle = localStorage.key(i);
            if (cle && estCleProgressionB10(cle)) cles.push(cle);
        }
    } catch (err) {
        logger.warn('[progression] export B10:', err);
    }
    return cles.sort();
}

/** @returns {{ version: number, exportedAt: string, app: string, donnees: Record<string, string> }} */
export function exporterProgressionB10() {
    /** @type {Record<string, string>} */
    const donnees = {};
    for (const cle of listerClesProgressionB10Locales()) {
        const valeur = localStorage.getItem(cle);
        if (valeur !== null) donnees[cle] = valeur;
    }
    return {
        version: VERSION_EXPORT_PROGRESSION,
        exportedAt: new Date().toISOString(),
        app: 'derniere-ligne',
        donnees,
    };
}

/** @param {unknown} brut */
function parserJsonStockageB10(brut) {
    if (typeof brut !== 'string' || !brut) return null;
    try {
        return JSON.parse(brut);
    } catch {
        return null;
    }
}

/** @param {string} cle @param {string|null} local @param {string|null} distant @returns {string|null} */
function fusionnerValeurB10(cle, local, distant) {
    if (distant === null) return local;
    if (local === null) return distant;

    if (cle === 'derniereLigne_profilDernier') {
        const a = parserJsonStockageB10(local);
        const b = parserJsonStockageB10(distant);
        if (!a) return distant;
        if (!b) return local;
        const lignesA = Number(a?.donnees?.lignesPartie) || 0;
        const lignesB = Number(b?.donnees?.lignesPartie) || 0;
        return JSON.stringify(lignesB > lignesA ? b : a);
    }

    if (/^derniereLigne_sprint_/.test(cle)) {
        const a = parseInt(local, 10);
        const b = parseInt(distant, 10);
        if (!Number.isFinite(a) || a <= 0) return distant;
        if (!Number.isFinite(b) || b <= 0) return local;
        return String(Math.min(a, b));
    }

    const a = parseInt(local, 10);
    const b = parseInt(distant, 10);
    if (Number.isFinite(a) && Number.isFinite(b)) return String(Math.max(a, b));
    return local.length >= distant.length ? local : distant;
}

/**
 * @param {unknown} payload
 * @returns {{ ok: boolean, importes: number, fusionnes: number, erreur?: string }}
 */
export function importerProgressionB10(payload) {
    if (!payload || typeof payload !== 'object') {
        return { ok: false, importes: 0, fusionnes: 0, erreur: 'Fichier invalide' };
    }
    const bloc =
        /** @type {{ version?: number, app?: string, donnees?: Record<string, string> }} */ (
            payload
        );
    if (bloc.app !== 'derniere-ligne') {
        return { ok: false, importes: 0, fusionnes: 0, erreur: 'Sauvegarde non reconnue' };
    }
    if (bloc.version !== VERSION_EXPORT_PROGRESSION) {
        return {
            ok: false,
            importes: 0,
            fusionnes: 0,
            erreur: 'Version de sauvegarde incompatible',
        };
    }
    if (!bloc.donnees || typeof bloc.donnees !== 'object') {
        return { ok: false, importes: 0, fusionnes: 0, erreur: 'Donnees manquantes' };
    }

    let importes = 0;
    let fusionnes = 0;

    for (const [cle, valeur] of Object.entries(bloc.donnees)) {
        if (!estCleProgressionB10(cle) || typeof valeur !== 'string') continue;
        if (!cle.startsWith(PREFIXE_STOCKAGE)) continue;

        const local = localStorage.getItem(cle);
        const fusionnee = fusionnerValeurB10(cle, local, valeur);
        if (fusionnee === null) continue;

        if (local === null) importes += 1;
        else if (local !== fusionnee) fusionnes += 1;

        ecrireStockageB10(cle, fusionnee);
    }

    return { ok: true, importes, fusionnes };
}

/** @param {string} cle @param {string} valeur */
function ecrireStockageB10(cle, valeur) {
    try {
        localStorage.setItem(cle, valeur);
        return true;
    } catch (err) {
        logger.warn('Écriture localStorage impossible:', err);
        return false;
    }
}
