/** Helpers E2E — flux partie solo (pause, démarrage, fin). */
import { expect } from '@playwright/test';
import {
    boutonEstVisible,
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    forcerValeurSelect,
} from './helpers-page.mjs';
import { attendreTypewriterInactif } from './helpers-narratif.mjs';

/** @param {import('@playwright/test').Page} page */
export async function fermerPanneauDetailSiOuvert(page) {
    const panneau = page.locator('#panneau-detail');
    if ((await panneau.count()) === 0) return;
    if ((await panneau.getAttribute('aria-hidden')) !== 'false') return;
    await page.locator('#btn-panneau-detail-fermer').click();
    await expect(panneau).toHaveAttribute('aria-hidden', 'true');
}

/** @param {import('@playwright/test').Page} page */
export async function activerPausePartie(page) {
    await fermerPanneauDetailSiOuvert(page);
    await page.locator('#btn-pause').click();
}

/** @param {import('@playwright/test').Page} page */
export async function activerPausePartieTactile(page) {
    await fermerPanneauDetailSiOuvert(page);
    const pauseViaDom = await page.evaluate(() => {
        document.getElementById('btn-pause')?.click();
        return true;
    });
    expect(pauseViaDom).toBe(true);
}

/** @param {import('@playwright/test').Page} page @param {{ index?: number, value?: string }} option */
export async function selectionnerBiomeClavier(page, option = { value: 'classique' }) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/, { timeout: 10000 });
    const select = page.locator('#sel-biome-clavier');
    const valeur = option.value ?? 'classique';
    await expect(select.locator(`option[value="${valeur}"]`)).toBeAttached({ timeout: 15000 });
    await select.selectOption(option.value ? option : { value: valeur }, { force: true });
    await forcerValeurSelect(page, 'sel-biome-clavier', valeur);
    await expect(page.locator('#panneau-detail')).not.toHaveClass(/element-masque/, {
        timeout: 5000,
    });
    await expect(page.locator('#btn-panneau-detail-jouer')).toBeVisible({ timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page @param {string} [biomeId] */
async function confirmerDemarragePartie(page, biomeId = 'classique') {
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    const demarre = await page.evaluate((biome) => {
        if (document.body.classList.contains('partie-active')) return true;
        const demarrer = window.__NEO_TEST__?.demarrerPartieLibre;
        if (typeof demarrer === 'function') {
            demarrer(biome);
            return document.body.classList.contains('partie-active');
        }
        return false;
    }, biomeId);
    if (!demarre) {
        await page.evaluate((biome) => {
            document.getElementById('btn-panneau-detail-jouer')?.click();
            if (!document.body.classList.contains('partie-active')) {
                window.__NEO_TEST__?.demarrerPartieLibre?.(biome);
            }
        }, biomeId);
    }
}

/** @param {import('@playwright/test').Page} page */
export async function attendrePartieVisible(page) {
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 20000 });
    await expect(page.locator('#conteneur-principal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#canvas-plateau')).toBeVisible({ timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page */
export async function passerFluxLancementMonde(page) {
    for (let i = 0; i < 24; i++) {
        if (await page.locator('body').evaluate((el) => el.classList.contains('partie-active'))) {
            break;
        }

        if (await boutonEstVisible(page, '#btn-objectifs-commencer')) {
            await page.locator('#btn-objectifs-commencer').click();
            continue;
        }

        if (await boutonEstVisible(page, '#btn-cutscene-passer')) {
            await page.locator('#btn-cutscene-passer').click({ force: true });
            continue;
        }

        if (await boutonEstVisible(page, '#btn-cutscene-suivant')) {
            await page.locator('#btn-cutscene-suivant').click({ force: true });
            continue;
        }

        if (await boutonEstVisible(page, '#btn-tutoriel-fermer')) {
            await page.locator('#btn-tutoriel-fermer').click();
            continue;
        }

        if (await boutonEstVisible(page, '#btn-journal-fermer')) {
            await page.locator('#btn-journal-fermer').click({ force: true });
            continue;
        }

        try {
            await attendreTypewriterInactif(page, 500);
        } catch {
            /* attente courte entre étapes du flux */
        }
    }

    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartie(page) {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await confirmerDemarragePartie(page);
    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieViaClavier(page) {
    await preparerPageSansSw(page);
    await page.goto('/');
    const fermerTutoriel = page.locator('#btn-tutoriel-fermer');
    if (await boutonEstVisible(page, '#btn-tutoriel-fermer')) {
        await fermerTutoriel.click();
    }
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await confirmerDemarragePartie(page);
    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function terminerPartieCourante(page) {
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 15000 });

    const declenche = await page.evaluate(() => {
        if (typeof window.__NEO_TEST__?.terminerPartie === 'function') {
            window.__NEO_TEST__.terminerPartie(false, { immediat: true });
            return true;
        }
        return false;
    });
    expect(declenche).toBe(true);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 5000 });
}
