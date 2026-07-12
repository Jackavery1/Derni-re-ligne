import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete } from './helpers.mjs';

test('gameplay difficulty — palier prologue monte apres progression (audit B)', async ({
    page,
}) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerPalierDifficultePrologue) return null;
        return api.evaluerPalierDifficultePrologue();
    });

    expect(resultat).not.toBeNull();
    expect(resultat.debut).toBe(resultat.palier1);
    expect(resultat.apres).toBe(resultat.palier2);
    expect(resultat.palierCourant).toBe(2);
});

test('gameplay difficulty — palier lave monte apres seuil 35% (audit B)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerPalierDifficulteMonde) return null;
        return api.evaluerPalierDifficulteMonde('monde_lave', 5);
    });

    expect(resultat).not.toBeNull();
    expect(resultat.palierInitial).toBe(3);
    expect(resultat.palierApres).toBeGreaterThan(resultat.palierInitial);
    expect(resultat.vitesseApres).toBeLessThan(resultat.vitesseInit);
});

test('gameplay difficulty — palier lave monte apres seuil 65% (audit B)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerPalierDifficulteMonde) return null;
        return api.evaluerPalierDifficulteMonde('monde_lave', 8);
    });

    expect(resultat).not.toBeNull();
    expect(resultat.palierInitial).toBe(3);
    expect(resultat.palierApres).toBe(6);
    expect(resultat.vitesseApres).toBeLessThan(resultat.vitesseInit);
});

test('gameplay difficulty — respiration eclipse apres pic (audit B)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerRespirationDifficulteMonde) return null;
        return api.evaluerRespirationDifficulteMonde('monde_eclipse');
    });

    expect(resultat).not.toBeNull();
    expect(resultat.respiration).toBe(true);
    expect(resultat.amplitude).toBeGreaterThanOrEqual(2);
});

test('gameplay difficulty — respiration glace vagues mid-run (audit B)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerRespirationDifficulteMonde) return null;
        return api.evaluerRespirationDifficulteMonde('monde_glace');
    });

    expect(resultat).not.toBeNull();
    expect(resultat.respiration).toBe(true);
    expect(resultat.amplitude).toBeGreaterThanOrEqual(2);
});

test('gameplay difficulty — palier ocean monte apres seuil 40% (audit B)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerPalierDifficulteMonde) return null;
        return api.evaluerPalierDifficulteMonde('monde_ocean', 5);
    });

    expect(resultat).not.toBeNull();
    expect(resultat.palierInitial).toBe(4);
    expect(resultat.palierApres).toBeGreaterThan(resultat.palierInitial);
    expect(resultat.vitesseApres).toBeLessThan(resultat.vitesseInit);
});

test('gameplay difficulty — respiration trame paliers 10-14 (audit B G4)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerRespirationDifficulteMonde) return null;
        return api.evaluerRespirationDifficulteMonde('monde_trame');
    });

    expect(resultat).not.toBeNull();
    expect(resultat.respiration).toBe(true);
    expect(resultat.amplitude).toBeGreaterThanOrEqual(2);
    const paliers = resultat.paliers.filter((p) => typeof p === 'number');
    for (let i = 1; i < paliers.length; i++) {
        expect(paliers[i] - paliers[i - 1]).toBeLessThanOrEqual(2);
    }
});

test('gameplay difficulty — prologue sans mort precoce < 30s (audit B G3)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        return window.__NEO_TEST__?.evaluerEquiteDemarragePrologue?.();
    });

    expect(resultat).not.toBeNull();
    expect(resultat.equiteDemarrage).toBe(true);
    expect(resultat.surviePassiveAuMoins30s).toBe(true);
    expect(resultat.vivantActif).toBe(false);
    expect(resultat.tempsTopOutPassifEstimeMs).toBeGreaterThanOrEqual(30000);
});
