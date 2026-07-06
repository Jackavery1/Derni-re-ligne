import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    ouvrirCarteHistoire,
    demarrerPartie,
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

    await page.route('**/rest/v1/leaderboard_entries*', async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { pseudo: 'Neo', score: 15000, sprint_ms: null, niveau: 8 },
                    { pseudo: 'Vera', score: 12000, sprint_ms: null, niveau: 6 },
                ]),
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

test('sync cloud — push envoie les records locaux', async ({ page }) => {
    let corpsPush = null;
    await preparerPageSansSw(page);
    await preparerSyncCloud(page);
    await page.route('**/rest/v1/progression_snapshots*', async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '[]',
            });
            return;
        }
        if (method === 'POST') {
            corpsPush = route.request().postDataJSON();
            await route.fulfill({ status: 201, body: '' });
            return;
        }
        await route.continue();
    });

    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    await expect(page.locator('#panneau-sync-config')).toBeVisible();
    const pushRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && req.url().includes('progression_snapshots'),
        { timeout: 10000 }
    );
    await page.locator('#btn-sync-maintenant').click();
    await pushRequest;
    await expect(page.locator('#options-sync-statut')).toContainText(/a jour/i, {
        timeout: 10000,
    });

    expect(corpsPush?.sync_id).toBe(SYNC_ID);
    expect(corpsPush?.payload?.donnees?.derniereLigne_record_classique).toBe('1200');
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
    await expect(page.locator('#btn-import-progression')).toBeVisible();
    await page.waitForFunction(() =>
        document.getElementById('input-import-progression')?.hasAttribute('data-neo-import-lie')
    );

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

    await expect
        .poll(async () =>
            page.evaluate(() => localStorage.getItem('derniereLigne_record_classique'))
        )
        .toBe('4200');
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

test('ecran titre — logo et menu principal visibles', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await expect(page.locator('.menu-robot')).toHaveCount(0);
    await expect(page.locator('#menu-titre-dl')).toBeVisible();
    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
});

test('sync cloud — leaderboard marathon affiche le top', async ({ page }) => {
    await preparerPageSansSw(page);
    await preparerSyncCloud(page);
    await page.goto('/');
    await attendreApplicationPrete(page);

    await page.locator('#btn-options').click();
    await expect(page.locator('#panneau-leaderboard-options')).toBeVisible();
    await page.locator('#btn-rafraichir-leaderboard').click();

    await expect(page.locator('#liste-leaderboard-options li').first()).toContainText(/Neo/i, {
        timeout: 10000,
    });
    await expect(page.locator('#liste-leaderboard-options')).toContainText(/15[\s\u00a0]?000/);
});

test('sync cloud — filtres leaderboard mode et biome', async ({ page }) => {
    let urlLeaderboard = '';
    await preparerPageSansSw(page);
    await preparerSyncCloud(page);
    await page.route('**/rest/v1/leaderboard_entries*', async (route) => {
        if (route.request().method() === 'GET') {
            urlLeaderboard = route.request().url();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { pseudo: 'Sprinteur', score: 0, sprint_ms: 42000, niveau: 1 },
                ]),
            });
            return;
        }
        await route.continue();
    });

    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    await expect(page.locator('#select-leaderboard-biome option').first()).toBeAttached({
        timeout: 5000,
    });

    await page.locator('#select-leaderboard-mode').selectOption('sprint');
    await page.locator('#select-leaderboard-biome').selectOption('lave');
    await page.locator('#btn-rafraichir-leaderboard').click();

    await expect(page.locator('#leaderboard-options-titre')).toContainText(/SPRINT/i);
    await expect(page.locator('#liste-leaderboard-options')).toContainText(/Sprinteur/i, {
        timeout: 10000,
    });
    expect(urlLeaderboard).toContain('mode=eq.sprint');
    expect(urlLeaderboard).toContain('biome=eq.lave');
});

test('options — toggle enchainement campagne persiste', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();

    await expect(page.locator('#btn-toggle-enchainement-campagne')).toContainText(/ON/i);
    await page.locator('#btn-toggle-enchainement-campagne').click();
    await expect(page.locator('#btn-toggle-enchainement-campagne')).toContainText(/RETOUR CARTE/i);

    const valeur = await page.evaluate(() =>
        localStorage.getItem('derniereLigne_enchainementCampagne')
    );
    expect(valeur).toBe('false');
});

test('marathon — timer niveau visible en partie', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#section-timer-niveau')).toBeVisible();
    await expect(page.locator('#affichage-temps-niveau')).toContainText(/\d{2}:\d{2}/);
});
