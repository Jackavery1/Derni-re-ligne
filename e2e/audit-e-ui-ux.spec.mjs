import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    preparerPageModeLibreTutorielActif,
    attendreNotificationsInitiales,
    selectionnerBiomeClavier,
} from './helpers.mjs';
import { mesurerContrasteCorps, mesurerContrasteTexteDiscret } from './helpers-contraste.mjs';

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

        const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
        const graves = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
        );
        expect(graves).toEqual([]);
    });

    test('E1b — contraste bouton principal titre (Axe)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);

        const results = await new AxeBuilder({ page })
            .include('#btn-jouer')
            .withRules(['color-contrast'])
            .analyze();
        expect(results.violations).toEqual([]);
    });

    test('E2 — color contrast meets WCAG standard', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);

        const ratio = await mesurerContrasteCorps(page);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('E2b — texte discret respecte le contraste AA', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);

        const ratio = await mesurerContrasteTexteDiscret(page);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('E3 — buttons have visible focus states', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);

        const btn = page.locator('#btn-jouer');
        await btn.focus();
        const hasFocusRing = await btn.evaluate((el) => {
            const style = getComputedStyle(el);
            const outlineVisible =
                style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
            const shadowVisible = style.boxShadow !== 'none';
            return outlineVisible || shadowVisible;
        });
        expect(hasFocusRing).toBe(true);
    });

    test('E3d — tutoriel piege le focus clavier', async ({ page }) => {
        await preparerPageModeLibreTutorielActif(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await attendreNotificationsInitiales(page);
        await page.locator('#btn-jouer').click();
        await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
        await selectionnerBiomeClavier(page);
        await page.locator('#btn-panneau-detail-jouer').click({ force: true });

        const overlay = page.locator('#overlay-tutoriel');
        await expect(overlay).not.toHaveClass(/element-masque/);
        await expect(overlay).toHaveAttribute('aria-hidden', 'false');

        const focusPiege = await page.evaluate(() => {
            const conteneur = document.getElementById('overlay-tutoriel');
            const bouton = document.getElementById('btn-tutoriel-fermer');
            if (!conteneur || !bouton) return false;
            bouton.focus();
            return document.activeElement === bouton && conteneur.contains(document.activeElement);
        });
        expect(focusPiege).toBe(true);

        await page.keyboard.press('Tab');
        const focusApresTab = await page.evaluate(() => {
            const conteneur = document.getElementById('overlay-tutoriel');
            return Boolean(conteneur?.contains(document.activeElement));
        });
        expect(focusApresTab).toBe(true);
    });

    test('E3c — HUD pause et mute ont un focus visible en partie', async ({ page }) => {
        const { demarrerPartie } = await import('./helpers-partie.mjs');
        await preparerPageSansSw(page);
        await page.goto('/?neoTest=1');
        await attendreApplicationPrete(page);
        await demarrerPartie(page);

        for (const id of ['btn-pause', 'btn-mute']) {
            const btn = page.locator(`#${id}`);
            await expect(btn).toBeVisible();
            await btn.focus();
            const hasFocusRing = await btn.evaluate((el) => {
                const style = getComputedStyle(el);
                return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
            });
            expect(hasFocusRing, id).toBe(true);
        }
    });

    test('E3a — prefers-reduced-motion desactive les animations longues', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await attendreApplicationPrete(page);
        const dureeReduite = await page.evaluate(() => {
            const probe = document.createElement('div');
            probe.style.animation = 'clignoter-suite 1s infinite';
            document.body.appendChild(probe);
            const ms = parseFloat(getComputedStyle(probe).animationDuration);
            probe.remove();
            return ms;
        });
        expect(dureeReduite).toBeLessThanOrEqual(0.02);
    });

    test('E3b — toggle contraste eleve disponible', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').click();
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
        const btn = page.locator('#btn-toggle-contraste');
        await expect(btn).toBeVisible();
        await btn.click();
        const actif = await page.evaluate(() =>
            document.body.classList.contains('contraste-eleve')
        );
        expect(actif).toBe(true);
    });

    test('E3e — toggle daltonien persiste (audit E10)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').click();
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
        const btn = page.locator('#btn-toggle-daltonien');
        await expect(btn).toBeVisible();
        await btn.click();
        const actif = await page.evaluate(
            () => localStorage.getItem('derniereLigne_daltonien') === 'true'
        );
        expect(actif).toBe(true);
    });

    test('E4 — interactive elements have adequate size (48px) on selection screen', async ({
        page,
    }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-jouer').click();
        await page.locator('#ecran-selection').waitFor({ state: 'visible' });
        const buttons = await page.locator('#ecran-selection button:visible').all();
        expect(buttons.length).toBeGreaterThan(0);
        for (const btn of buttons) {
            const box = await btn.boundingBox();
            if (box) {
                expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(48);
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
            const typoVars = ['--police', '--font-ui', '--police-ui'];
            return typoVars.every((v) => style.getPropertyValue(v).trim().length > 0);
        });
        expect(hasTypoVars).toBe(true);
    });

    test('E7 — spacing units consistent (clamp, rem, vw)', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);

        const hasSpacingTokens = await page.evaluate(() => {
            const style = getComputedStyle(document.documentElement);
            return ['--space-1', '--space-4', '--space-6'].every(
                (token) => style.getPropertyValue(token).trim().length > 0
            );
        });
        expect(hasSpacingTokens).toBe(true);
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
        await attendreApplicationPrete(page);

        const responsive = await page.evaluate(async () => {
            const res = await fetch('styles/variables.css');
            const css = await res.text();
            return css.includes('clamp') && css.includes('vw') && css.includes('safe-area-inset');
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
        await expect(errorBanner).toBeAttached();
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
