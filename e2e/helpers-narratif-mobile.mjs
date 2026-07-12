/** Métriques mobile narratif (audit D8) — boss HUD, cutscenes. */
import { expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
export async function mesurerBossPortraitHud(page) {
    return page.evaluate(() => {
        const portrait = document.getElementById('canvas-boss-portrait');
        const nom = document.getElementById('boss-nom-affiche');
        const rectP = portrait?.getBoundingClientRect();
        const rectN = nom?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            portraitW: rectP?.width ?? 0,
            portraitH: rectP?.height ?? 0,
            dansEcran: Boolean(
                rectP &&
                rectN &&
                rectP.left >= -2 &&
                rectP.right <= window.innerWidth + 2 &&
                rectN.bottom <= window.innerHeight + 2
            ),
        };
    });
}

/** @param {Record<string, unknown>} metriques */
export function assertBossPortraitDansEcran(metriques) {
    expect(metriques.debord).toBe(false);
    expect(metriques.portraitW).toBeGreaterThan(0);
    expect(metriques.portraitH).toBeGreaterThan(0);
    expect(metriques.dansEcran).toBe(true);
}
