import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete } from './helpers.mjs';

test.describe('audit E — UI/UX viewports', () => {
    test('E11 — mobile portrait mode works', async ({ page }) => {
        await preparerPageSansSw(page);
        page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        const isVisible = await page.locator('body').isVisible();
        expect(isVisible).toBe(true);
    });

    test('E12 — tablet landscape mode works', async ({ page }) => {
        await preparerPageSansSw(page);
        page.setViewportSize({ width: 1024, height: 768 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        const isVisible = await page.locator('body').isVisible();
        expect(isVisible).toBe(true);
    });

    test('E13 — desktop mode works', async ({ page }) => {
        await preparerPageSansSw(page);
        page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        const isVisible = await page.locator('body').isVisible();
        expect(isVisible).toBe(true);
    });

    test('E18 — no horizontal scrolling needed', async ({ page }) => {
        await preparerPageSansSw(page);
        page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
});
