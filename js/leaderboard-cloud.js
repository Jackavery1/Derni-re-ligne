/** Classement global B10 via Supabase REST (opt-in, même config que sync cloud). */
import { logger } from './logger.js';
import {
    syncCloudActif,
    syncCloudConfigure,
    obtenirSupabaseUrl,
    obtenirSupabaseAnonKey,
    obtenirOuCreerSyncId,
    TABLE_LEADERBOARD,
    obtenirPseudoLeaderboard,
} from './config/config-sync.js';

function enTetesSupabase() {
    const key = obtenirSupabaseAnonKey();
    return {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
    };
}

function leaderboardPret() {
    return (
        syncCloudActif() &&
        syncCloudConfigure() &&
        (typeof navigator === 'undefined' || navigator.onLine !== false)
    );
}

/**
 * @param {{ mode: string, biome: string, score: number, sprintMs?: number | null, niveau?: number }} entree
 */
export async function soumettreScoreLeaderboard(entree) {
    if (!leaderboardPret()) return { ok: false, raison: 'inactif' };
    const url = obtenirSupabaseUrl();
    const endpoint = `${url}/rest/v1/${TABLE_LEADERBOARD}`;
    const corps = {
        sync_id: obtenirOuCreerSyncId(),
        pseudo: obtenirPseudoLeaderboard(),
        mode: entree.mode,
        biome: entree.biome,
        score: Math.max(0, Math.floor(entree.score)),
        sprint_ms: entree.sprintMs ? Math.max(1, Math.floor(entree.sprintMs)) : null,
        niveau: Math.max(1, Math.floor(entree.niveau ?? 1)),
    };
    try {
        const reponse = await fetch(endpoint, {
            method: 'POST',
            headers: enTetesSupabase(),
            body: JSON.stringify(corps),
        });
        if (!reponse.ok) throw new Error(`POST leaderboard ${reponse.status}`);
        return { ok: true };
    } catch (err) {
        logger.warn('[leaderboard] push:', err);
        return { ok: false, raison: 'erreur' };
    }
}

/**
 * @param {{ mode: string, biome: string, limit?: number }} opts
 * @returns {Promise<{ pseudo: string, score: number, sprint_ms: number | null, niveau: number, created_at?: string }[]>}
 */
export async function chargerClassementLeaderboard(opts) {
    const { mode, biome, limit = 10 } = opts;
    if (!leaderboardPret()) return [];
    const url = obtenirSupabaseUrl();
    const tri = mode === 'sprint' ? 'sprint_ms.asc' : 'score.desc';
    const endpoint =
        `${url}/rest/v1/${TABLE_LEADERBOARD}` +
        `?mode=eq.${encodeURIComponent(mode)}` +
        `&biome=eq.${encodeURIComponent(biome)}` +
        `&order=${tri}` +
        `&limit=${Math.min(50, Math.max(1, limit))}` +
        '&select=pseudo,score,sprint_ms,niveau,created_at';

    try {
        const reponse = await fetch(endpoint, { headers: enTetesSupabase() });
        if (!reponse.ok) throw new Error(`GET leaderboard ${reponse.status}`);
        const lignes = await reponse.json();
        return Array.isArray(lignes) ? lignes : [];
    } catch (err) {
        logger.warn('[leaderboard] pull:', err);
        return [];
    }
}

/**
 * @param {{ mode: string, biome: string, score: number, sprintMs?: number | null, niveau?: number }} entree
 */
export function planifierSoumissionLeaderboard(entree) {
    if (!leaderboardPret()) return;
    void soumettreScoreLeaderboard(entree);
}
