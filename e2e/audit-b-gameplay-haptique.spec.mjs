import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    installerJournalVibrations,
    ETAT_DEBLOCAGE_META_RAPIDE,
} from './helpers.mjs';

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
