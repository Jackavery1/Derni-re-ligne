import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    activerPausePartie,
    attendreNotificationsInitiales,
    ETAT_DEBLOCAGE_META_RAPIDE,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

test.describe('régressions visuelles', () => {
    test.beforeEach(async ({ page }) => {
        await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('écran titre', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
            timeout: 15000,
        });
        await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-titre')).toHaveScreenshot('ecran-titre.png', {
            animations: 'disabled',
        });
    });

    test('écran options', async ({ page }) => {
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').click();
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-options')).toHaveScreenshot('ecran-options.png', {
            animations: 'disabled',
        });
    });

    test('écran codex', async ({ page }) => {
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-codex').click();
        await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-codex')).toHaveScreenshot('ecran-codex.png', {
            animations: 'disabled',
        });
    });

    test('écran sélection', async ({ page }) => {
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-jouer').click();
        await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-selection')).toHaveScreenshot('ecran-selection.png', {
            animations: 'disabled',
        });
    });

    test('écran sélection tablette paysage sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-jouer').click();
        await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
        const metriques = await page.evaluate(() => ({
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            constellation: Boolean(document.getElementById('canvas-constellation')),
        }));
        expect(metriques.debord).toBe(false);
        expect(metriques.constellation).toBe(true);
    });
});

test.describe('régressions visuelles mobile', () => {
    test.beforeEach(async ({ page }) => {
        await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('écran titre mobile portrait', { tag: '@viewport-mobile-portrait' }, async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
            timeout: 15000,
        });
        await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-titre')).toHaveScreenshot(
            'ecran-titre-mobile-portrait.png',
            {
                animations: 'disabled',
            }
        );
    });

    test('pause mobile portrait', { tag: '@viewport-mobile-portrait' }, async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        await demarrerPartie(page);
        await activerPausePartie(page);
        await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-pause')).toHaveScreenshot(
            'ecran-pause-mobile-portrait.png',
            {
                animations: 'disabled',
            }
        );
    });

    test('pause coop mobile portrait', { tag: '@viewport-mobile-portrait' }, async ({ page }) => {
        const { demarrerPartieCoop, activerPauseCoopTactile } = await import('./helpers.mjs');
        await page.setViewportSize({ width: 844, height: 390 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        await demarrerPartieCoop(page);
        await activerPauseCoopTactile(page);
        await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-pause-coop')).toHaveScreenshot(
            'ecran-pause-coop-mobile-portrait.png',
            { animations: 'disabled' }
        );
    });

    test(
        'game over victoire sprint mobile portrait',
        { tag: '@viewport-mobile-portrait' },
        async ({ page }) => {
            await page.goto('/');
            await attendreApplicationPrete(page);
            await page.locator('#btn-jouer').click();
            await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
            await page.evaluate(() => {
                document.getElementById('toggle-sprint')?.click();
                document.getElementById('btn-panneau-detail-jouer')?.click();
            });
            await page.evaluate(() => window.__NEO_TEST__?.simulerVictoireSprint?.());
            await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 5000 });
            await expect(page.locator('#ecran-game-over')).toHaveScreenshot(
                'ecran-game-over-victoire-mobile.png',
                {
                    animations: 'disabled',
                    maxDiffPixelRatio: 0.04,
                }
            );
        }
    );

    test('cutscene prologue ultra-étroit', { tag: '@viewport-mobile-etroit' }, async ({ page }) => {
        test.setTimeout(45000);
        await page.addInitScript((etat) => {
            localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
            localStorage.setItem('dl_migration_v1', '1');
            localStorage.setItem('derniereLigne_tutorielVu', '1');
            localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
            localStorage.setItem('derniereLigne_introHistoireVue', '1');
        }, ETAT_HISTOIRE_VIDE);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await attendreNotificationsInitiales(page);
        await page.locator('#btn-continuer').click();
        await page
            .locator('#histoire-monde-clavier')
            .selectOption('monde_prologue', { force: true });
        await page.locator('.bouton-jouer-monde').click({ force: true });
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 15000,
        });
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveScreenshot(
            'cutscene-prologue-319.png',
            { animations: 'disabled' }
        );
    });
});
