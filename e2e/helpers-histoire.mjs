/** Helpers E2E — carte histoire, cutscenes et recap post-monde. */
import { expect } from '@playwright/test';
import { ETAT_HISTOIRE_BOSS_BRASIER } from './etats-histoire.mjs';
import {
    boutonEstVisible,
    elementAClasse,
    preparerPremierLancement,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
} from './helpers-page.mjs';
import { attendreTypewriterInactif } from './helpers-narratif.mjs';
import { passerFluxLancementMonde } from './helpers-partie.mjs';

/** Lance l'intro Jour 2 554 depuis l'écran titre (première visite). */
export async function ouvrirIntroHistoire(page) {
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-nouvelle-partie').click();
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 20000,
    });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreRenduCarteHistoire(page) {
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const canvas = document.getElementById('canvas-histoire-map');
                    if (!(canvas instanceof HTMLCanvasElement)) return false;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return false;
                    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] > 0) return true;
                    }
                    return false;
                }),
            { timeout: 5000, intervals: [80, 150, 250] }
        )
        .toBe(true);
}

/** @param {import('@playwright/test').Page} page */
export async function fermerRecapPostMonde(page) {
    await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });
    await page.locator('#btn-recap-continuer').click({ force: true });
}

/** @param {import('@playwright/test').Page} page @param {object} [etatHistoire] */
export async function ouvrirCarteHistoire(page, etatHistoire = ETAT_HISTOIRE_BOSS_BRASIER) {
    await page.addInitScript((etat) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_tutorielLibreVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_tutorielOracleVu', '1');
        localStorage.setItem('derniereLigne_tutorielDistorsionVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem('derniereLigne_infobulleOracleCoop', '1');
    }, etatHistoire);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    const continuer = page.locator('#btn-continuer');
    if (await boutonEstVisible(page, '#btn-continuer')) {
        await continuer.click();
    } else {
        await page.locator('#btn-nouvelle-partie').click();
    }
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/);
    await expect(page.locator('#histoire-prog-mondes')).toContainText(/\d+\/\d+\s+MONDES/i, {
        timeout: 15000,
    });
}

/** @param {import('@playwright/test').Page} page */
export async function lancerMondeBossBrasier(page) {
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();
    await expect(page.locator('#boss-nom-affiche')).not.toHaveText('BOSS');
}

/** @param {import('@playwright/test').Page} page */
export async function passerCutsceneHistoire(page) {
    for (let i = 0; i < 40; i++) {
        if (await elementAClasse(page, 'ecran-histoire-map', 'actif')) {
            return;
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

        try {
            await attendreTypewriterInactif(page, 400);
        } catch {
            /* typewriter ou cutscene inactive */
        }
    }

    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 20000 });
}
