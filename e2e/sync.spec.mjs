import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    ouvrirCarteHistoire,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './helpers.mjs';

const SYNC_ID = '11111111-1111-4111-8111-111111111111';
const SUPABASE_URL = 'https://test.supabase.co';
const SUPABASE_KEY = 'anon-test-key';

async function preparerSyncCloud(page) {
    await page.route('**/rest/v1/progression_snapshots*', async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
            const payload = {
                version: 1,
                app: 'derniere-ligne',
                exportedAt: '2026-06-15T12:00:00.000Z',
                donnees: { derniereLigne_record_classique: '7500' },
            };
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ payload, updated_at: payload.exportedAt }]),
            });
            return;
        }
        if (method === 'POST') {
            await route.fulfill({ status: 201, body: '' });
            return;
        }
        await route.continue();
    });

    await page.addInitScript(
        ({ syncId, url, key }) => {
            localStorage.setItem('derniereLigne_syncCloudId', syncId);
            localStorage.setItem('derniereLigne_supabaseUrl', url);
            localStorage.setItem('derniereLigne_supabaseAnonKey', key);
            localStorage.setItem('derniereLigne_syncCloudActif', 'true');
            localStorage.setItem('derniereLigne_record_classique', '1200');
        },
        { syncId: SYNC_ID, url: SUPABASE_URL, key: SUPABASE_KEY }
    );
}

test('sync cloud — pull fusionne les records distants', async ({ page }) => {
    await preparerPageSansSw(page);
    await preparerSyncCloud(page);
    await page.goto('/');
    await attendreApplicationPrete(page);

    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
    await expect(page.locator('#panneau-sync-config')).toBeVisible();

    await page.locator('#btn-sync-maintenant').click();
    await expect(page.locator('#options-sync-statut')).toContainText(/a jour/i, {
        timeout: 10000,
    });

    const record = await page.evaluate(() =>
        localStorage.getItem('derniereLigne_record_classique')
    );
    expect(record).toBe('7500');
});

test('import progression — fusionne un fichier JSON', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.addInitScript(() => {
        localStorage.setItem('derniereLigne_record_classique', '1000');
    });
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();

    const payload = {
        version: 1,
        app: 'derniere-ligne',
        exportedAt: '2026-06-15T12:00:00.000Z',
        donnees: { derniereLigne_record_classique: '4200' },
    };

    await page.locator('#input-import-progression').setInputFiles({
        name: 'records-test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(payload)),
    });

    const record = await page.evaluate(() =>
        localStorage.getItem('derniereLigne_record_classique')
    );
    expect(record).toBe('4200');
});

test('options — toggle haptique persiste', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();

    await expect(page.locator('#btn-toggle-haptique')).toContainText(/ON/i);
    await page.locator('#btn-toggle-haptique').click();
    await expect(page.locator('#btn-toggle-haptique')).toContainText(/OFF/i);

    const valeur = await page.evaluate(() => localStorage.getItem('derniereLigne_haptique'));
    expect(valeur).toBe('false');
});

test('cutscene narration — piste audio dediee', async ({ page }) => {
    const etatPremiereVisiteBoss = {
        ...ETAT_HISTOIRE_BOSS_BRASIER,
        mondesDejaMontres: [],
    };
    await ouvrirCarteHistoire(page, etatPremiereVisiteBoss);
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });

    await expect
        .poll(async () =>
            page.evaluate(() => window.__NEO_TEST__?.obtenirMusiqueActive?.() ?? null)
        )
        .toBe('narratif_cutscene');
});

test('ecran titre — mascotte ROBO canvas visible', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await page.waitForTimeout(400);

    const metriques = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-menu-robo');
        if (!(canvas instanceof HTMLCanvasElement)) return { ok: false };
        const ctx = canvas.getContext('2d');
        if (!ctx) return { ok: false };
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return { ok: true };
        }
        return { ok: false };
    });
    expect(metriques.ok).toBe(true);
});
