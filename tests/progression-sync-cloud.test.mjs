import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ecrireStockage } from '../js/progression-stockage.js';

vi.mock('../js/profil-jeu.js', () => ({
    chargerProfilDernier: vi.fn(),
}));

/** @type {ReturnType<typeof vi.fn>} */
let fetchMock;

async function chargerSyncCloud() {
    return import('../js/progression-sync-cloud.js');
}

describe('progression-sync-cloud', () => {
    beforeEach(async () => {
        vi.resetModules();
        localStorage.clear();
        fetchMock = vi.fn((_, opts) => {
            if (opts?.method === 'POST') {
                return Promise.resolve(new Response('', { status: 201 }));
            }
            return Promise.resolve(new Response('[]', { status: 200 }));
        });
        globalThis.fetch = fetchMock;
        vi.stubGlobal('navigator', { onLine: true, vibrate: vi.fn() });

        const { activerSyncCloud, configurerSupabase, CLE_SYNC_ID } =
            await import('../js/config-sync.js');
        activerSyncCloud(true);
        configurerSupabase('https://test.supabase.co', 'anon-test-key');
        ecrireStockage(CLE_SYNC_ID, '11111111-1111-4111-8111-111111111111');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('pull et merge au demarrage', async () => {
        const payload = {
            version: 1,
            app: 'derniere-ligne',
            exportedAt: '2026-06-15T12:00:00.000Z',
            donnees: { derniereLigne_record_classique: '5000' },
        };
        fetchMock.mockImplementation((_, opts) => {
            if (opts?.method === 'GET') {
                return Promise.resolve(
                    new Response(JSON.stringify([{ payload, updated_at: payload.exportedAt }]), {
                        status: 200,
                    })
                );
            }
            return Promise.resolve(new Response('', { status: 201 }));
        });

        const { synchroniserCloudAuDemarrage, obtenirStatutSyncCloud } = await chargerSyncCloud();
        const resultat = await synchroniserCloudAuDemarrage();
        expect(resultat.ok).toBe(true);
        expect(localStorage.getItem('derniereLigne_record_classique')).toBe('5000');
        expect(obtenirStatutSyncCloud()).toBe('ok');
    });

    it('push envoie le snapshot B10', async () => {
        ecrireStockage('derniereLigne_record_classique', '900');
        fetchMock.mockResolvedValueOnce(new Response('', { status: 201 }));

        const { pousserCloudMaintenant } = await chargerSyncCloud();
        const resultat = await pousserCloudMaintenant();
        expect(resultat.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://test.supabase.co/rest/v1/progression_snapshots',
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('planifierPushCloud declenche un push apres delai', async () => {
        vi.useFakeTimers();
        const { planifierPushCloud } = await chargerSyncCloud();

        planifierPushCloud();
        await vi.advanceTimersByTimeAsync(2999);
        expect(fetchMock).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(2);
        expect(fetchMock).toHaveBeenCalled();
    });
});
