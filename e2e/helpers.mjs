import { expect } from '@playwright/test';

/** Filtre les violations Axe bloquantes (hors contraste optionnel). */
export function filtrerViolationsCritiques(violations, { inclureContraste = false } = {}) {
    return violations.filter((v) => {
        if (v.impact === 'critical') return true;
        if (v.impact === 'serious' && v.id !== 'color-contrast') return true;
        if (inclureContraste && v.id === 'color-contrast') return true;
        return false;
    });
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartie(page) {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    const canvas = page.locator('#canvas-constellation');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    await canvas.click({
        position: { x: box.width * 0.5, y: box.height * 0.5 },
    });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu')).toBeVisible();
    await expect(page.locator('#canvas-plateau')).toBeVisible();
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await page.locator('#toggle-coop').click();
    const canvas = page.locator('#canvas-constellation');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    await canvas.click({
        position: { x: box.width * 0.5, y: box.height * 0.5 },
    });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu-coop')).toBeVisible({ timeout: 5000 });
}
