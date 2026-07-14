import { test, expect } from '@playwright/test';
import { attendreApplicationPrete } from './helpers.mjs';
import { lireCheminsScenesArrierePlanSw } from './helpers-sw-precache.mjs';

/** @param {import('@playwright/test').Page} page */
async function attendrePrecacheShell(page) {
    await page.waitForFunction(
        async () => {
            const cles = await caches.keys();
            const shell = cles.find((c) => c.startsWith('dl-shell'));
            if (!shell) return false;
            const cache = await caches.open(shell);
            const main =
                (await cache.match('./js/main.js')) ||
                (await cache.match('/js/main.js')) ||
                (await cache.match('./js/bundle.js')) ||
                (await cache.match('/js/bundle.js'));
            const index =
                (await cache.match('./index.html')) ||
                (await cache.match('/index.html')) ||
                (await cache.match('./'));
            const responsive =
                (await cache.match('./styles/responsive.css')) ||
                (await cache.match('/styles/responsive.css'));
            return (
                Boolean(main) &&
                Boolean(index) &&
                Boolean(responsive) &&
                (await cache.keys()).length >= 20
            );
        },
        null,
        { timeout: 180000, polling: 500 }
    );
}

/** @param {import('@playwright/test').Page} page @param {string} cheminRelatif */
async function attendrePrecacheMediasCutscene(page, cheminRelatif) {
    await page.waitForFunction(
        async (chemin) => {
            const variantes = [
                chemin,
                chemin.replace(/^\.\//, '/'),
                new URL(chemin, location.href).href,
                new URL(chemin.replace(/^\.\//, '/'), location.origin).href,
            ];
            const cles = await caches.keys();
            const medias = cles.find((c) => c.startsWith('dl-medias'));
            if (!medias) return false;
            const cache = await caches.open(medias);
            for (const variante of variantes) {
                const entree = await cache.match(variante);
                if (entree?.ok) {
                    const blob = await entree.blob();
                    if (blob.size > 1000) return true;
                }
            }
            return false;
        },
        cheminRelatif,
        { timeout: 180000, polling: 500 }
    );
}

/** @param {import('@playwright/test').Page} page */
async function declencherPrecacheScenesArrierePlan(page) {
    await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        const sw = reg?.active ?? reg?.waiting ?? reg?.installing;
        sw?.postMessage({ type: 'PRECACHE_SCENES_ARRIERE_PLAN' });
    });
}

/** @param {import('@playwright/test').Page} page @param {import('@playwright/test').BrowserContext} context */
async function precacherShellEtScenesInstall(page, context) {
    const swPromise = context.waitForEvent('serviceworker', { timeout: 180000 });
    await page.goto('/?pwa=1', { waitUntil: 'load' });
    await swPromise;
    await page.reload({ waitUntil: 'load' });
    await attendreApplicationPrete(page);
    await attendrePrecacheShell(page);
    await attendrePrecacheMediasCutscene(page, './assets/cutscenes/scene_observatoire.png');
    await attendrePrecacheMediasCutscene(page, './assets/cutscenes/scene_seuil_brasier.png');
    await attendrePrecacheMediasCutscene(page, './assets/cutscenes/scene_interlude_elle.png');
    await attendrePrecacheMediasCutscene(page, './assets/cutscenes/scene_labo.png');
}

test('application charge hors ligne après precache', async ({ page, context }) => {
    test.setTimeout(240000);
    await precacherShellEtScenesInstall(page, context);
    await context.setOffline(true);
    await expect(page.locator('#ecran-titre')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#btn-options')).toBeVisible();
});

test('offline — titre portrait 390px apres precache (audit C5)', async ({ page, context }) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width: 390, height: 844 });
    await precacherShellEtScenesInstall(page, context);
    await context.setOffline(true);
    await expect(page.locator('#ecran-titre')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#btn-options')).toBeVisible();
    await expect(page.locator('#overlay-orientation')).toHaveCount(0);
});

test('cutscene PNG prologue precachee a l install (audit C5/D3)', async ({ page, context }) => {
    test.setTimeout(240000);
    await precacherShellEtScenesInstall(page, context);
});

test('cutscene PNG arriere-plan precache differe dans cache medias', async ({ page, context }) => {
    test.setTimeout(240000);
    const swPromise = context.waitForEvent('serviceworker', { timeout: 180000 });
    await page.goto('/?pwa=1', { waitUntil: 'load' });
    await swPromise;
    await page.reload({ waitUntil: 'load' });
    await attendreApplicationPrete(page);
    await attendrePrecacheShell(page);
    await declencherPrecacheScenesArrierePlan(page);
    for (const chemin of lireCheminsScenesArrierePlanSw()) {
        await attendrePrecacheMediasCutscene(page, chemin);
    }
});
