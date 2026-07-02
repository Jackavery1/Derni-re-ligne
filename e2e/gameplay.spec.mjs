import { test, expect } from '@playwright/test';
import {
    demarrerPartie,
    terminerPartieCourante,
    preparerPageSansSw,
    preparerPremierLancement,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    selectionnerBiomeClavier,
    attendrePartieVisible,
    passerCutsceneHistoire,
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_DEBLOCAGE_COMPLET,
} from './helpers.mjs';

test('réserve hold accepte une pièce via clavier', async ({ page }) => {
    await demarrerPartie(page);
    await page.locator('#canvas-plateau').focus();
    await page.keyboard.press('c');
    await expect
        .poll(async () => {
            return page.evaluate(() => {
                const canvas = document.getElementById('canvas-reserve');
                if (!(canvas instanceof HTMLCanvasElement)) return false;
                const ctx = canvas.getContext('2d');
                if (!ctx) return false;
                const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] > 0) return true;
                }
                return false;
            });
        })
        .toBe(true);
    const reserveRemplie = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-reserve');
        if (!(canvas instanceof HTMLCanvasElement)) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return true;
        }
        return false;
    });
    expect(reserveRemplie).toBe(true);
});

test('game over affiche l écran de fin', async ({ page }) => {
    await demarrerPartie(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/);
});

test('modes verrouillés masqués au premier lancement', async ({ page }) => {
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#btn-jouer')).toBeHidden();
    await expect(page.locator('#btn-codex')).toBeHidden();
    await expect(page.locator('#menu-bloc-libre')).toBeHidden();
    await expect(page.locator('#menu-bloc-collection')).toBeHidden();
});

test('premier lancement — nouvelle partie mène à la carte histoire', async ({ page }) => {
    test.setTimeout(60000);
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);

    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
    await expect(page.locator('#btn-continuer')).toBeHidden();

    await page.locator('#btn-nouvelle-partie').click();
    await passerCutsceneHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
});

test('mode libre débloqué après progression histoire', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#btn-jouer')).toBeEnabled();
    await expect(page.locator('#btn-jouer')).not.toHaveClass(/btn-verrouille/);
});

test('biome verrouillé — teaser histoire sur petit écran', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);

    await page.evaluate(() => {
        const select = document.getElementById('sel-biome-clavier');
        const opt = select?.querySelector('option[value="cyber"]');
        if (select && opt) {
            opt.disabled = false;
            select.value = 'cyber';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    await expect(page.locator('#panneau-detail')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#panneau-detail-titre')).toContainText(/CYBER/i);
    await expect(page.locator('#panneau-detail-description')).toContainText(/mode histoire/i);
    await expect(page.locator('#btn-panneau-detail-secondaire')).toBeVisible();
    await expect(page.locator('#btn-panneau-detail-secondaire')).toContainText(/MODE HISTOIRE/i);
});

test('sprint 40L termine en victoire', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.evaluate(() => {
        document.getElementById('toggle-sprint')?.click();
    });
    await expect(page.locator('#sprint-toggle-label')).toHaveText(/ON/);
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    await attendrePartieVisible(page);

    const victoire = await page.evaluate(() => {
        if (typeof window.__NEO_TEST__?.simulerVictoireSprint !== 'function') return false;
        window.__NEO_TEST__.simulerVictoireSprint();
        return true;
    });
    expect(victoire).toBe(true);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 5000 });
    await expect(page.locator('#ecran-game-over .go-titre').first()).toHaveText('VICTOIRE !');
});

test('mascotte ROBO dessine pendant une partie', async ({ page }) => {
    await demarrerPartie(page);
    await expect
        .poll(async () => {
            return page.evaluate(() => {
                const canvas = document.getElementById('canvas-mascotte');
                if (!(canvas instanceof HTMLCanvasElement)) return false;
                const ctx = canvas.getContext('2d');
                if (!ctx) return false;
                const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] > 0) return true;
                }
                return false;
            });
        })
        .toBe(true);
    const dessine = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-mascotte');
        if (!(canvas instanceof HTMLCanvasElement)) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return true;
        }
        return false;
    });
    expect(dessine).toBe(true);
});

test('codex — icone pixel visible sur une entree debloquee', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);

    const iconeDessinee = await page.evaluate(() => {
        const canvas = document.querySelector('#ecran-codex canvas');
        if (!(canvas instanceof HTMLCanvasElement)) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return true;
        }
        return false;
    });
    expect(iconeDessinee).toBe(true);
});

test('boucle menu unifiee inactive hors ecran selection', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);

    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);

    const optionsInactif = await page.evaluate(
        () => window.__NEO_TEST__?.boucleMenuUnifieActive?.() ?? null
    );
    expect(optionsInactif).toBe(false);

    await page.locator('#btn-options-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);

    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);

    const selectionActive = await page.evaluate(
        () => window.__NEO_TEST__?.boucleMenuUnifieActive?.() ?? null
    );
    expect(selectionActive).toBe(true);

    await page.locator('#btn-selection-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);

    const retourInactif = await page.evaluate(
        () => window.__NEO_TEST__?.boucleMenuUnifieActive?.() ?? null
    );
    expect(retourInactif).toBe(false);
});
