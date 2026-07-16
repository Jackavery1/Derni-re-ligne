import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    installerJournalVibrations,
    ouvrirCarteHistoire,
    lancerMondeBossBrasier,
    terminerPartieCourante,
} from './helpers.mjs';

test('audit B — sfx lignes et tetris (G5)', async ({ page }) => {
    await demarrerPartie(page);
    await page.evaluate(() => window.__NEO_TEST__?.viderJournalSfxTest?.());
    await page.evaluate(() => {
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('lignes:effacees', {
            nbSupprimees: 1,
            lignesEffacees: [19],
        });
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('lignes:effacees', {
            nbSupprimees: 4,
            lignesEffacees: [19, 18, 17, 16],
        });
    });
    const sfx = await page.evaluate(() => window.__NEO_TEST__?.obtenirJournalSfxTest?.() ?? []);
    expect(sfx).toContain('ligne_1');
    expect(sfx).toContain('tetris');
});

test('audit B — flash topout declenche a la mort (G5)', async ({ page }) => {
    await demarrerPartie(page);
    await page.evaluate(() => {
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('partie:topout');
    });
    const timer = await page.evaluate(async () => {
        const { flashTopout } = await import('/js/etat/store-jeu.js');
        return flashTopout.timer;
    });
    expect(timer).toBeGreaterThan(0);
});

test('audit B — toast ACCALMIE sur descente de palier (G4/G5)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);
    await page.evaluate(() => {
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('difficulte:vague', {
            montee: false,
            palierApres: 6,
        });
    });
    await expect(page.locator('#notif-niveau')).toContainText(/ACCALMIE\s*[−-]\s*P6/i);
});

test('audit B — toast VITESSE + et sfx niveau sur montee (G4/G5)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);
    await page.evaluate(() => window.__NEO_TEST__?.viderJournalSfxTest?.());
    await page.evaluate(() => {
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('difficulte:vague', {
            montee: true,
            palierApres: 4,
        });
    });
    await expect(page.locator('#notif-niveau')).toContainText(/VITESSE\s*\+\s*P4/i);
    const sfx = await page.evaluate(() => window.__NEO_TEST__?.obtenirJournalSfxTest?.() ?? []);
    expect(sfx).toContain('niveau');
});

test('audit B — sfx accalmie sur descente de palier (G5)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);
    await page.evaluate(() => window.__NEO_TEST__?.viderJournalSfxTest?.());
    await page.evaluate(() => {
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('difficulte:vague', {
            montee: false,
            palierApres: 6,
        });
    });
    const sfx = await page.evaluate(() => window.__NEO_TEST__?.obtenirJournalSfxTest?.() ?? []);
    expect(sfx).toContain('accalmie');
});

test('audit B — haptique attaque boss distincte (G5)', async ({ page }) => {
    test.setTimeout(60000);
    await installerJournalVibrations(page);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    const motif = await page.evaluate(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        const ok = window.__NEO_TEST__?.forcerAttaqueBossTest?.() === true;
        if (!ok) return null;
        return window.__NEO_VIBRATE_LOG__?.[0] ?? null;
    });
    expect(motif).toEqual([45, 35, 70, 35, 50]);
});

test('audit B — sfx et flash attaque boss brasier (G5)', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    const resultat = await page.evaluate(() => {
        window.__NEO_TEST__?.viderJournalSfxTest?.();
        const ok = window.__NEO_TEST__?.forcerAttaqueBossTest?.() === true;
        const flash = window.__NEO_TEST__?.obtenirFlashAttaqueBossTest?.() === true;
        const sfx = window.__NEO_TEST__?.obtenirJournalSfxTest?.() ?? [];
        return { ok, flash, sfx };
    });
    expect(resultat.ok).toBe(true);
    expect(resultat.flash).toBe(true);
    expect(resultat.sfx.some((id) => String(id).startsWith('boss_'))).toBe(true);
});

test('audit B — sfx game over apres defaite', async ({ page }) => {
    await demarrerPartie(page);
    await page.evaluate(() => window.__NEO_TEST__?.viderJournalSfxTest?.());
    await terminerPartieCourante(page);
    const sfx = await page.evaluate(() => window.__NEO_TEST__?.obtenirJournalSfxTest?.() ?? []);
    expect(sfx).toContain('game_over');
});

test('audit B — sfx mort au topout (G5)', async ({ page }) => {
    await demarrerPartie(page);
    await page.evaluate(() => window.__NEO_TEST__?.viderJournalSfxTest?.());
    await page.evaluate(() => {
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('partie:topout');
    });
    const sfx = await page.evaluate(() => window.__NEO_TEST__?.obtenirJournalSfxTest?.() ?? []);
    expect(sfx).toContain('game_over');
});

test('audit B — HUD boss labels lisibles (>= 11px)', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    const tailles = await page.evaluate(() => {
        return ['.boss-nom', '.boss-hp-label', '.boss-attaque-label'].map((sel) => {
            const el = document.querySelector(sel);
            if (!el) return 0;
            return parseFloat(getComputedStyle(el).fontSize) || 0;
        });
    });

    for (const taille of tailles) {
        expect(taille).toBeGreaterThanOrEqual(11);
    }
});

test('audit B — samples sfx boss charges (G5)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const etat = await page.evaluate(async () => {
        return window.__NEO_TEST__?.verifierSamplesBossCharges?.();
    });
    expect(Array.isArray(etat)).toBe(true);
    expect(etat).toHaveLength(6);
    for (const entree of etat) {
        expect(entree.charge).toBe(true);
    }
});
