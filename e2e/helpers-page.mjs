/** Helpers E2E — préparation page et attente du bootstrap applicatif. */
import { expect } from '@playwright/test';
import { ETAT_DEBLOCAGE_MONDE_LIBRE } from './etats-histoire.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

/** @param {import('@playwright/test').Page} page @param {string} selector */
export async function boutonEstVisible(page, selector) {
    const loc = page.locator(selector);
    if ((await loc.count()) === 0) return false;
    return loc.isVisible();
}

/** @param {import('@playwright/test').Page} page @param {string} elementId @param {string} className */
export async function elementAClasse(page, elementId, className) {
    return page.evaluate(
        ([id, cls]) => document.getElementById(id)?.classList.contains(cls) === true,
        [elementId, className]
    );
}

/** État vierge : aucun déblocage, comme un premier lancement. */
export async function preparerPremierLancement(page) {
    await page.addInitScript(() => {
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.removeItem('derniereLigne_histoire');
        localStorage.removeItem('derniereLigne_introHistoireVue');
        localStorage.removeItem('derniereLigne_tutorielVu');
        localStorage.removeItem('derniereLigne_tutorielHistoireVu');
        localStorage.removeItem('derniereLigne_tutorielLibreVu');
        localStorage.removeItem('derniereLigne_tutorielCoopVu');
        localStorage.removeItem('derniereLigne_tutorielArchitecteVu');
        localStorage.removeItem('derniereLigne_tutorielOracleVu');
        localStorage.removeItem('derniereLigne_tutorielDistorsionVu');
    });
}

/** Désactive le cache stale en tests locaux et débloque le mode libre. */
export async function preparerPageSansSw(page, etatHistoire = ETAT_DEBLOCAGE_MONDE_LIBRE) {
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript((etat) => {
        window.__NEO_SILENT_NOTIFS__ = true;
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
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistrations().then((regs) => {
                for (const reg of regs) void reg.unregister();
            });
        }
    }, etatHistoire);
}

/** Mode libre débloqué, tutoriel libre non vu (première partie constellation). */
export async function preparerPageModeLibreTutorielActif(
    page,
    etatHistoire = ETAT_DEBLOCAGE_MONDE_LIBRE
) {
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript((etat) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.removeItem('derniereLigne_tutorielLibreVu');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_tutorielOracleVu', '1');
        localStorage.setItem('derniereLigne_tutorielDistorsionVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem('derniereLigne_infobulleOracleCoop', '1');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistrations().then((regs) => {
                for (const reg of regs) void reg.unregister();
            });
        }
    }, etatHistoire);
}

/** Histoire ouverte, tutoriel prologue non vu (après cutscene d’entrée). */
export async function preparerPageTutorielHistoireActif(page, etatHistoire = ETAT_HISTOIRE_VIDE) {
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript((etat) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.removeItem('derniereLigne_tutorielHistoireVu');
        localStorage.setItem('derniereLigne_tutorielLibreVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_tutorielOracleVu', '1');
        localStorage.setItem('derniereLigne_tutorielDistorsionVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem('derniereLigne_infobulleOracleCoop', '1');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistrations().then((regs) => {
                for (const reg of regs) void reg.unregister();
            });
        }
    }, etatHistoire);
}

/** @param {import('@playwright/test').Page} page */
export async function attendreApplicationPrete(page) {
    await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
        timeout: 30000,
    });
    await expect(page.locator('#ecran-chargement')).not.toHaveClass(/actif/, { timeout: 15000 });
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/, { timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreNotificationsInitiales(page) {
    for (const sel of ['#notif-achievement', '#notif-niveau', '#notif-codex']) {
        if (await boutonEstVisible(page, sel)) {
            await expect(page.locator(sel)).not.toHaveClass(/visible/, { timeout: 20000 });
        }
    }
}

/** @param {import('@playwright/test').Page} page @param {string} idSelect @param {string} valeur */
export async function forcerValeurSelect(page, idSelect, valeur) {
    await page.evaluate(
        ([id, val]) => {
            const select = document.getElementById(id);
            if (!select) return;
            for (const opt of select.options) {
                if (opt.value === val) {
                    opt.disabled = false;
                    select.value = val;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        },
        [idSelect, valeur]
    );
}

/** @param {import('@playwright/test').Page} page */
export async function fermerInfobulleContexteSiVisible(page) {
    const overlay = page.locator('#overlay-infobulle-contexte');
    if (await boutonEstVisible(page, '#overlay-infobulle-contexte')) {
        await page.locator('#btn-infobulle-contexte-fermer').click({ force: true });
        await expect(overlay).toHaveClass(/element-masque/, { timeout: 5000 });
    }
    await page.evaluate(() => {
        document.getElementById('overlay-infobulle-contexte')?.classList.add('element-masque');
    });
}
