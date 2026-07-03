import { expect } from '@playwright/test';
import { ETAT_DEBLOCAGE_META_RAPIDE } from './etats-histoire.mjs';

/** @param {import('@playwright/test').Page} page */
export async function installerJournalVibrations(page) {
    await page.addInitScript(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        Object.defineProperty(navigator, 'vibrate', {
            configurable: true,
            value: (pattern) => {
                window.__NEO_VIBRATE_LOG__.push(pattern);
                return true;
            },
        });
        localStorage.setItem('derniereLigne_haptique', 'true');
    });
}

/** @param {import('@playwright/test').Page} page @param {object} [etat] */
export async function preparerSelectionPremiereVisiteModes(
    page,
    etat = ETAT_DEBLOCAGE_META_RAPIDE
) {
    await installerJournalVibrations(page);
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript((e) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        window.__NEO_SUPPRESS_MODE_INFOBULLE_AUTO__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_tutorielOracleVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.removeItem('derniereLigne_infobullesModesJeu');
        localStorage.removeItem('derniereLigne_infobulleOracleCoop');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(e));
        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistrations().then((regs) => {
                for (const reg of regs) void reg.unregister();
            });
        }
    }, etat);
}

/** @param {import('@playwright/test').Page} page @param {string} biomeId */
export async function selectionnerBiomeVerrouilleConstellation(page, biomeId) {
    await page.evaluate((id) => {
        const select = document.getElementById('sel-biome-clavier');
        if (!select) return;
        for (const opt of select.options) {
            if (opt.value === id) {
                opt.disabled = false;
                select.value = id;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }, biomeId);
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
export async function selectionnerMondeCarte(page, mondeId) {
    await expect(page.locator(`#histoire-monde-clavier option[value="${mondeId}"]`)).toBeAttached({
        timeout: 15000,
    });
    await page.evaluate((id) => {
        const select = document.getElementById('histoire-monde-clavier');
        if (!select) return;
        for (const opt of select.options) {
            if (opt.value === id) {
                opt.disabled = false;
                select.value = id;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }, mondeId);
}

/** @param {import('@playwright/test').Page} page */
export async function attendreBarreModesPretes(page) {
    await expect(page.locator('#sel-barre-modes')).not.toHaveClass(/element-masque/, {
        timeout: 10000,
    });
    await expect(page.locator('#toggle-sprint')).toBeVisible();
}

/** @param {import('@playwright/test').Page} page @param {string} modeId */
export async function reinitialiserInfobulleMode(page, modeId) {
    await page.evaluate((id) => {
        try {
            const raw = localStorage.getItem('derniereLigne_infobullesModesJeu');
            const vu = raw ? JSON.parse(raw) : {};
            delete vu[id];
            localStorage.setItem('derniereLigne_infobullesModesJeu', JSON.stringify(vu));
        } catch {
            /* ignore */
        }
    }, modeId);
}

/** @param {import('@playwright/test').Page} page @param {string} titrePartiel */
export async function attendreInfobulleMode(page, titrePartiel) {
    const overlay = page.locator('#overlay-infobulle-contexte');
    await expect(overlay).not.toHaveClass(/element-masque/, { timeout: 10000 });
    await expect(page.locator('#infobulle-contexte-titre')).toContainText(titrePartiel, {
        ignoreCase: true,
    });
    await page.evaluate(() => {
        document.getElementById('overlay-infobulle-contexte')?.classList.add('element-masque');
    });
    await expect(overlay).toHaveClass(/element-masque/);
}

/** @param {import('@playwright/test').Page} page */
export async function basculerDefiJourDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerDefiJour } = await import('/js/mode-defi-jour.js');
        basculerDefiJour();
    });
}

/** @param {import('@playwright/test').Page} page */
export async function basculerSprintDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerModeSprint } = await import('/js/mode-sprint.js');
        basculerModeSprint();
    });
}

/** @param {import('@playwright/test').Page} page */
export async function basculerOracleDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerOracle } = await import('/js/oracle-jeu.js');
        basculerOracle();
    });
}

/** @param {import('@playwright/test').Page} page */
export async function basculerCoopDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerModeCoop } = await import('/js/coop-jeu.js');
        basculerModeCoop();
    });
}
