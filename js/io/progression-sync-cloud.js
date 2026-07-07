/** Sync cloud automatique B10 via Supabase REST (opt-in). */
import { logger } from '../logger.js';
import { exporterProgressionB10, importerProgressionB10 } from './progression-stockage.js';
import {
    syncCloudActif,
    syncCloudConfigure,
    obtenirSupabaseUrl,
    obtenirSupabaseAnonKey,
    obtenirOuCreerSyncId,
    TABLE_SYNC,
} from '../config/config-sync.js';

/** @type {ReturnType<typeof setTimeout> | null} */
let timerPush = null;
let pushEnCours = false;
let pullEnCours = false;

/** @type {'idle' | 'sync' | 'ok' | 'erreur' | 'hors-ligne'} */
let statutSync = 'idle';

export function obtenirStatutSyncCloud() {
    return statutSync;
}

function enTetesSupabase() {
    const key = obtenirSupabaseAnonKey();
    return {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
    };
}

function estEnLigne() {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
}

function syncPret() {
    return syncCloudActif() && syncCloudConfigure() && estEnLigne();
}

/**
 * @param {string} syncId
 * @returns {Promise<{ payload: unknown, updated_at: string } | null>}
 */
async function telechargerSnapshotDistant(syncId) {
    const url = obtenirSupabaseUrl();
    const endpoint = `${url}/rest/v1/${TABLE_SYNC}?sync_id=eq.${encodeURIComponent(syncId)}&select=payload,updated_at&limit=1`;
    const reponse = await fetch(endpoint, {
        method: 'GET',
        headers: enTetesSupabase(),
    });
    if (reponse.status === 404 || reponse.status === 406) return null;
    if (!reponse.ok) throw new Error(`pull HTTP ${reponse.status}`);
    const lignes = await reponse.json();
    if (!Array.isArray(lignes) || lignes.length === 0) return null;
    return lignes[0];
}

/**
 * @param {string} syncId
 * @param {ReturnType<typeof exporterProgressionB10>} exportData
 */
async function envoyerSnapshotDistant(syncId, exportData) {
    const url = obtenirSupabaseUrl();
    const endpoint = `${url}/rest/v1/${TABLE_SYNC}`;
    const corps = {
        sync_id: syncId,
        payload: exportData,
        updated_at: exportData.exportedAt,
    };
    const reponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            ...enTetesSupabase(),
            Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(corps),
    });
    if (!reponse?.ok) throw new Error(`push HTTP ${reponse?.status ?? '?'}`);
}

export async function synchroniserCloudAuDemarrage() {
    if (!syncPret() || pullEnCours) return { ok: false, raison: 'inactif' };
    pullEnCours = true;
    statutSync = 'sync';
    try {
        const syncId = obtenirOuCreerSyncId();
        const distant = await telechargerSnapshotDistant(syncId);
        if (distant?.payload) {
            const resultat = importerProgressionB10(distant.payload);
            if (resultat.ok && (resultat.importes > 0 || resultat.fusionnes > 0)) {
                const { chargerProfilDernier } = await import('../ui/profil-jeu.js');
                chargerProfilDernier();
            }
        }
        statutSync = 'ok';
        return { ok: true, pull: Boolean(distant) };
    } catch (err) {
        logger.warn('[sync-cloud] pull:', err);
        statutSync = estEnLigne() ? 'erreur' : 'hors-ligne';
        return { ok: false, raison: 'erreur' };
    } finally {
        pullEnCours = false;
    }
}

export async function pousserCloudMaintenant() {
    if (!syncPret() || pushEnCours) return { ok: false };
    pushEnCours = true;
    statutSync = 'sync';
    try {
        const syncId = obtenirOuCreerSyncId();
        const exportData = exporterProgressionB10();
        await envoyerSnapshotDistant(syncId, exportData);
        statutSync = 'ok';
        return { ok: true };
    } catch (err) {
        logger.warn('[sync-cloud] push:', err);
        statutSync = estEnLigne() ? 'erreur' : 'hors-ligne';
        return { ok: false };
    } finally {
        pushEnCours = false;
    }
}

export function planifierPushCloud() {
    if (!syncCloudActif()) return;
    if (timerPush) clearTimeout(timerPush);
    timerPush = setTimeout(() => {
        timerPush = null;
        void pousserCloudMaintenant();
    }, 3000);
}

export function initialiserSyncCloud() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
        if (syncPret()) {
            void synchroniserCloudAuDemarrage().then(() => planifierPushCloud());
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && syncPret()) {
            planifierPushCloud();
        }
    });
}
