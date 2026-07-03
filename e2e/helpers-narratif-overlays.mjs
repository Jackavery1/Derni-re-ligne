import { expect } from '@playwright/test';
import { attendreFinOverlaysHistoire } from './helpers-narratif-core.mjs';

/** Ferme recap, journal et cutscenes (parcours campagne long ou nettoyage). */
/** @param {import('@playwright/test').Page} page @param {number} [max] */
export async function viderOverlaysHistoireRapide(page, max = 12) {
    for (let i = 0; i < max; i++) {
        const etat = await page.evaluate(() => {
            const partieActive = document.body.classList.contains('partie-active');
            return {
                partieActive,
                recap:
                    !partieActive &&
                    document
                        .getElementById('overlay-recap-monde')
                        ?.classList.contains('objectif-overlay-visible'),
                cutscene: document
                    .getElementById('ecran-histoire-cutscene')
                    ?.classList.contains('actif'),
                journal: document
                    .getElementById('ecran-histoire-journal')
                    ?.classList.contains('actif'),
            };
        });
        if (etat.partieActive) return;
        if (!etat.recap && !etat.cutscene && !etat.journal) return;
        if (etat.recap) {
            await page.evaluate(() => {
                document.getElementById('btn-recap-continuer')?.click();
            });
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
        await attendreFinOverlaysHistoire(page, 800);
    }
}

/** @param {import('@playwright/test').Page} page */
export async function passerCutsceneEntiere(page) {
    await page.evaluate(() => {
        document.getElementById('btn-cutscene-passer')?.click();
    });
}

/** Passe toutes les cutscenes actives jusqu'à l'écran de fin histoire. */
/** @param {import('@playwright/test').Page} page */
export async function terminerCutscenesVersEcranFin(page) {
    try {
        await page.waitForFunction(
            () => {
                const fin = document
                    .getElementById('ecran-histoire-fin')
                    ?.classList.contains('actif');
                const cut = document
                    .getElementById('ecran-histoire-cutscene')
                    ?.classList.contains('actif');
                const recap = document
                    .getElementById('overlay-recap-monde')
                    ?.classList.contains('objectif-overlay-visible');
                const journal = document
                    .getElementById('ecran-histoire-journal')
                    ?.classList.contains('actif');
                return fin || cut || recap || journal;
            },
            { timeout: 15000 }
        );
    } catch {
        /* fin directe sans overlay intermediaire */
    }

    for (let tentative = 0; tentative < 80; tentative++) {
        if (page.isClosed()) break;

        const etat = await page.evaluate(() => ({
            fin:
                document.getElementById('ecran-histoire-fin')?.classList.contains('actif') ?? false,
            cutscene:
                document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif') ??
                false,
            cutsceneUi: Boolean(
                document.getElementById('btn-cutscene-passer')?.offsetParent ||
                document.getElementById('btn-cutscene-suivant')?.offsetParent
            ),
            recap:
                document
                    .getElementById('overlay-recap-monde')
                    ?.classList.contains('objectif-overlay-visible') ?? false,
            journal:
                document.getElementById('ecran-histoire-journal')?.classList.contains('actif') ??
                false,
        }));

        if (etat.fin) return;

        if (etat.cutscene || etat.cutsceneUi) {
            await passerCutsceneEntiere(page);
            continue;
        }
        if (etat.recap) {
            await page.locator('#btn-recap-continuer').click({ force: true });
            continue;
        }
        if (etat.journal) {
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }

        try {
            await attendreFinOverlaysHistoire(page, 3000);
        } catch {
            /* transition vers cutscene ou ecran fin */
        }
    }

    await expect(page.locator('#ecran-histoire-fin')).toHaveClass(/actif/, { timeout: 30000 });
}
