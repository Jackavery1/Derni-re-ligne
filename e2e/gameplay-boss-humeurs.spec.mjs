import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    lancerMondeBossBrasier,
    lancerMondeBossSentinelle,
    lancerMondeBossArchiviste,
    lancerMondeBossAvantGarde,
    lancerMondeBossDistorsion,
    attendreCutsceneVictoireBoss,
    avancerCutsceneJusquaPivot,
    assertHumeurPortraitCutscene,
} from './helpers.mjs';
import {
    ETAT_AVANT_BOSS_SENTINELLE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_AVANT_BOSS_AVANTGARDE,
    ETAT_AVANT_FIN_NORMALE,
} from './etats-histoire.mjs';
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

test('boss Archiviste gameplay reel — expression calme au combat (audit B/D)', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await lancerMondeBossArchiviste(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();

    const expression = await page.evaluate(() =>
        window.__NEO_TEST__?.obtenirExpressionBossCombat?.()
    );
    expect(expression).toBe('calme');
});

test('boss Archiviste gameplay reel — expression agressif a 50% PV (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await lancerMondeBossArchiviste(page);
    await passerFluxLancementMonde(page);

    const apresDegats = await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(7));
    expect(apresDegats).toBe('agressif');

    const pv = await page.evaluate(() => window.__NEO_TEST__?.obtenirPvBossCombat?.());
    expect(pv?.pv).toBe(7);
    expect(pv?.pvMax).toBe(14);
});

test('boss Archiviste gameplay reel — victoire puis humeur cutscene (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await lancerMondeBossArchiviste(page);
    await passerFluxLancementMonde(page);

    await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(14));
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /ERREUR_CRITIQUE/i);
    await assertHumeurPortraitCutscene(page, 'archiviste', 'vacillant');
});

test('boss Avant-Garde gameplay reel — expression calme au combat (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_AVANTGARDE);
    await lancerMondeBossAvantGarde(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();

    const expression = await page.evaluate(() =>
        window.__NEO_TEST__?.obtenirExpressionBossCombat?.()
    );
    expect(expression).toBe('calme');
});

test('boss Avant-Garde gameplay reel — expression agressif a 50% PV (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_AVANTGARDE);
    await lancerMondeBossAvantGarde(page);
    await passerFluxLancementMonde(page);

    const apresDegats = await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(5));
    expect(apresDegats).toBe('agressif');

    const pv = await page.evaluate(() => window.__NEO_TEST__?.obtenirPvBossCombat?.());
    expect(pv?.pv).toBe(5);
    expect(pv?.pvMax).toBe(10);
});

test('boss Avant-Garde gameplay reel — victoire puis humeur cutscene (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_AVANTGARDE);
    await lancerMondeBossAvantGarde(page);
    await passerFluxLancementMonde(page);

    await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(10));
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Elle dit bonjour/i);
    await assertHumeurPortraitCutscene(page, 'avantgarde', 'calme');
});

test('boss Distorsion gameplay reel — expression calme au combat (audit B/D)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
    await lancerMondeBossDistorsion(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();

    const expression = await page.evaluate(() =>
        window.__NEO_TEST__?.obtenirExpressionBossCombat?.()
    );
    expect(expression).toBe('calme');
});

test('boss Distorsion gameplay reel — expression agressif a 50% PV (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
    await lancerMondeBossDistorsion(page);
    await passerFluxLancementMonde(page);

    const apresDegats = await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(16));
    expect(apresDegats).toBe('agressif');

    const pv = await page.evaluate(() => window.__NEO_TEST__?.obtenirPvBossCombat?.());
    expect(pv?.pv).toBe(16);
    expect(pv?.pvMax).toBe(32);
});

test('boss Distorsion gameplay reel — victoire puis humeur cutscene (audit B/D)', async ({
    page,
}) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
    await lancerMondeBossDistorsion(page);
    await passerFluxLancementMonde(page);

    await page.evaluate(() => window.__NEO_TEST__?.endommagerBossTest?.(32));
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Tu m'as vaincue/i);
    await assertHumeurPortraitCutscene(page, 'distorsion', 'souffrante');
});
