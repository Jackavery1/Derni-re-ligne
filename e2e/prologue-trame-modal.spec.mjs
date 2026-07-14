import { test, expect } from '@playwright/test';
import { attendreApplicationPrete, attendrePartieVisible } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

test('prologue deja complete avec modal TRAME ouverte — partie visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.route('**/sw.js', (route) => route.abort());
    const etat = {
        ...ETAT_HISTOIRE_VIDE,
        mondesCompletes: ['monde_prologue'],
        mondesDejaMontres: ['monde_prologue'],
    };
    await page.addInitScript((e) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(e));
    }, etat);
    await page.goto('/?dev1');
    await attendreApplicationPrete(page);
    await page.locator('#btn-continuer').click();
    await page.locator('#btn-histoire-trame').click();
    await expect(page.locator('#overlay-trame-conditions')).not.toHaveClass(/element-masque/);
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await attendrePartieVisible(page);
});
