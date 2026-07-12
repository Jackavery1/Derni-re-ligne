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
 * @param {{ idEcran: string, selecteurBouton: string }} opts
 */
export async function mesurerEncocheHaut(page, { idEcran, selecteurBouton }) {
    return page.evaluate(
        ({ idEcran, selecteurBouton }) => {
            const ecran = document.getElementById(idEcran);
            const style = ecran ? getComputedStyle(ecran) : null;
            const bouton = document.querySelector(selecteurBouton);
            const rect = bouton?.getBoundingClientRect();
            return {
                paddingTop: style?.paddingTop ?? '',
                topBouton: rect?.top ?? -1,
                boutonH: rect?.height ?? 0,
                boutonW: rect?.width ?? 0,
                safeTop: getComputedStyle(document.documentElement)
                    .getPropertyValue('--safe-top')
                    .trim(),
            };
        },
        { idEcran, selecteurBouton }
    );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ idConteneur: string, selecteurBouton: string }} opts
 */
export async function mesurerEncocheLaterale(page, { idConteneur, selecteurBouton }) {
    return page.evaluate(
        ({ idConteneur, selecteurBouton }) => {
            const conteneur = document.getElementById(idConteneur);
            const style = conteneur ? getComputedStyle(conteneur) : null;
            const bouton = document.querySelector(selecteurBouton);
            const rect = bouton?.getBoundingClientRect();
            return {
                paddingLeft: style?.paddingLeft ?? '',
                leftBouton: rect?.left ?? -1,
                boutonH: rect?.height ?? 0,
                safeLeft: getComputedStyle(document.documentElement)
                    .getPropertyValue('--safe-left')
                    .trim(),
            };
        },
        { idConteneur, selecteurBouton }
    );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string[]} ids
 */
export async function mesurerBoutonsParIds(page, ids) {
    return page.evaluate((ids) => {
        return ids.map((id) => {
            const rect = document.getElementById(id)?.getBoundingClientRect();
            return { id, h: rect?.height ?? 0, w: rect?.width ?? 0 };
        });
    }, ids);
}

/**
 * @param {Record<string, unknown>} metriques
 * @param {{ safeTop?: string, minPadding?: number, minTop?: number, minH?: number, minW?: number }} [opts]
 */
export function assertEncocheHautRespectee(
    metriques,
    { safeTop, minPadding = 46, minTop = 46, minH = 48, minW = 48 } = {}
) {
    if (safeTop !== undefined) {
        expect(metriques.safeTop).toBe(safeTop);
    }
    expect(parseFloat(String(metriques.paddingTop))).toBeGreaterThanOrEqual(minPadding);
    expect(metriques.topBouton).toBeGreaterThanOrEqual(minTop);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(minH);
    if (minW !== undefined && metriques.boutonW !== undefined) {
        expect(metriques.boutonW).toBeGreaterThanOrEqual(minW);
    }
}

/**
 * @param {Record<string, unknown>} metriques
 * @param {{ safeLeft?: string, minPadding?: number, minLeft?: number, minH?: number }} [opts]
 */
export function assertEncocheLateraleRespectee(
    metriques,
    { safeLeft, minPadding, minLeft = 0, minH = 48 } = {}
) {
    if (safeLeft !== undefined) {
        expect(metriques.safeLeft).toBe(safeLeft);
    }
    if (minPadding !== undefined) {
        expect(parseFloat(String(metriques.paddingLeft))).toBeGreaterThanOrEqual(minPadding);
    }
    if (minLeft > 0) {
        expect(metriques.leftBouton).toBeGreaterThanOrEqual(minLeft);
    }
    expect(metriques.boutonH).toBeGreaterThanOrEqual(minH);
}

/** @param {Array<{ id: string, h: number, w: number }>} boutons @param {number} [min=48] */
export function assertBoutonsTactilesMin(boutons, min = 48) {
    for (const btn of boutons) {
        expect(btn.h, btn.id).toBeGreaterThanOrEqual(min);
        expect(btn.w, btn.id).toBeGreaterThanOrEqual(min);
    }
}
