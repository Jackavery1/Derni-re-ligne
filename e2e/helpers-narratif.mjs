import { expect } from '@playwright/test';

/** Scènes de fond attendues par monde (post-victoire). */
export const SCENES_POST_MONDE = {
    monde_prologue: 'labo',
    monde_lave: 'seuil_brasier',
    monde_rouille: 'labo',
    monde_ocean: 'observatoire',
    monde_foret: 'fragmentation',
    monde_glace: 'seuil_sentinelle',
    monde_desert: 'observatoire',
    monde_eclipse: 'fragmentation',
    monde_cyber: 'labo',
    monde_fuochi: 'seuil_brasier',
    monde_cosmos: 'observatoire',
    monde_vide: 'vide_errance',
    monde_miroir: 'fragmentation',
    monde_trame: 'trame',
    monde_paradoxe: 'trame',
};

/** Marqueurs texte post-victoire par monde (audit D — 15 mondes). */
export const MARQUEURS_NARRATIFS_POST_MONDE = {
    monde_prologue: [/blocs répondent|satisfaction/i],
    monde_lave: [/lave obéit|VERA aussi obéissait/i],
    monde_rouille: [/machines ne savent pas|Continuer sans savoir/i],
    monde_ocean: [/Sous l'eau|Je pense que c'était elle/i],
    monde_foret: [/Forêt|espace libéré/i],
    monde_glace: [/retenait son souffle|patrouille au loin/i],
    monde_desert: [/fragment de carnet|Continue\. — V/i],
    monde_eclipse: [/lumière ou dans l'ombre|joue comme si/i],
    monde_cyber: [/son laboratoire|ROBO — si tu lis ceci/i],
    monde_fuochi: [/feux d'artifice|inutiles sont les plus importantes/i],
    monde_cosmos: [/Je l'ai entendue|VERA \? Ou elle/i],
    monde_vide: [/Le Vide ne parle pas|joué à l'aveugle/i],
    monde_miroir: [/joué à l'envers|ses règles fonctionnent aussi/i],
    monde_trame: [/Trame Primordiale|Jour 2 191/i],
    monde_paradoxe: [/ligne incomplète\. Volontairement|lire entre les blocs/i],
};

/** Marqueurs narratifs attendus dans le flux post-victoire (audit D15). */
export const MARQUEURS_NARRATIFS_CAMPAGNE = {
    monde_prologue: [/CHAPITRE I|FEU DES ORIGINES|Sa phrase s'est coupée/i],
    monde_lave: [/lave obéit|VERA aussi obéissait|Inferno respire/i],
    monde_boss_1: [/Brasier|effondre|Inferno respire/i, /Descends|traces|VERA/i],
    monde_rouille: [/GARDIEN|ENTIT/i],
    monde_ocean: [/Sous l'eau|Je pense que c'était elle|SIGNAL PARASITE/i],
    monde_foret: [/Forêt|espace libéré/i],
    monde_boss_2: [
        /Sentinelle|gelait|disparaît|transmission 05/i,
        /CHAPITRE III|MÉMOIRE PERDUE|modélisé/i,
    ],
    monde_glace: [/retenait son souffle|patrouille au loin/i],
    monde_desert: [/fragment de carnet|Continue\. — V/i],
    monde_eclipse: [/lumière ou dans l'ombre|joue comme si/i],
    monde_cyber: [/son laboratoire|ROBO — si tu lis ceci/i],
    monde_boss_3: [/CHAPITRE IV|FRACTURE|archives|Archiviste/i],
    monde_fuochi: [/feux d'artifice|inutiles sont les plus importantes/i],
    monde_cosmos: [/Je l'ai entendue|VERA \? Ou elle/i],
    monde_vide: [/Le Vide ne parle pas|joué à l'aveugle/i],
    monde_boss_4: [/Quatre chapitres|objectif|FINALE|RÉSOLUTION|Distorsion attend/i],
    monde_miroir: [/Miroir|fragmentation|Distorsion/i],
    monde_trame: [/Trame|TRAME PRIMORDIALE|Primordiale/i],
    monde_finale: [/Distorsion|Enfin|LIGNE PARFAITE/i],
};

export const SCENES_VICTOIRE_BOSS = {
    brasier: { debut: 'seuil_brasier', fin: 'labo', pivot: /Inferno respire/i },
    sentinelle: { debut: 'seuil_sentinelle', fin: 'labo', pivot: /dernière chose/i },
};

/** Simule l'encoche iPhone (audit C11 — validation physique non automatisable). */
/** @param {import('@playwright/test').Page} page */
export async function appliquerEncocheSimulee(page) {
    await page.evaluate(() => {
        document.documentElement.style.setProperty('--safe-top', '47px');
        document.documentElement.style.setProperty('--safe-bottom', '34px');
        document.documentElement.style.setProperty('--safe-left', '0px');
        document.documentElement.style.setProperty('--safe-right', '0px');
    });
}

/** @param {import('@playwright/test').Page} page */
export async function lireTexteCutsceneActive(page) {
    return page.evaluate(() => {
        return (
            document.getElementById('texte-dialogue-cutscene')?.textContent ??
            document.getElementById('texte-narration-cutscene')?.textContent ??
            ''
        );
    });
}

/**
 * Parcourt recap / cutscenes / journal post-victoire et vérifie les marqueurs narratifs.
 * @param {import('@playwright/test').Page} page
 * @param {string} mondeId
 * @param {RegExp[]} [marqueurs]
 * @param {number} [max]
 * @param {{ exigerCorpus?: boolean }} [options]
 */
export async function parcourirFluxPostVictoireAvecAssertions(
    page,
    mondeId,
    marqueurs = MARQUEURS_NARRATIFS_CAMPAGNE[mondeId] ?? [],
    max = 80,
    options = {}
) {
    const corpus = [];

    await page
        .waitForFunction(
            () => {
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
            },
            null,
            { timeout: 15000 }
        )
        .catch(() => {});

    let pausesConsecutives = 0;

    for (let i = 0; i < max; i++) {
        const etat = await page.evaluate(() => ({
            recap: document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible'),
            cutscene: document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('actif'),
            journal: document.getElementById('ecran-histoire-journal')?.classList.contains('actif'),
        }));

        if (!etat.recap && !etat.cutscene && !etat.journal) {
            pausesConsecutives++;
            if (pausesConsecutives >= 6) break;
            await page.waitForTimeout(250);
            continue;
        }
        pausesConsecutives = 0;

        if (etat.recap) {
            await page.locator('#btn-recap-continuer').click({ force: true });
            continue;
        }
        if (etat.cutscene) {
            for (let j = 0; j < 48; j++) {
                const actif = await page
                    .locator('#ecran-histoire-cutscene')
                    .evaluate((el) => el.classList.contains('actif'))
                    .catch(() => false);
                if (!actif) break;
                const t = await lireTexteCutsceneActive(page);
                if (t.trim()) corpus.push(t);
                const avance = await page.evaluate(() => {
                    const suivant = document.getElementById('btn-cutscene-suivant');
                    if (suivant) {
                        suivant.click();
                        return true;
                    }
                    document.getElementById('btn-cutscene-passer')?.click();
                    return false;
                });
                if (!avance) break;
                await page.waitForTimeout(100);
            }
            continue;
        }
        if (etat.journal) {
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }
        await page.waitForTimeout(150);
    }

    const texte = corpus.join('\n');
    if (options.exigerCorpus) {
        expect(texte.trim().length).toBeGreaterThan(8);
    }
    if (marqueurs.length === 0) return;
    for (const re of marqueurs) {
        expect(texte).toMatch(re);
    }
}

/** Ferme recap, journal et cutscenes sans assertion stricte (parcours campagne long). */
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
        await page.waitForTimeout(150);
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
    for (let tentative = 0; tentative < 20; tentative++) {
        const finActif = await page
            .locator('#ecran-histoire-fin')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (finActif) return;

        const cutActif = await page
            .locator('#ecran-histoire-cutscene')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (cutActif) {
            await page.locator('#btn-cutscene-passer').click({ force: true });
            continue;
        }
        await page.waitForTimeout(200);
    }
    await expect(page.locator('#ecran-histoire-fin')).toHaveClass(/actif/, { timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page */
export async function passerCutsceneActive(page) {
    await page.evaluate(() => {
        const passer = document.getElementById('btn-cutscene-passer');
        if (passer) {
            passer.click();
            return;
        }
        document.getElementById('btn-cutscene-suivant')?.click();
    });
}
