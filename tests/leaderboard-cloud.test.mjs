import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ecrireStockage } from '../js/io/progression-stockage.js';

/** @type {ReturnType<typeof vi.fn>} */
let fetchMock;

async function chargerLeaderboard() {
    return import('../js/io/leaderboard-cloud.js');
}

describe('leaderboard-cloud', () => {
    beforeEach(async () => {
        vi.resetModules();
        localStorage.clear();
        fetchMock = vi.fn();
        globalThis.fetch = fetchMock;
        vi.stubGlobal('navigator', { onLine: true });

        const { activerSyncCloud, configurerSupabase, CLE_SYNC_ID } =
            await import('../js/config/config-sync.js');
        activerSyncCloud(true);
        configurerSupabase('https://test.supabase.co', 'anon-test-key');
        ecrireStockage(CLE_SYNC_ID, '11111111-1111-4111-8111-111111111111');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('soumet un score marathon au record', async () => {
        fetchMock.mockResolvedValueOnce(new Response('', { status: 201 }));
        const { soumettreScoreLeaderboard } = await chargerLeaderboard();
        const resultat = await soumettreScoreLeaderboard({
            mode: 'marathon',
            biome: 'classique',
            score: 12000,
            niveau: 5,
        });
        expect(resultat.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://test.supabase.co/rest/v1/leaderboard_entries',
            expect.objectContaining({ method: 'POST' })
        );
        const corps = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(corps.mode).toBe('marathon');
        expect(corps.score).toBe(12000);
        expect(corps.niveau).toBe(5);
    });

    it('charge le classement sprint trie par temps', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify([
                    { pseudo: 'Alpha', score: 0, sprint_ms: 45000, niveau: 1 },
                    { pseudo: 'Beta', score: 0, sprint_ms: 52000, niveau: 1 },
                ]),
                { status: 200 }
            )
        );
        const { chargerClassementLeaderboard } = await chargerLeaderboard();
        const lignes = await chargerClassementLeaderboard({
            mode: 'sprint',
            biome: 'classique',
            limit: 5,
        });
        expect(lignes).toHaveLength(2);
        expect(fetchMock.mock.calls[0][0]).toContain('order=sprint_ms.asc');
    });

    it('ignore la soumission si sync cloud inactif', async () => {
        const { activerSyncCloud } = await import('../js/config/config-sync.js');
        activerSyncCloud(false);
        const { soumettreScoreLeaderboard } = await chargerLeaderboard();
        const resultat = await soumettreScoreLeaderboard({
            mode: 'marathon',
            biome: 'classique',
            score: 500,
        });
        expect(resultat.ok).toBe(false);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
