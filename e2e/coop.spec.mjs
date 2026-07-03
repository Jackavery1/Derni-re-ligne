import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    demarrerPartieCoop,
    filtrerViolationsCritiques,
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    fermerInfobulleContexteSiVisible,
    ETAT_DEBLOCAGE_META_RAPIDE,
} from './helpers.mjs';

test('toggle coop active le mode coopératif', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await fermerInfobulleContexteSiVisible(page);

    const toggle = page.locator('#toggle-coop');
    await expect(toggle).toBeVisible();
    await toggle.click({ force: true });
    await expect(page.locator('#coop-toggle-label')).toHaveText('COOP : ON');
    await expect(toggle).toHaveClass(/actif/);
});

test('partie coop affiche le plateau partagé', async ({ page }) => {
    await demarrerPartieCoop(page);
    await expect(page.locator('#zone-jeu-coop canvas')).toBeVisible();
});

test('codex accessible depuis le menu', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    await expect(page.locator('#ecran-codex .codex-contenu')).toBeVisible();
});

test('interface coop sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartieCoop(page);
    const result = await new AxeBuilder({ page }).include('#interface-jeu-coop').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('coop paysage mobile — contrôles latéraux visibles', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await demarrerPartieCoop(page);

    await expect(page.locator('#controles-coop-j1')).toBeVisible();
    await expect(page.locator('#controles-coop-j2')).toBeVisible();

    const layout = await page.evaluate(() => {
        const j1 = document.getElementById('controles-coop-j1');
        const panneau = document.querySelector('#interface-jeu-coop .panneau-coop');
        const styleJ1 = j1 ? getComputedStyle(j1) : null;
        const styleP = panneau ? getComputedStyle(panneau) : null;
        const btn = document.getElementById('ccj1-gauche');
        const rect = btn?.getBoundingClientRect();
        return {
            j1Visible: styleJ1?.display !== 'none',
            panneauMasque: styleP?.display === 'none',
            btnH: rect?.height ?? 0,
        };
    });
    expect(layout.j1Visible).toBe(true);
    expect(layout.panneauMasque).toBe(true);
    expect(layout.btnH).toBeGreaterThanOrEqual(48);

    await page.locator('#ccj1-gauche').click();
});

test('codex sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await page.locator('#btn-codex').click();
    const result = await new AxeBuilder({ page }).include('#ecran-codex').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});
