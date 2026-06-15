/** Configuration sync cloud Supabase (REST, sans SDK). */
export const CLE_SYNC_ACTIF = 'derniereLigne_syncCloudActif';
export const CLE_SYNC_ID = 'derniereLigne_syncCloudId';
export const CLE_SUPABASE_URL = 'derniereLigne_supabaseUrl';
export const CLE_SUPABASE_KEY = 'derniereLigne_supabaseAnonKey';

export const TABLE_SYNC = 'progression_snapshots';

/** URL Supabase par défaut (projet dédié Dernière Ligne — clé anon publique). */
export const SUPABASE_URL_DEFAUT = '';
export const SUPABASE_ANON_DEFAUT = '';

/** @param {string} cle @param {string} defaut */
function lireStockageSync(cle, defaut) {
    try {
        return localStorage.getItem(cle) ?? defaut;
    } catch {
        return defaut;
    }
}

/** @param {string} cle @param {string} valeur */
function ecrireStockageSync(cle, valeur) {
    try {
        localStorage.setItem(cle, valeur);
    } catch {
        /* ignore */
    }
}

export function syncCloudActif() {
    return lireStockageSync(CLE_SYNC_ACTIF, 'false') === 'true';
}

export function activerSyncCloud(actif) {
    ecrireStockageSync(CLE_SYNC_ACTIF, actif ? 'true' : 'false');
}

export function obtenirSupabaseUrl() {
    return lireStockageSync(CLE_SUPABASE_URL, SUPABASE_URL_DEFAUT) || SUPABASE_URL_DEFAUT;
}

export function obtenirSupabaseAnonKey() {
    return lireStockageSync(CLE_SUPABASE_KEY, SUPABASE_ANON_DEFAUT) || SUPABASE_ANON_DEFAUT;
}

export function configurerSupabase(url, anonKey) {
    if (url) ecrireStockageSync(CLE_SUPABASE_URL, url.trim());
    if (anonKey) ecrireStockageSync(CLE_SUPABASE_KEY, anonKey.trim());
}

export function syncCloudConfigure() {
    const url = obtenirSupabaseUrl();
    const key = obtenirSupabaseAnonKey();
    return Boolean(url && key);
}

/** @returns {string} */
export function obtenirOuCreerSyncId() {
    let id = lireStockageSync(CLE_SYNC_ID, '');
    if (!id) {
        id = crypto.randomUUID();
        ecrireStockageSync(CLE_SYNC_ID, id);
    }
    return id;
}

export function reinitialiserSyncId() {
    try {
        localStorage.removeItem(CLE_SYNC_ID);
    } catch {
        /* ignore */
    }
}
