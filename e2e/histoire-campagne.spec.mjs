import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, fermerRecapPostMonde } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

const ETAT_PROLOGUE_PRET = {
    ...ETAT_HISTOIRE_VIDE,
    mondesDejaMontres: ['monde_prologue'],
};

/** @param {import('@playwright/test').Page} page @param {number} [max] */
async function avancerFluxPostVictoire(page, max = 60) {
    for (let i = 0; i < max; i++) {
        const etat = await page.evaluate(() => ({
            recapVisible: document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible'),
            cutscene: document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('actif'),
            journal: document.getElementById('ecran-histoire-journal')?.classList.contains('actif'),
            objectifs: document
                .getElementById('overlay-objectifs-pre')
                ?.classList.contains('objectif-overlay-visible'),
            gameOver: document.getElementById('ecran-game-over')?.classList.contains('actif'),
            notif: document.getElementById('notif-niveau')?.textContent ?? '',
            mondeNom: document.getElementById('objectif-monde-nom')?.textContent ?? '',
            carteVisible: !document
                .getElementById('btn-histoire-carte')
                ?.classList.contains('element-masque'),
            dialogue:
                document.getElementById('texte-dialogue-cutscene')?.textContent ??
                document.getElementById('texte-narration-cutscene')?.textContent ??
                '',
        }));

        if (etat.gameOver && etat.carteVisible) return 'game_over_carte';
        if (etat.objectifs && /INFERNO/i.test(etat.mondeNom)) return 'monde_lave';
        if (/INFERNO/i.test(etat.notif)) return 'transition';
        if (etat.cutscene && /feu|INFERNO/i.test(etat.dialogue)) return 'cutscene_lave';

        if (etat.recapVisible) {
            await page.locator('#btn-recap-continuer').click({ force: true });
            continue;
        }
        if (etat.journal) {
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }
        if (etat.cutscene) {
            await page.evaluate(() => {
                document.getElementById('btn-cutscene-passer')?.click();
            });
            continue;
        }
        await page.waitForTimeout(250);
    }
    return 'timeout';
}

test('campagne — victoire prologue enchaine vers inferno sans retour carte', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);

    const resultat = await avancerFluxPostVictoire(page);
    expect(['monde_lave', 'transition', 'cutscene_lave']).toContain(resultat);

    if (resultat === 'transition') {
        await expect(page.locator('#notif-niveau')).toContainText(/MONDE SUIVANT/i);
    }

    await expect(page.locator('#ecran-histoire-map')).not.toHaveClass(/actif/);
    await expect(page.locator('#btn-histoire-carte')).toHaveClass(/element-masque/);

    await page.waitForFunction(
        () => {
            const canvas = document.getElementById('canvas-portrait-gauche');
            if (!(canvas instanceof HTMLCanvasElement)) return false;
            if (canvas.classList.contains('absent')) return false;
            const ctx = canvas.getContext('2d');
            if (!ctx) return false;
            const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0) return true;
            }
            return false;
        },
        null,
        { timeout: 25000 }
    );
});

test('campagne — enchainement desactive affiche le bouton carte', async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
        localStorage.setItem('derniereLigne_enchainementCampagne', 'false');
    });
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);
    const resultat = await avancerFluxPostVictoire(page, 25);
    expect(resultat).toBe('game_over_carte');

    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/);
    await expect(page.locator('#btn-histoire-carte')).toContainText(/CARTE/i);
    await expect(page.locator('#btn-histoire-carte')).not.toHaveClass(/element-masque/);
});

test('campagne — completion prologue persistee', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);

    const mondesCompletes = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        if (!brut) return [];
        return JSON.parse(brut).mondesCompletes ?? [];
    });
    expect(mondesCompletes).toContain('monde_prologue');
});

test('campagne — enchaine prologue puis inferno sans carte', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);
    await avancerFluxPostVictoire(page);

    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_lave', 99);
    });
    await fermerRecapPostMonde(page);

    const mondesCompletes = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        if (!brut) return [];
        return JSON.parse(brut).mondesCompletes ?? [];
    });
    expect(mondesCompletes).toContain('monde_prologue');
    expect(mondesCompletes).toContain('monde_lave');
});
