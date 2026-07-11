/** Métriques viewport partagées (smoke, audit-c, histoire-responsive). */
import { expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
export async function assertPasDeDebordementHorizontal(page) {
    const metriques = await page.evaluate(() => ({
        debord: document.documentElement.scrollWidth > window.innerWidth + 1,
        overflowY: getComputedStyle(document.documentElement).overflowY,
    }));
    expect(metriques.debord, 'debordement horizontal').toBe(false);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {number} [minH=48]
 */
export async function assertBoutonTactileMin(page, selector, minH = 48) {
    const hauteur = await page.locator(selector).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return Math.round(r.height);
    });
    expect(hauteur, `${selector} hauteur tactile`).toBeGreaterThanOrEqual(minH);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function assertOverlayScrollable(page, selector) {
    const scrollable = await page.locator(selector).evaluate((el) => {
        const style = getComputedStyle(el);
        return style.overflowY === 'auto' || style.overflowY === 'scroll';
    });
    expect(scrollable).toBe(true);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function assertElementDansEcran(page, selector) {
    const dansEcran = await page.locator(selector).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
            r.top >= 0 &&
            r.left >= 0 &&
            r.bottom <= window.innerHeight &&
            r.right <= window.innerWidth
        );
    });
    expect(dansEcran, `${selector} visible dans le viewport`).toBe(true);
}
