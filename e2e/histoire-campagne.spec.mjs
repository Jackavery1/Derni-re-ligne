import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    parcourirFluxPostVictoireAvecAssertions,
    terminerCutscenesVersEcranFin,
} from './helpers.mjs';
import { avancerCutsceneUneLigne } from './helpers-narratif-core.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire.mjs';
import {
    OPTIONS_CAMPAGNE_BULK,
    OPTIONS_CAMPAGNE_JALON,
    parcourirMondesCampagneNarratif,
    victoireMondeAvecNarratif,
    preparerConditionsTrameOrganiques,
    parcourirCampagneFinSecreteNarratif,
} from './helpers-campagne-narratif.mjs';

const ETAT_PROLOGUE_PRET = {
    ...ETAT_HISTOIRE_VIDE,
    mondesDejaMontres: ['monde_prologue'],
};

/** @param {import('@playwright/test').Page} page @param {number} [max] */
async function avancerFluxPostVictoire(page, max = 80) {
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

test('campagne — victoire prologue enchaine vers inferno sans retour carte', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);

    const resultat = await avancerFluxPostVictoire(page);
    expect(['monde_lave', 'transition', 'cutscene_lave']).toContain(resultat);

    if (resultat === 'transition') {
        await expect(page.locator('#notif-niveau')).toContainText(/MONDE SUIVANT/i);
    }

    await expect(page.locator('#ecran-histoire-map')).not.toHaveClass(/actif/);
    await expect(page.locator('#btn-histoire-carte')).toHaveClass(/element-masque/);

    await page.waitForFunction(
        () => {
            const canvas = document.getElementById('canvas-portrait-gauche');
            if (!(canvas instanceof HTMLCanvasElement)) return false;
            if (canvas.classList.contains('absent')) return false;
            const ctx = canvas.getContext('2d');
            if (!ctx) return false;
            const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0) return true;
            }
            return false;
        },
        null,
        { timeout: 25000 }
    );
});

test('campagne — enchainement desactive affiche le bouton carte', async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
        localStorage.setItem('derniereLigne_enchainementCampagne', 'false');
    });
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);
    const resultat = await avancerFluxPostVictoire(page, 25);
    expect(resultat).toBe('game_over_carte');

    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/);
    await expect(page.locator('#btn-histoire-carte')).toContainText(/CARTE/i);
    await expect(page.locator('#btn-histoire-carte')).not.toHaveClass(/element-masque/);
});

test('campagne — completion prologue persistee', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);

    const mondesCompletes = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        if (!brut) return [];
        return JSON.parse(brut).mondesCompletes ?? [];
    });
    expect(mondesCompletes).toContain('monde_prologue');
});

test('campagne — enchaine prologue puis inferno sans carte', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_PROLOGUE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_prologue', 99);
    });
    await fermerRecapPostMonde(page);
    await avancerFluxPostVictoire(page);

    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_lave', 99);
    });
    await fermerRecapPostMonde(page);

    const mondesCompletes = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        if (!brut) return [];
        return JSON.parse(brut).mondesCompletes ?? [];
    });
    expect(mondesCompletes).toContain('monde_prologue');
    expect(mondesCompletes).toContain('monde_lave');
});

test('campagne — cutscenes intermediaires boss et chapitres (audit D15)', async ({ page }) => {
    test.setTimeout(900000);
    const etatDepart = {
        ...ETAT_HISTOIRE_VIDE,
        mondesDejaMontres: ['monde_prologue'],
    };
    await ouvrirCarteHistoire(page, etatDepart);

    for (const mondeId of MONDES_CAMPAGNE_PRINCIPALE) {
        await page.evaluate(async (id) => {
            await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.(id, 99);
        }, mondeId);
        await parcourirFluxPostVictoireAvecAssertions(page, mondeId, undefined, 60, {
            typewriterTimeout: 12000,
            strictTypewriter: true,
        });
    }
});

const CAMPAGNE_NARRATIF_PARTIE_1 = MONDES_CAMPAGNE_PRINCIPALE.slice(0, 8);
const CAMPAGNE_NARRATIF_PARTIE_2 = MONDES_CAMPAGNE_PRINCIPALE.slice(8);

test.describe.serial('audit D9b — campagne complete avec narratif', () => {
    test('partie principale — mondes 1 à 8', async ({ page }) => {
        test.setTimeout(300000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesDejaMontres: ['monde_prologue'],
        };
        await ouvrirCarteHistoire(page, etatDepart);
        await parcourirMondesCampagneNarratif(
            page,
            CAMPAGNE_NARRATIF_PARTIE_1,
            OPTIONS_CAMPAGNE_BULK
        );
    });

    test('partie principale — mondes 9 à 16', async ({ page }) => {
        test.setTimeout(300000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesCompletes: [...CAMPAGNE_NARRATIF_PARTIE_1],
            bossVaincus: ['brasier', 'sentinelle'],
            mondesDejaMontres: ['monde_prologue', ...CAMPAGNE_NARRATIF_PARTIE_1],
        };
        await ouvrirCarteHistoire(page, etatDepart);
        await parcourirMondesCampagneNarratif(
            page,
            CAMPAGNE_NARRATIF_PARTIE_2,
            OPTIONS_CAMPAGNE_BULK
        );
    });

    test('secrets et fin secrete — narratif complet', async ({ page }) => {
        test.setTimeout(240000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesCompletes: [...MONDES_CAMPAGNE_PRINCIPALE],
            mondesCachesDebloques: ['monde_miroir'],
            mondesDejaMontres: ['monde_prologue', ...MONDES_CAMPAGNE_PRINCIPALE],
            bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde'],
            conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
        };
        await ouvrirCarteHistoire(page, etatDepart);

        await victoireMondeAvecNarratif(page, 'monde_miroir', OPTIONS_CAMPAGNE_JALON);
        await preparerConditionsTrameOrganiques(page);
        await parcourirMondesCampagneNarratif(
            page,
            ['monde_trame', 'monde_finale'],
            OPTIONS_CAMPAGNE_JALON
        );

        await page.evaluate(async () => {
            await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
        });
        await terminerCutscenesVersEcranFin(page);
        await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute(
            'data-fin',
            'fin_secrete'
        );
        await expect(page.locator('#histoire-fin-titre')).toContainText(/LIGNE PARFAITE/i);
    });
});

test('campagne complete — flags fin secrete avec narratif post-victoire (audit D9)', async ({
    page,
}) => {
    test.setTimeout(5_400_000);
    const etatDepart = {
        ...ETAT_HISTOIRE_VIDE,
        mondesDejaMontres: ['monde_prologue'],
    };

    await parcourirCampagneFinSecreteNarratif(page, etatDepart);

    const progression = await page.evaluate(async () => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        const typeFin = await window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
        return {
            typeFin,
            mondesCompletes: sauve.mondesCompletes ?? [],
            finSecreteObtenue: sauve.conditionsParadoxe?.finSecreteObtenue === true,
        };
    });

    expect(progression.typeFin).toBe('fin_secrete');
    expect(progression.mondesCompletes).toContain('monde_trame');
    expect(progression.mondesCompletes).toContain('monde_finale');

    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_secrete');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/LIGNE PARFAITE/i);

    const apresOutro = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        return {
            finSecreteObtenue: sauve.conditionsParadoxe?.finSecreteObtenue === true,
            toutesFin: sauve.toutesFinObtenues ?? [],
        };
    });
    expect(apresOutro.toutesFin).toContain('fin_secrete');
    expect(apresOutro.finSecreteObtenue).toBe(true);
});
