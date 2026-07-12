import { expect } from '@playwright/test';
import { ETAT_DEBLOCAGE_META_RAPIDE } from './etats-histoire.mjs';
import { preparerPageSansSw, forcerValeurSelect } from './helpers-page.mjs';
import { fermerPanneauDetailSiOuvert } from './helpers-partie.mjs';

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
    await preparerPageSansSw(page, etat);
    await page.addInitScript(() => {
        window.__NEO_SUPPRESS_MODE_INFOBULLE_AUTO__ = true;
        localStorage.removeItem('derniereLigne_infobullesModesJeu');
        localStorage.removeItem('derniereLigne_infobulleOracleCoop');
    });
}

/** @param {import('@playwright/test').Page} page @param {string} biomeId */
export async function selectionnerBiomeVerrouilleConstellation(page, biomeId) {
    await forcerValeurSelect(page, 'sel-biome-clavier', biomeId);
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
export async function selectionnerMondeCarte(page, mondeId) {
    await expect(page.locator(`#histoire-monde-clavier option[value="${mondeId}"]`)).toBeAttached({
        timeout: 15000,
    });
    await forcerValeurSelect(page, 'histoire-monde-clavier', mondeId);
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
            /* JSON localStorage invalide */
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
async function assurerSelectionPrete(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await fermerPanneauDetailSiOuvert(page);
}

/** @param {import('@playwright/test').Page} page @param {string} toggleId */
async function cliquerToggleSelection(page, toggleId) {
    await assurerSelectionPrete(page);
    await page.evaluate((id) => document.getElementById(id)?.click(), toggleId);
}

/** @param {import('@playwright/test').Page} page */
export async function basculerDefiJourDepuisSelection(page) {
    await cliquerToggleSelection(page, 'toggle-defi-jour');
}

/** @param {import('@playwright/test').Page} page */
export async function basculerSprintDepuisSelection(page) {
    await cliquerToggleSelection(page, 'toggle-sprint');
}

/** @param {import('@playwright/test').Page} page */
export async function basculerOracleDepuisSelection(page) {
    await cliquerToggleSelection(page, 'toggle-oracle');
}

/** @param {import('@playwright/test').Page} page */
export async function basculerCoopDepuisSelection(page) {
    await assurerSelectionPrete(page);
    await page.evaluate(() => document.getElementById('toggle-coop')?.click());
    await expect(page.locator('#toggle-coop')).toHaveClass(/actif/);
}
