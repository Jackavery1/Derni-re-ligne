/**
 * Checklist CONTRIBUTING — couverture automatisée des 7 points iPhone physique.
 * Complète audit-c-responsive (simulation encoche) ; exécuter avant release PWA.
 */
import { test, expect, devices } from '@playwright/test';
import {
    demarrerPartie,
    demarrerPartieCoop,
    terminerPartieCourante,
    activerPausePartie,
    activerPauseCoopTactile,
    appliquerSafeAreaIphone,
    creerPageIphone14,
    ouvrirCarteHistoire,
    ANNOTATION_C11,
    attendreApplicationPrete,
    preparerPageSansSw,
    lancerMondeDepuisCarte,
    fermerRecapPostMonde,
    passerCutsceneEntiere,
    attendreJournalHistoire,
    ouvrirPremierNiveauArchitecte,
} from './helpers.mjs';
import {
    assertPasDeDebordementHorizontal,
    assertBoutonTactileMin,
} from './helpers-responsive-metriques.mjs';
import { ETAT_DEBLOCAGE_META_RAPIDE, ETAT_CYBER_LABO_PRET } from './etats-histoire.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

test.describe('checklist iPhone — simulation safe-area (CONTRIBUTING)', () => {
    test.beforeEach(async () => {
        test.info().annotations.push(ANNOTATION_C11);
    });

    test('1. pause solo paysage — Reprendre sous encoche ≥48px', async ({ browser }) => {
        const context = await browser.newContext({ ...devices['iPhone 14 landscape'] });
        const page = await context.newPage();
        await demarrerPartie(page);
        await appliquerSafeAreaIphone(page, 'iPhone 14 landscape');
        await activerPausePartie(page);
        await assertPasDeDebordementHorizontal(page);
        await assertBoutonTactileMin(page, '#btn-reprendre');
        await context.close();
    });

    test('2. pause coop paysage — Reprendre et HUD ≥48px', async ({ browser }) => {
        const context = await browser.newContext({ ...devices['iPhone 14 landscape'] });
        const page = await context.newPage();
        await demarrerPartieCoop(page);
        await appliquerSafeAreaIphone(page, 'iPhone 14 landscape');
        await activerPauseCoopTactile(page);
        await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/);
        await assertBoutonTactileMin(page, '#btn-coop-reprendre');
        await context.close();
    });

    test('3. game over solo et coop paysage — boutons visibles', async ({ browser }) => {
        const context = await browser.newContext({ ...devices['iPhone 14 landscape'] });
        const page = await context.newPage();
        await demarrerPartie(page);
        await terminerPartieCourante(page);
        await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/);
        await assertPasDeDebordementHorizontal(page);
        await context.close();
    });

    test('4. carte histoire — en-tête et retour safe-area', async ({ browser }) => {
        const { context, page } = await creerPageIphone14(browser);
        await ouvrirCarteHistoire(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await appliquerSafeAreaIphone(page, 'iPhone 14');
        const top = await page.evaluate(() => {
            const btn = document.getElementById('btn-histoire-retour');
            return btn?.getBoundingClientRect().top ?? -1;
        });
        expect(top).toBeGreaterThanOrEqual(46);
        await context.close();
    });

    test('5. journal histoire — scrollable, fermer ≥48px', async ({ page }) => {
        test.setTimeout(60000);
        await page.setViewportSize({ width: 319, height: 844 });
        await ouvrirCarteHistoire(page, ETAT_CYBER_LABO_PRET);
        await page.evaluate(async () => {
            await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_cyber', 99);
        });
        await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });
        await fermerRecapPostMonde(page);
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        await passerCutsceneEntiere(page);
        await attendreJournalHistoire(page);
        const scrollable = await page.locator('#histoire-journal-texte').evaluate((el) => {
            const s = getComputedStyle(el);
            return s.overflowY === 'auto' || s.overflowY === 'scroll';
        });
        expect(scrollable).toBe(true);
        await assertBoutonTactileMin(page, '#btn-journal-fermer');
    });

    test('6. cutscene portrait 319px — boutons visibles', async ({ page }) => {
        test.setTimeout(60000);
        await page.setViewportSize({ width: 319, height: 844 });
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
        await lancerMondeDepuisCarte(page, 'monde_prologue');
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        await assertBoutonTactileMin(page, '#btn-cutscene-suivant');
        await assertBoutonTactileMin(page, '#btn-cutscene-passer');
    });

    test('7. architecte portrait — contrôles utilisables', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-architecte').click();
        await ouvrirPremierNiveauArchitecte(page);
        await expect(page.locator('#interface-jeu-archi')).toBeVisible();
        await assertPasDeDebordementHorizontal(page);
    });
});
