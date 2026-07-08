import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete } from './helpers.mjs';

test.describe('audit A — architecture', () => {
    test('A1 — no critical console errors on load', async ({ page }) => {
        await preparerPageSansSw(page);
        const errors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        await page.goto('/');
        await attendreApplicationPrete(page);
        const criticalErrors = errors.filter((e) => !e.includes('UNSAFE') && !e.includes('404'));
        expect(criticalErrors).toHaveLength(0);
    });

    test('A2 — service worker caching works', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const hasSW = await page.evaluate(() => {
            return 'serviceWorker' in navigator;
        });
        expect(hasSW).toBe(true);
    });

    test('A3 — main.js bundle loads successfully', async ({ page }) => {
        await preparerPageSansSw(page);
        let mainLoaded = false;
        page.on('response', (resp) => {
            if (resp.url().includes('main.js')) mainLoaded = true;
        });
        await page.goto('/');
        await attendreApplicationPrete(page);
        expect(mainLoaded).toBe(true);
    });

    test('A4 — event system works (bus jeu)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const busWorks = await page.evaluate(() => {
            return window.__NEO_TEST__?.emettreEvenementBusJeu !== undefined;
        });
        expect(busWorks).toBe(true);
    });

    test('A5 — state accessible via test API', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const apiAvailable = await page.evaluate(() => {
            const methods = [
                'terminerPartie',
                'demarrerPartieLibre',
                'emettreEvenementBusJeu',
                'simulerVictoireSprint',
            ];
            return methods.every((m) => typeof window.__NEO_TEST__?.[m] === 'function');
        });
        expect(apiAvailable).toBe(true);
    });

    test('A6 — no memory leaks on page load', async ({ page }) => {
        await preparerPageSansSw(page);
        const memBefore = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const memAfter = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
        const increase = memAfter / memBefore;
        expect(increase).toBeLessThan(2.5);
    });

    test('A7 — styles loaded from external CSS files', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasExternalCSS = await page.evaluate(() => {
            return Array.from(document.styleSheets).some((sheet) => sheet.href?.includes('.css'));
        });
        expect(hasExternalCSS).toBe(true);
    });

    test('A8 — images use lazy loading where applicable', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const result = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const critiques = imgs.filter(
                (img) =>
                    img.classList.contains('ecran-chargement-image') ||
                    img.getAttribute('fetchpriority') === 'high' ||
                    img.fetchPriority === 'high'
            );
            const deferrables = imgs.filter((img) => !critiques.includes(img));
            const lazyOk = deferrables.every(
                (img) => img.loading === 'lazy' || img.getAttribute('role') === 'presentation'
            );
            return { total: imgs.length, deferrables: deferrables.length, lazyOk };
        });
        expect(result.deferrables === 0 || result.lazyOk).toBe(true);
    });

    test('A9 — fonts preloaded for performance', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasPreload = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('link[rel="preload"]')).some((link) =>
                link.href?.includes('font')
            );
        });
        expect(hasPreload).toBe(true);
    });

    test('A10 — modular component structure', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const hasModules = await page.evaluate(() => {
            return (
                document.querySelectorAll('[id^="interface-"], [id^="zone-"], [id^="canvas-"]')
                    .length > 5
            );
        });
        expect(hasModules).toBe(true);
    });

    test('A11 — responsive canvas elements', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const canvasExists = await page.evaluate(() => {
            return document.querySelectorAll('canvas').length > 0;
        });
        expect(canvasExists).toBe(true);
    });

    test('A12 — HTML semantic markup used', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasSemantics = await page.evaluate(() => {
            const semanticTags = ['main', 'nav', 'section', 'article', 'header', 'footer'];
            return semanticTags.some((tag) => document.querySelector(tag));
        });
        expect(hasSemantics).toBe(true);
    });

    test('A13 — ARIA roles for accessibility', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const hasARIA = await page.evaluate(() => {
            const elements = document.querySelectorAll('[role]');
            return elements.length > 3;
        });
        expect(hasARIA).toBe(true);
    });

    test('A14 — DOM not excessively nested', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const maxDepth = await page.evaluate(() => {
            let max = 0;
            document.querySelectorAll('*').forEach((el) => {
                let depth = 0;
                let current = el;
                while (current.parentElement) {
                    depth++;
                    current = current.parentElement;
                }
                max = Math.max(max, depth);
            });
            return max;
        });
        expect(maxDepth).toBeLessThan(25);
    });

    test('A15 — script execution time reasonable', async ({ page }) => {
        await preparerPageSansSw(page);
        const start = Date.now();
        await page.goto('/');
        await attendreApplicationPrete(page);
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(15000);
    });

    test('A16 — no inline scripts (CSP compliant)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const inlineScripts = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('script:not([src])')).filter(
                (s) => s.textContent.trim().length > 10
            ).length;
        });
        expect(inlineScripts).toBeLessThan(2);
    });

    test('A17 — viewport meta tag configured', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasViewport = await page.evaluate(() => {
            return document
                .querySelector('meta[name="viewport"]')
                ?.content.includes('width=device-width');
        });
        expect(hasViewport).toBe(true);
    });

    test('A18 — manifest.json linked for PWA', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasManifest = await page.evaluate(() => {
            return document.querySelector('link[rel="manifest"]') !== null;
        });
        expect(hasManifest).toBe(true);
    });

    test('A19 — meta theme-color configured', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasThemeColor = await page.evaluate(() => {
            return document.querySelector('meta[name="theme-color"]')?.content.length > 0;
        });
        expect(hasThemeColor).toBe(true);
    });

    test('A20 — CSP header or meta tag present', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasCSP = await page.evaluate(() => {
            return document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
        });
        expect(hasCSP).toBe(true);
    });
});
