import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    passerCutsceneEntiere,
    terminerCutscenesVersEcranFin,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_FIN_SECRETE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_FIN_VRAIE_PRET,
    ETAT_OCEAN_FRAGMENT_PRET,
    ETAT_CYBER_LABO_PRET,
} from './helpers.mjs';

test('post-monde monde lave — fond scene seuil_brasier', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_lave');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });
    await page.waitForFunction(
        () =>
            document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('cutscene-scene-image'),
        null,
        { timeout: 30000 }
    );
});

test('fragment VERA ocean — signal parasite visible', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_OCEAN_FRAGMENT_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_ocean');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await page.waitForFunction(
        () => {
            const t =
                document.getElementById('texte-dialogue-cutscene')?.textContent ??
                document.getElementById('texte-narration-cutscene')?.textContent ??
                '';
            return /SIGNAL PARASITE/i.test(t);
        },
        null,
        { timeout: 15000 }
    );
});

test('interlude rouille — gardiens detectes', async ({ page }) => {
    test.setTimeout(60000);
    const etat = {
        ...ETAT_HISTOIRE_BOSS_BRASIER,
        fragmentsVusIds: ['apres_rouille'],
        interludesVusIds: [],
    };
    await ouvrirCarteHistoire(page, etat);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_rouille');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await page.waitForFunction(
        () => {
            const t =
                document.getElementById('texte-dialogue-cutscene')?.textContent ??
                document.getElementById('texte-narration-cutscene')?.textContent ??
                '';
            return /GARDIEN/i.test(t);
        },
        null,
        { timeout: 15000 }
    );
});

test('decouverte labo cyber — journal VERA', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_CYBER_LABO_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_cyber', 99);
    });
    await fermerRecapPostMonde(page);

    for (let tentative = 0; tentative < 24; tentative++) {
        const etat = await page.evaluate(() => {
            const brut = localStorage.getItem('derniereLigne_histoire');
            const sauve = brut ? JSON.parse(brut) : {};
            return {
                laboDecouvert: sauve.laboDecouvert === true,
                journal7: sauve.journauxTrouves?.includes('journal_7') === true,
            };
        });
        if (etat.laboDecouvert && etat.journal7) break;

        const cutsceneActive = await page
            .locator('#ecran-histoire-cutscene')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (cutsceneActive) {
            await page.evaluate(() => {
                document.getElementById('btn-cutscene-passer')?.click();
            });
            continue;
        }

        const journalActif = await page
            .locator('#ecran-histoire-journal')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (journalActif) {
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }

        await page.waitForTimeout(250);
    }

    const final = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        return {
            laboDecouvert: sauve.laboDecouvert === true,
            journal7: sauve.journauxTrouves?.includes('journal_7') === true,
        };
    });
    expect(final.laboDecouvert).toBe(true);
    expect(final.journal7).toBe(true);
});

test('fin secrete — victoire finale detecte fin_secrete', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_finale', 99);
    });
    await fermerRecapPostMonde(page);

    const typeFin = await page.evaluate(async () => {
        return window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
    });
    expect(typeFin).toBe('fin_secrete');

    const mondesCompletes = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        if (!brut) return [];
        return JSON.parse(brut).mondesCompletes ?? [];
    });
    expect(mondesCompletes).toContain('monde_finale');
    expect(mondesCompletes).toContain('monde_trame');

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });
});

test('fin secrete — outro et ecran de fin', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_FIN_SECRETE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_secrete');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/LIGNE PARFAITE/i);
});

test('fin vraie — outro harmonie et ecran de fin', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_FIN_VRAIE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_vraie');
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_vraie');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/HARMONIE/i);
});
