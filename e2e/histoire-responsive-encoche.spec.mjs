import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    appliquerSafeAreaIphone,
    ANNOTATION_C11,
    creerPageIphone14,
    lancerMondeDepuisCarte,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

test(
    'iphone — cutscene respecte encoche simulee (audit C11)',
    { tag: '@viewport-mobile-portrait' },
    async ({ browser }) => {
        test.info().annotations.push(ANNOTATION_C11);

        const { context, page } = await creerPageIphone14(browser);
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
        await appliquerSafeAreaIphone(page);
        await lancerMondeDepuisCarte(page, 'monde_prologue');

        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });

        const metriques = await page.evaluate(() => {
            const cutscene = document.getElementById('ecran-histoire-cutscene');
            const suivant = document.getElementById('btn-cutscene-suivant');
            const style = cutscene ? getComputedStyle(cutscene) : null;
            const rect = suivant?.getBoundingClientRect();
            return {
                paddingTop: style?.paddingTop ?? '',
                safeTop: getComputedStyle(document.documentElement)
                    .getPropertyValue('--safe-top')
                    .trim(),
                boutonDansEcran: Boolean(
                    rect && rect.bottom <= window.innerHeight && rect.top >= 46
                ),
                debord:
                    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            };
        });
        expect(metriques.safeTop).toBe('47px');
        expect(metriques.paddingTop).toMatch(/47px|calc/);
        expect(metriques.boutonDansEcran).toBe(true);
        expect(metriques.debord).toBe(false);

        await context.close();
    }
);
