import { expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page @param {number} [timeout] @param {{ strict?: boolean }} [options] */
export async function attendreTypewriterInactif(page, timeout = 8000, options = {}) {
    const cutsceneActive = await page.evaluate(
        () =>
            document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif') ?? false
    );
    if (!cutsceneActive) return;
    try {
        await expect
            .poll(() => page.evaluate(() => window.__NEO_TEST__?.typewriterEstActif?.() !== true), {
                timeout,
                intervals: [40, 80, 120, 200],
            })
            .toBe(true);
    } catch (err) {
        if (options.strict) throw err;
    }
}

/** @param {import('@playwright/test').Page} page @param {number} [timeout] */
export async function attendreFinOverlaysHistoire(page, timeout = 3000) {
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const recap = document
                        .getElementById('overlay-recap-monde')
                        ?.classList.contains('objectif-overlay-visible');
                    const cutscene = document
                        .getElementById('ecran-histoire-cutscene')
                        ?.classList.contains('actif');
                    const journal = document
                        .getElementById('ecran-histoire-journal')
                        ?.classList.contains('actif');
                    return !recap && !cutscene && !journal;
                }),
            { timeout }
        )
        .toBe(true);
}

/** @param {import('@playwright/test').Page} page */
export async function lireTexteCutsceneActive(page) {
    return page.evaluate(() => {
        const ecran = document.getElementById('ecran-histoire-cutscene');
        const dialogue = document.getElementById('texte-dialogue-cutscene')?.textContent ?? '';
        const narration = document.getElementById('texte-narration-cutscene')?.textContent ?? '';
        if (ecran?.classList.contains('cutscene-mode-narration')) {
            return narration || dialogue;
        }
        return dialogue || narration;
    });
}

/** @param {import('@playwright/test').Page} page @param {number} [timeout] */
export async function attendreOverlayPostVictoire(page, timeout = 15000) {
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const recap = document
                        .getElementById('overlay-recap-monde')
                        ?.classList.contains('objectif-overlay-visible');
                    const cutscene = document
                        .getElementById('ecran-histoire-cutscene')
                        ?.classList.contains('actif');
                    const journal = document
                        .getElementById('ecran-histoire-journal')
                        ?.classList.contains('actif');
                    return recap || cutscene || journal;
                }),
            { timeout }
        )
        .toBe(true);
}

/** @param {import('@playwright/test').Page} page */
export async function assertAudioNarratifCutscene(page) {
    await expect
        .poll(() => page.evaluate(() => window.__NEO_TEST__?.obtenirMusiqueActive?.() ?? ''), {
            timeout: 10000,
        })
        .toBe('narratif_cutscene');
}

/** @param {import('@playwright/test').Page} page @param {number} [typewriterTimeout] @param {boolean} [strictTypewriter] */
export async function avancerCutsceneUneLigne(
    page,
    typewriterTimeout = 8000,
    strictTypewriter = false
) {
    await attendreTypewriterInactif(page, typewriterTimeout, { strict: strictTypewriter });
    const t = await lireTexteCutsceneActive(page);
    const avance = await page.evaluate(() => {
        const suivant = document.getElementById('btn-cutscene-suivant');
        if (suivant) {
            suivant.click();
            return true;
        }
        document.getElementById('btn-cutscene-passer')?.click();
        return false;
    });
    return { texte: t, avance };
}
