import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    passerCutsceneEntiere,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_FIN_SECRETE_PRET,
    ETAT_FIN_VRAIE_PRET,
    ETAT_OCEAN_FRAGMENT_PRET,
    ETAT_CYBER_LABO_PRET,
} from './helpers.mjs';

test('post-monde monde lave — fond scene seuil_brasier', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_lave');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await page.waitForFunction(
        () =>
            document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('cutscene-scene-image'),
        null,
        { timeout: 15000 }
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
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_cyber');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toContainText(/archives s'ouvrent/i, {
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
    await page.locator('#btn-cutscene-passer').click({ force: true });
    await page.waitForFunction(
        () => {
            const fin = document.getElementById('ecran-histoire-fin');
            const cut = document.getElementById('ecran-histoire-cutscene');
            return fin?.classList.contains('actif') || cut?.classList.contains('actif');
        },
        null,
        { timeout: 15000 }
    );
    if (
        await page
            .locator('#ecran-histoire-cutscene')
            .evaluate((el) => el.classList.contains('actif'))
    ) {
        await page.locator('#btn-cutscene-passer').click({ force: true });
    }
    await expect(page.locator('#ecran-histoire-fin')).toHaveClass(/actif/, { timeout: 15000 });
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
    await page.locator('#btn-cutscene-passer').click({ force: true });
    await page.waitForFunction(
        () => {
            const fin = document.getElementById('ecran-histoire-fin');
            const cut = document.getElementById('ecran-histoire-cutscene');
            return fin?.classList.contains('actif') || cut?.classList.contains('actif');
        },
        null,
        { timeout: 15000 }
    );
    if (
        await page
            .locator('#ecran-histoire-cutscene')
            .evaluate((el) => el.classList.contains('actif'))
    ) {
        await page.locator('#btn-cutscene-passer').click({ force: true });
    }
    await expect(page.locator('#ecran-histoire-fin')).toHaveClass(/actif/, { timeout: 15000 });
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_vraie');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/HARMONIE/i);
});
