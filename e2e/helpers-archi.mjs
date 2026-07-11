/** Helpers E2E — mode architecte. */
import { expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
export async function ouvrirPremierNiveauArchitecte(page) {
    await page.locator('.carte-niveau-archi').first().click();
    await expect(page.locator('#panneau-detail-corps')).toHaveClass(/panneau-detail-corps--ouvert/);
    await page.locator('#btn-panneau-detail-jouer').click();
}
