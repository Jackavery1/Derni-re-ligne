import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    preparerPageModeLibreTutorielActif,
    preparerPageTutorielHistoireActif,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    demarrerPartie,
    selectionnerBiomeClavier,
    attendrePartieVisible,
    lancerMondeDepuisCarte,
    ETAT_FIN_VRAIE_PRET,
    terminerPartieCourante,
} from './helpers.mjs';

test('audit B — coyote time preserve lock delay apres quitte sol', async ({ page }) => {
    await demarrerPartie(page);
    const coyoteOk = await page.evaluate(() => {
        const api = window.__NEO_TEST__;
        if (!api?.forcerAreTest || !api.tickGameFeel) return false;
        api.forcerAreTest();
        while (api.areActiveTest?.()) api.tickGameFeel(200);
        if (!api.pieceControlesActifsTest?.()) return false;
        api.activerPieceAuSolTest?.();
        api.quitterSolPieceTest?.();
        return api.coyoteActifTest?.() === true;
    });
    expect(coyoteOk).toBe(true);
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

test('audit B — game over histoire avertissement continue Trame', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_FIN_VRAIE_PRET);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerGameOverBossDistorsion?.();
    });

    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#go-avertissement-trame')).toContainText(/Continue gratuit/i);
    await expect(page.locator('#btn-continue-boss')).toBeVisible();
});

test('audit B — tutoriel libre avant premiere partie (G3)', async ({ page }) => {
    await preparerPageModeLibreTutorielActif(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.locator('#btn-panneau-detail-jouer').click({ force: true });

    await expect(page.locator('#overlay-tutoriel')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#tutoriel-titre')).toContainText(/MODE LIBRE/i);
    await expect(page.locator('#tutoriel-indicateur')).toContainText('1 / 3');

    await page.locator('#btn-tutoriel-fermer').click();
    await expect(page.locator('#tutoriel-indicateur')).toContainText('2 / 3');
    await page.locator('#btn-tutoriel-fermer').click();
    await expect(page.locator('#tutoriel-indicateur')).toContainText('3 / 3');
    await page.locator('#btn-tutoriel-fermer').click();

    await attendrePartieVisible(page);
    await expect(page.locator('#overlay-tutoriel')).toHaveClass(/element-masque/);
});

test('audit B — tutoriel histoire prologue 3 slides (G3)', async ({ page }) => {
    test.setTimeout(90000);
    await preparerPageTutorielHistoireActif(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-continuer').click();
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 20000 });
    await lancerMondeDepuisCarte(page, 'monde_prologue');

    for (let i = 0; i < 48; i++) {
        const etat = await page.evaluate(() => {
            const tut = document.getElementById('overlay-tutoriel');
            if (tut && !tut.classList.contains('element-masque')) return 'tutoriel';
            const passer = document.getElementById('btn-cutscene-passer');
            if (passer?.offsetParent) {
                passer.click();
                return 'passer';
            }
            const suivant = document.getElementById('btn-cutscene-suivant');
            if (suivant?.offsetParent) {
                suivant.click();
                return 'suivant';
            }
            return 'wait';
        });
        if (etat === 'tutoriel') break;
        await page.waitForTimeout(80);
    }

    await expect(page.locator('#overlay-tutoriel')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#tutoriel-titre')).toContainText(/BIENVENUE/i);
    await expect(page.locator('#tutoriel-indicateur')).toContainText('1 / 3');

    await page.locator('#btn-tutoriel-fermer').click();
    await expect(page.locator('#tutoriel-indicateur')).toContainText('2 / 3');
    await page.locator('#btn-tutoriel-fermer').click();
    await expect(page.locator('#tutoriel-indicateur')).toContainText('3 / 3');
    await page.locator('#btn-tutoriel-fermer').click();

    await expect(page.locator('#overlay-tutoriel')).toHaveClass(/element-masque/);
});

test('audit B — frames avant premier obstacle vivant >= 120 (G3)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        return window.__NEO_TEST__?.evaluerDelaisPremiersObstaclesVivants?.();
    });

    expect(resultat).not.toBeNull();
    expect(resultat.tousAuDessusSeuil).toBe(true);
    expect(resultat.minimum?.frames60).toBeGreaterThanOrEqual(120);
    for (const entree of resultat.biomes) {
        expect(entree.frames60).toBeGreaterThanOrEqual(120);
    }
});

test('audit B — pause recommencer sans dialog (G6)', async ({ page }) => {
    await demarrerPartie(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    await page.locator('#btn-recommencer').click();
    await expect(page.locator('#dialog-recommencer-partie')).toHaveClass(/element-masque/);
    await expect(page.locator('body')).toHaveClass(/partie-active/);
    await expect(page.locator('#ecran-pause')).not.toHaveClass(/actif/);
});

test('audit B — game over rejouer sans dialog recommencer (G6)', async ({ page }) => {
    await demarrerPartie(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#dialog-recommencer-partie')).toHaveClass(/element-masque/);
    await page.locator('#btn-rejouer').click();
    await expect(page.locator('#ecran-game-over')).not.toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('body')).toHaveClass(/partie-active/);
});
