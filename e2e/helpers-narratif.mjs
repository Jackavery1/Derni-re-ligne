import { expect } from '@playwright/test';
import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';
import { SCENE_DEFAUT_POST_MONDE } from '../js/histoire-narratif.js';

/** @param {string} mondeId */
export function obtenirScenePostMonde(mondeId) {
    const entree = CUTSCENES_POST_MONDE[mondeId];
    if (!entree) return SCENE_DEFAUT_POST_MONDE[mondeId] ?? null;
    return entree.scene ?? SCENE_DEFAUT_POST_MONDE[mondeId] ?? null;
}

/** Marqueurs texte post-victoire par monde (audit D — 15 mondes). */
export const MARQUEURS_NARRATIFS_POST_MONDE = {
    monde_prologue: [/blocs répondent|satisfaction/i],
    monde_lave: [/lave obéit|VERA aussi obéissait/i],
    monde_rouille: [/machines ne savent pas|Continuer sans savoir/i],
    monde_ocean: [/Sous l'eau|Je pense que c'était elle/i],
    monde_foret: [/espace libéré|Forêt Primordiale|INTERFÉRENCE DÉTECTÉE/i],
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
    monde_boss_1: [
        /Brasier ne s'éteint pas|effondre|Inferno respire/i,
        /Tu\.\.\. tu n'as pas compris/i,
    ],
    monde_rouille: [/machines ne savent pas|Continuer sans savoir/i],
    monde_ocean: [/Sous l'eau|Je pense que c'était elle|SIGNAL PARASITE/i],
    monde_foret: [/espace libéré|Forêt Primordiale|INTERFÉRENCE DÉTECTÉE/i],
    monde_boss_2: [
        /Sentinelle commence à se fragmenter|Je n'avais pas modélisé cette variable/i,
        /CHAPITRE III|MÉMOIRE PERDUE|transmission 05/i,
    ],
    monde_glace: [/retenait son souffle|patrouille au loin/i],
    monde_desert: [/fragment de carnet|Continue\. — V/i],
    monde_eclipse: [/lumière ou dans l'ombre|joue comme si/i],
    monde_cyber: [/son laboratoire|ROBO — si tu lis ceci/i],
    monde_boss_3: [/CHAPITRE IV|FRACTURE|paradoxe acceptable|Archiviste/i],
    monde_fuochi: [/feux d'artifice|inutiles sont les plus importantes/i],
    monde_cosmos: [/Je l'ai entendue|VERA \? Ou elle/i],
    monde_vide: [/Le Vide ne parle pas|joué à l'aveugle/i],
    monde_boss_4: [/Quatre chapitres|objectif|FINALE|RÉSOLUTION|Distorsion attend/i],
    monde_miroir: [/joué à l'envers|fragmentation|Distorsion/i],
    monde_trame: [/Trame Primordiale|TRAME PRIMORDIALE|Jour 2 191/i],
    monde_finale: [/Distorsion|Enfin|LIGNE PARFAITE/i],
};

export const SCENES_VICTOIRE_BOSS = {
    brasier: { debut: 'seuil_brasier', fin: 'labo', pivot: /Inferno respire/i },
    sentinelle: {
        debut: 'seuil_sentinelle',
        fin: 'labo',
        pivot: /dernière chose/i,
        sceneIntermediaire: 'fragmentation',
    },
    archiviste: { debut: 'labo', fin: 'labo', pivot: /paradoxe acceptable/i },
    avantgarde: { debut: 'seuil_avantgarde', fin: 'seuil_avantgarde', pivot: /Elle dit bonjour/i },
    distorsion: { debut: 'fragmentation', fin: 'fragmentation', pivot: /Alors que veux-tu/i },
};

/** @param {import('@playwright/test').Page} page @param {number} [timeout] */
export async function attendreTypewriterInactif(page, timeout = 3000) {
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
    } catch {
        // Le typewriter peut rester actif sur certaines lignes longues : ne pas bloquer le parcours.
    }
}

/** @param {import('@playwright/test').Page} page @param {number} [timeout] */
async function attendreOverlayPostVictoire(page, timeout = 15000) {
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

/** @param {import('@playwright/test').Page} page @param {number} [typewriterTimeout] */
async function avancerCutsceneUneLigne(page, typewriterTimeout = 3000) {
    await attendreTypewriterInactif(page, typewriterTimeout);
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
 * @param {{ exigerCorpus?: boolean, typewriterTimeout?: number }} [options]
 */
export async function parcourirFluxPostVictoireAvecAssertions(
    page,
    mondeId,
    marqueurs = MARQUEURS_NARRATIFS_CAMPAGNE[mondeId] ?? [],
    max = 80,
    options = {}
) {
    const corpus = [];
    const typewriterTimeout = options.typewriterTimeout ?? 3000;

    await attendreOverlayPostVictoire(page);

    let pausesConsecutives = 0;

    for (let i = 0; i < max; i++) {
        if (page.isClosed()) break;
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
            try {
                await attendreOverlayPostVictoire(page, 1500);
            } catch {
                break;
            }
            continue;
        }
        pausesConsecutives = 0;

        if (etat.recap) {
            await page.locator('#btn-recap-continuer').click({ force: true });
            continue;
        }
        if (etat.cutscene) {
            for (let j = 0; j < 80; j++) {
                if (page.isClosed()) break;
                const actif = await page.evaluate(
                    () =>
                        document
                            .getElementById('ecran-histoire-cutscene')
                            ?.classList.contains('actif') ?? false
                );
                if (!actif) break;
                const { texte: t, avance } = await avancerCutsceneUneLigne(page, typewriterTimeout);
                if (t.trim()) corpus.push(t);
                if (!avance) break;
            }
            continue;
        }
        if (etat.journal) {
            const texteJournal = await page.evaluate(() => {
                const titre = document.getElementById('histoire-journal-titre')?.textContent ?? '';
                const corps = document.getElementById('histoire-journal-texte')?.textContent ?? '';
                return `${titre}\n${corps}`.trim();
            });
            if (texteJournal) corpus.push(texteJournal);
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }
        try {
            await attendreOverlayPostVictoire(page, 1500);
        } catch {
            break;
        }
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

/** @param {import('@playwright/test').Page} page */
export async function cliquerCutsceneSuivant(page) {
    await page.evaluate(() => {
        document.getElementById('btn-cutscene-suivant')?.click();
    });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreCutsceneVictoireBoss(page) {
    await page.waitForFunction(
        () => {
            const recap = document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible');
            const cutscene = document.getElementById('ecran-histoire-cutscene');
            const dialogue =
                cutscene?.classList.contains('actif') ||
                cutscene?.classList.contains('cutscene-mode-dialogue');
            return recap || dialogue;
        },
        null,
        { timeout: 20000 }
    );

    const recapVisible = await page.evaluate(() =>
        document
            .getElementById('overlay-recap-monde')
            ?.classList.contains('objectif-overlay-visible')
    );
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
        await expect(page.locator('#btn-cutscene-suivant')).toBeVisible({ timeout: 15000 });
    }

    await expect(page.locator('#btn-cutscene-suivant')).toBeVisible({ timeout: 15000 });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {RegExp} pivot
 * @param {string} [sceneFin]
 * @param {number} [max]
 */
export async function avancerCutsceneJusquaPivot(page, pivot, sceneFin, max = 80) {
    let sceneFinVue = false;
    const corpus = [];
    for (let i = 0; i < max; i++) {
        await attendreTypewriterInactif(page);
        const actif = await page.evaluate(() =>
            document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif')
        );
        if (!actif) break;

        const scene = await page.evaluate(
            () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
        );
        if (sceneFin && scene === sceneFin) sceneFinVue = true;

        const t = await lireTexteCutsceneActive(page);
        if (t.trim()) corpus.push(t);
        const texteAccumule = corpus.join('\n');
        if (pivot.test(t) || pivot.test(texteAccumule)) {
            if (sceneFin) {
                expect(sceneFinVue || scene === sceneFin).toBe(true);
            }
            return t;
        }

        const avant = t;
        await cliquerCutsceneSuivant(page);
        await attendreTypewriterInactif(page, 4000);
        const apres = await lireTexteCutsceneActive(page);
        if (apres === avant && apres.trim().length > 0) {
            await cliquerCutsceneSuivant(page);
            await attendreTypewriterInactif(page, 4000);
        }

        const sceneApres = await page.evaluate(
            () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
        );
        if (sceneFin && sceneApres === sceneFin) sceneFinVue = true;
    }
    await attendreTypewriterInactif(page);
    const texteFinal = corpus.join('\n');
    if (sceneFin) {
        expect(sceneFinVue).toBe(true);
        return texteFinal;
    }
    expect(pivot.test(texteFinal)).toBe(true);
    return texteFinal;
}

/** @param {import('@playwright/test').Page} page @param {string} sceneId */
export async function attendreSceneCutsceneActive(page, sceneId) {
    await expect
        .poll(() =>
            page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null)
        )
        .toBe(sceneId);
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId @param {number} [lignes] */
export async function simulerVictoireBossHistoire(page, mondeId, lignes = 99) {
    await page.evaluate(
        async ([id, n]) => {
            await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.(id, n);
        },
        [mondeId, lignes]
    );
}

/** @param {import('@playwright/test').Page} page @param {string} personnageId @param {string} humeur @param {number} [timeout] */
export async function assertHumeurPortraitCutscene(page, personnageId, humeur, timeout = 10000) {
    await expect
        .poll(
            () =>
                page.evaluate(
                    (id) => window.__NEO_TEST__?.obtenirHumeurPortraitCutscene?.(id) ?? null,
                    personnageId
                ),
            { timeout }
        )
        .toBe(humeur);
}

/** @param {import('@playwright/test').Page} page @param {number} [timeout] */
export async function attendreJournalHistoire(page, timeout = 30000) {
    await expect(page.locator('#ecran-histoire-journal')).toHaveClass(/actif/, { timeout });
}

/** @param {import('@playwright/test').Page} page @param {'brasier' | 'sentinelle' | 'archiviste' | 'avantgarde' | 'distorsion'} bossKey */
export async function parcourirVictoireBossJusquaPivot(page, bossKey) {
    const cfg = SCENES_VICTOIRE_BOSS[bossKey];
    await attendreSceneCutsceneActive(page, cfg.debut);

    const scenesCibles = [];
    if (cfg.sceneIntermediaire) scenesCibles.push(cfg.sceneIntermediaire);
    if (cfg.fin) scenesCibles.push(cfg.fin);

    for (const sceneCible of scenesCibles) {
        await expect
            .poll(
                async () => {
                    const scene = await page.evaluate(
                        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
                    );
                    if (scene === sceneCible) return sceneCible;
                    const actif = await page.evaluate(() =>
                        document
                            .getElementById('ecran-histoire-cutscene')
                            ?.classList.contains('actif')
                    );
                    if (!actif) return '__CUTSCENE_INACTIVE__';
                    await avancerCutsceneUneLigne(page);
                    return scene ?? '__VIDE__';
                },
                { timeout: 90000, intervals: [150, 250, 400] }
            )
            .toBe(sceneCible);
    }
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
export async function lancerMondeDepuisCarte(page, mondeId) {
    await page.locator('#histoire-monde-clavier').selectOption(mondeId, { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
}

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

    for (let tentative = 0; tentative < 40; tentative++) {
        if (page.isClosed()) break;

        const etat = await page.evaluate(() => ({
            fin:
                document.getElementById('ecran-histoire-fin')?.classList.contains('actif') ?? false,
            cutscene:
                document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif') ??
                false,
            recap:
                document
                    .getElementById('overlay-recap-monde')
                    ?.classList.contains('objectif-overlay-visible') ?? false,
            journal:
                document.getElementById('ecran-histoire-journal')?.classList.contains('actif') ??
                false,
        }));

        if (etat.fin) return;

        if (etat.cutscene) {
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

    await expect(page.locator('#ecran-histoire-fin')).toHaveClass(/actif/, { timeout: 15000 });
}
