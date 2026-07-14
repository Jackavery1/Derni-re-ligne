import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    lancerMondeBossBrasier,
    lancerMondeBossSentinelle,
    attendreCutsceneVictoireBoss,
    avancerCutsceneJusquaPivot,
    assertHumeurPortraitCutscene,
} from './helpers.mjs';
import { ETAT_AVANT_BOSS_SENTINELLE } from './etats-histoire.mjs';
import { passerFluxLancementMonde } from './helpers-partie.mjs';

test('boss Brasier gameplay reel — expression calme au combat (audit B/D)', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();
    await expect(page.locator('#canvas-boss-portrait')).toBeVisible();

    const expression = await page.evaluate(() =>
        window.__NEO_TEST__?.obtenirExpressionBossCombat?.()
    );
    expect(expression).toBe('calme');
});

test('boss Brasier gameplay reel — expression agressif a 50% PV (audit B/D)', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();

    const apresDegats = await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(7));
    expect(apresDegats).toBe('agressif');

    const pv = await page.evaluate(() => window.__NEO_TEST__?.obtenirPvBossCombat?.());
    expect(pv?.pv).toBe(7);
    expect(pv?.pvMax).toBe(14);
});

test('boss Brasier gameplay reel — expression vacillant quasi-vaincu (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);
    await passerFluxLancementMonde(page);

    await page.evaluate(() => {
        window.__NEO_TEST__?.endommagerBossTest?.(7);
        return window.__NEO_TEST__?.endommagerBossTest?.(5);
    });

    const expression = await page.evaluate(() =>
        window.__NEO_TEST__?.obtenirExpressionBossCombat?.()
    );
    expect(expression).toBe('vacillant');
});

test('boss Brasier gameplay reel — victoire puis humeur cutscene (audit B/D)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);
    await passerFluxLancementMonde(page);

    await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(14));
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Tu\.\.\. tu n'as pas compris/i);
    await assertHumeurPortraitCutscene(page, 'brasier_voix', 'vacillant');
});

test('boss Sentinelle gameplay reel — expression calme au combat (audit B/D)', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_SENTINELLE);
    await lancerMondeBossSentinelle(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();

    const expression = await page.evaluate(() =>
        window.__NEO_TEST__?.obtenirExpressionBossCombat?.()
    );
    expect(expression).toBe('calme');
});

test('boss Sentinelle gameplay reel — expression agressif a 50% PV (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_SENTINELLE);
    await lancerMondeBossSentinelle(page);
    await passerFluxLancementMonde(page);

    const apresDegats = await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(6));
    expect(apresDegats).toBe('agressif');

    const pv = await page.evaluate(() => window.__NEO_TEST__?.obtenirPvBossCombat?.());
    expect(pv?.pv).toBe(6);
    expect(pv?.pvMax).toBe(12);
});

test('boss Sentinelle gameplay reel — victoire puis humeur cutscene (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_SENTINELLE);
    await lancerMondeBossSentinelle(page);
    await passerFluxLancementMonde(page);

    await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(12));
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Je n'avais pas modélisé cette variable/i);
    await assertHumeurPortraitCutscene(page, 'sentinelle', 'vacillant');
});
