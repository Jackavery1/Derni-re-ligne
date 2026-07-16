import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete, ouvrirCarteHistoire } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

const IDS_JOURNAUX_ATTENDUS = [
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

/** @param {import('@playwright/test').Page} page @param {string} journalId */
async function afficherJournalTest(page, journalId) {
    await page.evaluate(async (id) => {
        const { chargerHistoireDonneesMetier, JOURNAUX_VERA } =
            await import('/js/histoire/histoire-donnees-exports.js');
        await chargerHistoireDonneesMetier();
        const journal = JOURNAUX_VERA.find((j) => j.id === id);
        if (!journal) throw new Error(`Journal introuvable : ${id}`);
        const { afficherJournalVera } = await import('/js/histoire/histoire-narratif.js');
        await new Promise((resolve, reject) => {
            afficherJournalVera(journal, () => {});
            const deadline = performance.now() + 10000;
            const attendre = () => {
                const el = document.getElementById('ecran-histoire-journal');
                if (el?.classList.contains('actif')) {
                    resolve(undefined);
                    return;
                }
                if (performance.now() > deadline) {
                    reject(new Error('Journal non affiche'));
                    return;
                }
                requestAnimationFrame(attendre);
            };
            attendre();
        });
    }, journalId);
}

test('journal VERA — registre complet 9 entrees (audit D5)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);
    const ids = await page.evaluate(async () => {
        const { chargerHistoireDonneesMetier, JOURNAUX_VERA } =
            await import('/js/histoire/histoire-donnees-exports.js');
        await chargerHistoireDonneesMetier();
        return JOURNAUX_VERA.map((j) => j.id);
    });
    expect(ids).toEqual(IDS_JOURNAUX_ATTENDUS);
});

for (const journalId of IDS_JOURNAUX_ATTENDUS) {
    test(`journal VERA ${journalId} — titre et extrait affichables (audit D5/D9)`, async ({
        page,
    }) => {
        test.setTimeout(45000);
        await preparerPageSansSw(page);
        await page.goto('/?neoTest=1');
        await attendreApplicationPrete(page);
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
        const meta = await page.evaluate(async (id) => {
            const { chargerHistoireDonneesMetier, JOURNAUX_VERA } =
                await import('/js/histoire/histoire-donnees-exports.js');
            await chargerHistoireDonneesMetier();
            const journal = JOURNAUX_VERA.find((j) => j.id === id);
            if (!journal) return null;
            const { JOURNAUX_VERA_DIALOGUES } = await import('/js/histoire-textes/journaux.js');
            const lignes =
                journal.texte?.length > 0 ? journal.texte : (JOURNAUX_VERA_DIALOGUES[id] ?? []);
            const premiere = lignes[0];
            const extrait =
                typeof premiere === 'string'
                    ? premiere
                    : typeof premiere?.texte === 'string'
                      ? premiere.texte
                      : '';
            return { titre: journal.titre, extrait: extrait.slice(0, 24) };
        }, journalId);
        expect(meta).not.toBeNull();

        await afficherJournalTest(page, journalId);
        await expect(page.locator('#ecran-histoire-journal')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        await expect(page.locator('#histoire-journal-titre')).toContainText(meta.titre);
        await expect(page.locator('#histoire-journal-texte')).toContainText(meta.extrait);
        await expect(page.locator('#canvas-journal-illust')).toBeVisible();
    });
}
