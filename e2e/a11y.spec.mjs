import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { filtrerViolationsCritiques } from './helpers.mjs';

test('achievements sans violations accessibilité critiques', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-achievements').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('profil sans violations accessibilité critiques', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-profil').click();
    await expect(page.locator('#ecran-profil')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-profil').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});
