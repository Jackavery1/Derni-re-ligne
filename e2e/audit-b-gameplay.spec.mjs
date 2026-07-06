import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    selectionnerBiomeClavier,
    attendrePartieVisible,
    ouvrirCarteHistoire,
    fermerInfobulleContexteSiVisible,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_FIN_VRAIE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    installerJournalVibrations,
    preparerSelectionPremiereVisiteModes,
    selectionnerBiomeVerrouilleConstellation,
    selectionnerMondeCarte,
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

test('audit B — haptique en partie via bus lignes effacees', async ({ page }) => {
    await installerJournalVibrations(page);
    await demarrerPartie(page);

    const ok = await page.evaluate(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('lignes:effacees', {
            nbSupprimees: 4,
            lignesEffacees: [19, 18, 17, 16],
        });
        return Array.isArray(window.__NEO_VIBRATE_LOG__) && window.__NEO_VIBRATE_LOG__.length > 0;
    });
    expect(ok).toBe(true);

    const motif = await page.evaluate(() => window.__NEO_VIBRATE_LOG__?.[0] ?? null);
    expect(motif).toEqual([15, 40, 15, 40, 20]);
});

test('audit B — haptique sur mute en partie', async ({ page }) => {
    await installerJournalVibrations(page);
    await demarrerPartie(page);

    const ok = await page.evaluate(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        document.getElementById('btn-mute')?.click();
        return Array.isArray(window.__NEO_VIBRATE_LOG__) && window.__NEO_VIBRATE_LOG__.length > 0;
    });
    expect(ok).toBe(true);
});

test('audit B — haptique sur rafraichir leaderboard', async ({ page }) => {
    await installerJournalVibrations(page);
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);

    const ok = await page.evaluate(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        document.getElementById('btn-rafraichir-leaderboard')?.click();
        return Array.isArray(window.__NEO_VIBRATE_LOG__) && window.__NEO_VIBRATE_LOG__.length > 0;
    });
    expect(ok).toBe(true);
});

test('audit B — animation menu arretee en partie', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);

    await selectionnerBiomeClavier(page);
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    await attendrePartieVisible(page);

    const menuInactif = await page.evaluate(() => window.__NEO_TEST__?.menuAnimActif?.() ?? null);
    expect(menuInactif).toBe(false);
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

test('audit B — constellation biome verrouille oriente vers histoire', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#sel-biome-clavier option[value="eclipse"]')).toBeAttached({
        timeout: 10000,
    });
    await selectionnerBiomeVerrouilleConstellation(page, 'eclipse');
    await expect(page.locator('#panneau-detail-description')).toContainText(/MODE HISTOIRE/i);
    await expect(page.locator('#btn-panneau-detail-secondaire')).toContainText(/MODE HISTOIRE/i);
});

test('audit B — codex chemins caches verrouille avec condition', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    await page.locator('.codex-onglet[data-chapitre="chroniques"]').click();
    await expect(page.locator('.codex-item[data-id="chemins_caches"]')).toBeVisible({
        timeout: 10000,
    });
    const entree = page.locator('.codex-item[data-id="chemins_caches"]');
    await expect(entree).toHaveClass(/verrouille/);
    await expect(entree.locator('.codex-item-cond')).toContainText(/Archiviste/i);
});

test('audit B — carte histoire compteur et modal Trame', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_FIN_VRAIE_PRET);
    await expect(page.locator('#histoire-prog-trame')).toContainText(/TRAME\s+2\/4/i, {
        timeout: 10000,
    });
    await page.locator('#btn-histoire-trame').click();
    await expect(page.locator('#overlay-trame-conditions')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#histoire-trame-detail-liste li')).toHaveCount(4);
    await page.locator('#btn-trame-fermer').click();
    await expect(page.locator('#overlay-trame-conditions')).toHaveClass(/element-masque/);
});

test('audit B — briefing Distorsion sur monde finale', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await selectionnerMondeCarte(page, 'monde_boss_4');
    await expect(page.locator('#btn-histoire-briefing-distorsion')).not.toHaveClass(
        /element-masque/
    );
    await page.locator('#btn-histoire-briefing-distorsion').click({ force: true });
    await expect(page.locator('#overlay-tutoriel')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#tutoriel-titre')).toContainText(/DISTORSION/i);
});

test('audit B — briefing mécanique Archiviste sur carte histoire', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await selectionnerMondeCarte(page, 'monde_boss_3');
    await expect(page.locator('#histoire-detail-avert')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#histoire-detail-avert')).toContainText(/faux fant[oô]me/i);
});

test('audit B — game over histoire avertissement continue Trame', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_FIN_VRAIE_PRET);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    await page.evaluate(() => {
        window.__NEO_TEST__?.simulerGameOverBossDistorsion?.();
    });

    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#go-avertissement-trame')).toContainText(/Continue gratuit/i);
    await expect(page.locator('#btn-continue-boss')).toBeVisible();
});
