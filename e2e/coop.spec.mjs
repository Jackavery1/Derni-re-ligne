import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    demarrerPartieCoop,
    filtrerViolationsCritiques,
    preparerPageSansSw,
    attendreApplicationPrete,
    ETAT_DEBLOCAGE_COMPLET,
} from './helpers.mjs';

test('toggle coop active le mode coopératif', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);

    const toggle = page.locator('#toggle-coop');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#coop-toggle-label')).toHaveText('COOP : ON');
    await expect(toggle).toHaveClass(/actif/);
});

test('partie coop affiche le plateau partagé', async ({ page }) => {
    await demarrerPartieCoop(page);
    await expect(page.locator('#zone-jeu-coop canvas')).toBeVisible();
});

test('codex accessible depuis le menu', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
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

test('codex sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-codex').click();
    const result = await new AxeBuilder({ page }).include('#ecran-codex').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});
