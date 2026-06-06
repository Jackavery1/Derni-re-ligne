import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    filtrerViolationsCritiques,
    preparerPageSansSw,
    ETAT_DEBLOCAGE_COMPLET,
} from './helpers.mjs';

test('écran sélection constellation sans violations critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('écran options sans violations critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('navigation vers la sélection architecte', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    await expect(page.locator('#archi-sel-grille')).toBeVisible();
});

test('sélection architecte sans violations critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('lancement niveau architecte affiche le plateau', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    await page.locator('.carte-niveau-archi').first().click();
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#zone-jeu-archi canvas')).toBeVisible();
});

test('retour menu depuis sélection architecte', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-architecte').click();
    await page.locator('#archi-sel-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
});

test('undo architecte restaure un placement', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-architecte').click();
    await page.locator('.carte-niveau-archi').first().click();
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const piecesAvant = await page.locator('#archi-pieces-used').textContent();
    await page.keyboard.press('Enter');
    await expect(page.locator('#archi-pieces-used')).not.toHaveText(piecesAvant ?? '0');
    await page.keyboard.press('Backspace');
    await expect(page.locator('#archi-pieces-used')).toHaveText(piecesAvant ?? '0');
});
