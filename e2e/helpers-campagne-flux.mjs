/** Flux post-victoire campagne (prologue → inferno). */
import { expect } from '@playwright/test';
import { avancerCutsceneUneLigne } from './helpers-narratif-core.mjs';

/** @param {import('@playwright/test').Page} page @param {number} [max=80] */
export async function avancerFluxPostVictoire(page, max = 80) {
    await expect
        .poll(async () =>
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
                const objectifs = document
                    .getElementById('overlay-objectifs-pre')
                    ?.classList.contains('objectif-overlay-visible');
                const gameOver = document
                    .getElementById('ecran-game-over')
                    ?.classList.contains('actif');
                const partieHistoire =
                    document.body.classList.contains('partie-active') &&
                    document.body.classList.contains('histoire-active');
                return recap || cutscene || journal || objectifs || gameOver || partieHistoire;
            })
        )
        .toBe(true);

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
            partieHistoire:
                document.body.classList.contains('partie-active') &&
                document.body.classList.contains('histoire-active'),
        }));

        if (etat.gameOver && etat.carteVisible) return 'game_over_carte';
        if (etat.objectifs && /INFERNO/i.test(etat.mondeNom)) return 'monde_lave';
        if (/INFERNO|MONDE SUIVANT/i.test(etat.notif)) return 'transition';
        if (etat.cutscene && /feu|INFERNO|lave/i.test(etat.dialogue)) return 'cutscene_lave';
        if (etat.partieHistoire) return 'monde_lave';

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
            await avancerCutsceneUneLigne(page, 12000);
            continue;
        }
        let stable = false;
        try {
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
                            const gameOver = document
                                .getElementById('ecran-game-over')
                                ?.classList.contains('actif');
                            return recap || cutscene || journal || gameOver;
                        }),
                    { timeout: 2000, intervals: [50, 100, 150, 200] }
                )
                .toBe(true);
            stable = true;
        } catch {
            stable = false;
        }
        if (!stable) continue;
    }
    return 'timeout';
}
