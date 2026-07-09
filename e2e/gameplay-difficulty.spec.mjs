import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete } from './helpers.mjs';

test('gameplay difficulty — palier prologue monte apres progression (audit B)', async ({
    page,
}) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        const api = window.__NEO_TEST__;
        if (!api?.evaluerPalierDifficultePrologue) return null;
        return api.evaluerPalierDifficultePrologue();
    });

    expect(resultat).not.toBeNull();
    expect(resultat.debut).toBe(resultat.palier1);
    expect(resultat.apres).toBe(resultat.palier2);
    expect(resultat.palierCourant).toBe(2);
});
