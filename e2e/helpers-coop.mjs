/** Helpers E2E — flux coop 2 joueurs. */
import { expect } from '@playwright/test';
import { ETAT_DEBLOCAGE_META_RAPIDE } from './etats-histoire.mjs';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    fermerInfobulleContexteSiVisible,
} from './helpers-page.mjs';
import { basculerCoopDepuisSelection } from './helpers-audit-b.mjs';
import { fermerPanneauDetailSiOuvert, selectionnerBiomeClavier } from './helpers-partie.mjs';

/** @param {import('@playwright/test').Page} page */
export async function activerPauseCoopTactile(page) {
    const viaTest = await page.evaluate(async () => {
        if (typeof window.__NEO_TEST__?.basculerPauseCoop === 'function') {
            await window.__NEO_TEST__.basculerPauseCoop();
            return true;
        }
        return false;
    });
    if (!viaTest) {
        const clique = await page.evaluate(() => {
            for (const id of ['btn-pause-coop-mobile', 'btn-pause-coop']) {
                const btn = document.getElementById(id);
                if (btn && getComputedStyle(btn).display !== 'none') {
                    btn.click();
                    return true;
                }
            }
            return false;
        });
        if (!clique) await page.keyboard.press('KeyP');
    }
    await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/, { timeout: 10000 });
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await fermerInfobulleContexteSiVisible(page);
    await fermerPanneauDetailSiOuvert(page);
    await basculerCoopDepuisSelection(page);
    await expect(page.locator('#coop-toggle-label')).toHaveText('COOP : ON');
    await expect(page.locator('#conteneur-principal-coop')).toBeAttached({ timeout: 10000 });
    await selectionnerBiomeClavier(page);
    await page.evaluate(() => document.getElementById('btn-panneau-detail-jouer')?.click());
    await expect(page.locator('body')).toHaveClass(/coop-active/, { timeout: 15000 });
    await expect(page.locator('#conteneur-principal-coop')).toBeVisible({ timeout: 10000 });
}

/** @param {import('@playwright/test').Page} page */
export async function terminerPartieCoopCourante(page) {
    await expect(page.locator('body')).toHaveClass(/coop-active/, { timeout: 15000 });
    const declenche = await page.evaluate(async () => {
        if (typeof window.__NEO_TEST__?.terminerPartieCoop === 'function') {
            await window.__NEO_TEST__.terminerPartieCoop();
            return true;
        }
        return false;
    });
    expect(declenche).toBe(true);
    await expect(page.locator('#ecran-game-over-coop')).toHaveClass(/actif/, { timeout: 5000 });
}
