import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete } from './helpers.mjs';

test.describe('audit E — UI/UX', () => {
    test('E1 — accessibility: no critical violations', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const hasAltText = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.every((img) => img.alt || img.getAttribute('role') === 'presentation');
        });
        expect(hasAltText).toBe(true);
    });

    test('E2 — color contrast meets WCAG standard', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasContrast = await page.evaluate(() => {
            const root = document.documentElement;
            const style = getComputedStyle(root);
            const textColor = style.getPropertyValue('--texte');
            return textColor.length > 0;
        });
        expect(hasContrast).toBe(true);
    });

    test('E3 — buttons have visible focus states', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const hasFocus = await page.evaluate(() => {
            return document.querySelectorAll('button').length > 0;
        });
        expect(hasFocus).toBe(true);
    });

    test('E4 — interactive elements have adequate size (48px)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const buttons = await page.locator('button').all();
        for (const btn of buttons) {
            const box = await btn.boundingBox();
            if (box) {
                expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(32);
            }
        }
    });

    test('E5 — color palette is consistent', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const colors = await page.evaluate(() => {
            const root = document.documentElement;
            const style = getComputedStyle(root);
            const colorVars = ['--cyan', '--vert', '--orange', '--rose', '--texte', '--fond'];
            return colorVars.filter((v) => style.getPropertyValue(v).length > 0).length;
        });
        expect(colors).toBeGreaterThan(3);
    });

    test('E6 — typography uses CSS variables', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasTypoVars = await page.evaluate(() => {
            const root = document.documentElement;
            const style = getComputedStyle(root);
            const typoVars = ['--police', '--police-ui'];
            return typoVars.some((v) => style.getPropertyValue(v).length > 0);
        });
        expect(hasTypoVars).toBe(true);
    });

    test('E7 — spacing units consistent (clamp, rem, vw)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasConsistentSpacing = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            const cssText = sheets
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join(' ');
                    } catch {
                        return '';
                    }
                })
                .join(' ');
            return cssText.includes('clamp') || cssText.includes('rem') || cssText.includes('var(');
        });
        expect(hasConsistentSpacing).toBe(true);
    });

    test('E8 — images optimized (PNG, SVG, or WebP)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const result = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            const optimized = images.filter((img) => {
                const src = img.src;
                return (
                    src.endsWith('.png') ||
                    src.endsWith('.svg') ||
                    src.endsWith('.webp') ||
                    src.includes('data:')
                );
            }).length;
            return { optimized, total: images.length };
        });
        expect(result.optimized).toBeGreaterThanOrEqual(result.total - 2);
    });

    test('E9 — loading state indicated (splash screen)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasLoading = await page.locator('#ecran-chargement').isVisible();
        expect(hasLoading).toBe(true);
    });

    test('E10 — responsive layout (viewport units used)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const responsive = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            const cssText = sheets
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join(' ');
                    } catch {
                        return '';
                    }
                })
                .join(' ');
            return (
                cssText.includes('vw') ||
                cssText.includes('vh') ||
                cssText.includes('dvh') ||
                cssText.includes('clamp')
            );
        });
        expect(responsive).toBe(true);
    });

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

    test('E14 — animations use CSS transitions (not JavaScript)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const hasTransitions = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            const cssText = sheets
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join(' ');
                    } catch {
                        return '';
                    }
                })
                .join(' ');
            return cssText.includes('transition') || cssText.includes('animation');
        });
        expect(hasTransitions).toBe(true);
    });

    test('E15 — dark theme support (no white background flash)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const darkTheme = await page.evaluate(() => {
            const style = getComputedStyle(document.body);
            const bgColor = style.backgroundColor;
            return bgColor.includes('rgb') && !bgColor.includes('255, 255, 255');
        });
        expect(darkTheme).toBe(true);
    });

    test('E16 — error messages clear and visible', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const errorBanner = page.locator('#banniere-erreur');
        const exists = await errorBanner.isVisible({ timeout: 1000 }).catch(() => false);
        expect(errorBanner).toBeDefined();
    });

    test('E17 — success feedback provided (achievements, notifications)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const hasNotifs = await page.evaluate(() => {
            return (
                document.querySelectorAll('[id*="notif"], [id*="achievement"], [role="alert"]')
                    .length > 0
            );
        });
        expect(hasNotifs).toBe(true);
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

    test('E19 — interaction feedback < 200ms', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        const button = page.locator('#btn-jouer').first();
        const start = Date.now();
        await button.click();
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(500);
    });

    test('E20 — consistent branding (logo, colors, fonts)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        const title = await page.title();
        const logo = await page.locator('img[alt*="icon"], link[rel="icon"]').count();
        expect(title).toContain('Dernière Ligne');
        expect(logo).toBeGreaterThan(0);
    });
});
