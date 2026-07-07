/** Helpers E2E — parcours campagne avec narratif actif (audits D9 / D9b). */
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire.mjs';
import { ouvrirCarteHistoire } from './helpers-histoire.mjs';
import { parcourirFluxPostVictoireAvecAssertions } from './helpers-narratif-flux-post.mjs';

/** Parcours narratif optimisé pour la campagne complète (audit D9b). */
export const OPTIONS_CAMPAGNE_BULK = {
    max: 45,
    typewriterTimeout: 2500,
    exigerCorpus: true,
    verifierAudio: true,
};

/** Jalons boss / chapitres — assertions plus strictes. */
export const OPTIONS_CAMPAGNE_JALON = {
    max: 55,
    typewriterTimeout: 4000,
    exigerCorpus: true,
    verifierAudio: true,
};

/** Campagne complète audit D9 — narratif actif, timeout allongé. */
export const OPTIONS_CAMPAGNE_D9 = {
    max: 55,
    typewriterTimeout: 3500,
    exigerCorpus: true,
    verifierAudio: true,
};

/** Prépare les conditions Trame via localStorage (sans API inject de test). */
/** @param {import('@playwright/test').Page} page */
export async function preparerConditionsTrameOrganiques(page) {
    await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        sauve.conditionsMiroir = { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 };
        sauve.conditionsTrame = {
            miroirComplete: true,
            tousJournauxTrouves: true,
            tousBossSansContinue: true,
            actionDistorsionFaite: true,
        };
        sauve.nbContinuesUtilises = 0;
        sauve.continuesParBoss = {};
        sauve.bossVaincus = [
            ...new Set([
                ...(sauve.bossVaincus ?? []),
                'brasier',
                'sentinelle',
                'archiviste',
                'avantgarde',
                'distorsion',
            ]),
        ];
        const journauxRequis = [
            'journal_1',
            'journal_2',
            'journal_3',
            'journal_4',
            'journal_5',
            'journal_6',
            'journal_7',
            'journal_8',
            'journal_9',
        ];
        sauve.journauxTrouves = [...new Set([...(sauve.journauxTrouves ?? []), ...journauxRequis])];
        sauve.mondesCachesDebloques = [
            ...new Set([...(sauve.mondesCachesDebloques ?? []), 'monde_miroir', 'monde_trame']),
        ];
        if (!sauve.mondesCompletes?.includes('monde_miroir')) {
            sauve.mondesCompletes = [...(sauve.mondesCompletes ?? []), 'monde_miroir'];
        }
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(sauve));
    });
}

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

/**
 * Campagne principale + secrets avec narratif post-victoire (audit D9).
 * @param {import('@playwright/test').Page} page
 * @param {object} etatDepart
 */
export async function parcourirCampagneFinSecreteNarratif(page, etatDepart) {
    await ouvrirCarteHistoire(page, etatDepart);
    await parcourirMondesCampagneNarratif(page, MONDES_CAMPAGNE_PRINCIPALE, OPTIONS_CAMPAGNE_D9);
    await victoireMondeAvecNarratif(page, 'monde_miroir', OPTIONS_CAMPAGNE_JALON);
    await preparerConditionsTrameOrganiques(page);
    await parcourirMondesCampagneNarratif(
        page,
        ['monde_trame', 'monde_finale'],
        OPTIONS_CAMPAGNE_JALON
    );
}
