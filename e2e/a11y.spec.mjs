import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    filtrerViolationsCritiques,
    terminerPartieCourante,
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    ETAT_DEBLOCAGE_COMPLET,
} from './helpers.mjs';

test('écran titre sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-titre').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('achievements sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-achievements').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('profil sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-profil').click();
    await expect(page.locator('#ecran-profil')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-profil').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('sélection biome sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-selection').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('pause sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
    await page.keyboard.press('p');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-pause').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('game over sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartie(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
    const result = await new AxeBuilder({ page }).include('#ecran-game-over').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});
