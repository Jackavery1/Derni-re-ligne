import { parcourirFluxPostVictoireAvecAssertions } from './helpers-narratif-flux-post.mjs';

/** Parcours narratif optimisé pour la campagne complète (audit D9b). */
export const OPTIONS_CAMPAGNE_BULK = {
    max: 45,
    typewriterTimeout: 2500,
    exigerCorpus: true,
    verifierAudio: false,
};

/** Jalons boss / chapitres — assertions plus strictes. */
export const OPTIONS_CAMPAGNE_JALON = {
    max: 55,
    typewriterTimeout: 4000,
    exigerCorpus: true,
    verifierAudio: true,
};

/**
 * Simule une victoire avec narratif actif (jamais sansNarratif).
 * @param {import('@playwright/test').Page} page
 * @param {string} mondeId
 * @param {object} [options]
 */
export async function victoireMondeAvecNarratif(page, mondeId, options = OPTIONS_CAMPAGNE_BULK) {
    await page.evaluate(async (id) => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.(id, 99);
    }, mondeId);
    await parcourirFluxPostVictoireAvecAssertions(page, mondeId, undefined, options.max, options);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string[]} mondes
 * @param {object} [options]
 */
export async function parcourirMondesCampagneNarratif(
    page,
    mondes,
    options = OPTIONS_CAMPAGNE_BULK
) {
    for (const mondeId of mondes) {
        await victoireMondeAvecNarratif(page, mondeId, options);
    }
}
