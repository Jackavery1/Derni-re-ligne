import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, fermerRecapPostMonde, passerCutsceneEntiere } from './helpers.mjs';
import {
    CAS_FRAGMENTS_VERA,
    preparerEtatPremiereCompletionFragment,
} from './helpers-narratif-fragments.mjs';

for (const { mondeId, cleFragment, marqueur } of CAS_FRAGMENTS_VERA) {
    test(`fragment VERA ${cleFragment} — ${mondeId}`, async ({ page }) => {
        test.setTimeout(90000);
        const etat = preparerEtatPremiereCompletionFragment(mondeId);
        await ouvrirCarteHistoire(page, etat);
        await page.evaluate(async (id) => {
            await window.__NEO_TEST__?.declencherPostMondeNarratif?.(id);
        }, mondeId);
        await fermerRecapPostMonde(page);
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        for (let i = 0; i < 6; i++) {
            const trouve = await page
                .waitForFunction(
                    (source) => {
                        const t =
                            document.getElementById('texte-dialogue-cutscene')?.textContent ??
                            document.getElementById('texte-narration-cutscene')?.textContent ??
                            '';
                        return new RegExp(source, 'i').test(t);
                    },
                    marqueur.source,
                    { timeout: 3000 }
                )
                .then(() => true)
                .catch(() => false);
            if (trouve) break;
            await passerCutsceneEntiere(page);
            await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
                timeout: 10000,
            });
        }
        await page.waitForFunction(
            (source) => {
                const t =
                    document.getElementById('texte-dialogue-cutscene')?.textContent ??
                    document.getElementById('texte-narration-cutscene')?.textContent ??
                    '';
                return new RegExp(source, 'i').test(t);
            },
            marqueur.source,
            { timeout: 10000 }
        );
    });
}
