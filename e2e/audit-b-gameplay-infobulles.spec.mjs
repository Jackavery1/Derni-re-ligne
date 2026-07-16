import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    preparerSelectionPremiereVisiteModes,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    attendrePartieVisible,
    selectionnerBiomeClavier,
    fermerInfobulleContexteSiVisible,
    ETAT_DEBLOCAGE_META_RAPIDE,
    attendreBarreModesPretes,
    reinitialiserInfobulleMode,
    attendreInfobulleMode,
    basculerDefiJourDepuisSelection,
    basculerSprintDepuisSelection,
    basculerOracleDepuisSelection,
    basculerCoopDepuisSelection,
} from './helpers.mjs';

async function ouvrirSelectionModes(page, etat = ETAT_DEBLOCAGE_META_RAPIDE) {
    await preparerSelectionPremiereVisiteModes(page, etat);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.evaluate(() => {
        window.__NEO_SILENT_NOTIFS__ = false;
    });
    await page.locator('#btn-jouer').click();
    await selectionnerBiomeClavier(page);
    await attendreBarreModesPretes(page);
    await fermerInfobulleContexteSiVisible(page);
}

test('audit B — infobulle grace spawn premiere partie (G3)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.addInitScript(() => {
        window.__NEO_SILENT_NOTIFS__ = false;
        localStorage.removeItem('derniereLigne_infobulleGraceSpawn');
    });
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    await attendrePartieVisible(page);

    await expect(page.locator('#overlay-infobulle-contexte')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#infobulle-contexte-titre')).toContainText(/RESPIRATION/i);
    await expect(page.locator('#infobulle-contexte-texte')).toContainText(/premiere piece/i);
});

test('audit B — infobulles modes sprint et sans fin', async ({ page }) => {
    await ouvrirSelectionModes(page);
    await reinitialiserInfobulleMode(page, 'sprint');
    await reinitialiserInfobulleMode(page, 'sansFin');

    await basculerSprintDepuisSelection(page);
    await attendreInfobulleMode(page, 'SPRINT');

    await reinitialiserInfobulleMode(page, 'sansFin');
    await basculerSprintDepuisSelection(page);
    await attendreInfobulleMode(page, 'SANS FIN');
});

test('audit B — infobulles oracle et coop', async ({ page }) => {
    await ouvrirSelectionModes(page);

    await reinitialiserInfobulleMode(page, 'oracle');
    await basculerOracleDepuisSelection(page);
    await attendreInfobulleMode(page, 'ORACLE');

    await basculerOracleDepuisSelection(page);
    await reinitialiserInfobulleMode(page, 'coop');
    await basculerCoopDepuisSelection(page);
    await attendreInfobulleMode(page, 'COOP');
});

test('audit B — infobulle defi du jour', async ({ page }) => {
    await preparerSelectionPremiereVisiteModes(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.evaluate(() => {
        window.__NEO_SILENT_NOTIFS__ = false;
    });
    await page.locator('#btn-jouer').click();
    await selectionnerBiomeClavier(page);
    await fermerInfobulleContexteSiVisible(page);

    await expect(page.locator('#toggle-defi-jour-wrap')).not.toHaveClass(/element-masque/);
    await basculerDefiJourDepuisSelection(page);
    await attendreInfobulleMode(page, 'DEFI');
});
