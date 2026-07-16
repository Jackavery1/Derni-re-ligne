import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire } from './helpers.mjs';
import {
    MARQUEURS_NARRATIFS_POST_MONDE,
    MARQUEURS_NARRATIFS_CAMPAGNE,
    obtenirScenePostMonde,
    HUMEURS_POST_MONDE_PIVOT,
    parcourirFluxPostVictoireAvecAssertions,
    viderOverlaysHistoireRapide,
    assertHumeurPortraitCutscene,
    avancerCutsceneJusquaPivot,
    assertAudioNarratifCutscene,
} from './helpers-narratif.mjs';
import { preparerEtatPremiereCompletionFragment } from './helpers-narratif-fragments.mjs';
import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';

const MONDES_POST_MONDE = Object.keys(CUTSCENES_POST_MONDE);

const MONDES_AVEC_TRANSITION_CHAPITRE = new Set([
    'monde_prologue',
    'monde_boss_1',
    'monde_boss_2',
    'monde_boss_3',
    'monde_boss_4',
]);

/** @param {string} mondeId */
function marqueursPourPostMonde(mondeId) {
    if (MONDES_AVEC_TRANSITION_CHAPITRE.has(mondeId)) {
        return MARQUEURS_NARRATIFS_CAMPAGNE[mondeId] ?? [];
    }
    return MARQUEURS_NARRATIFS_POST_MONDE[mondeId] ?? [];
}

/** @param {string} mondeId */
function etatPourPostMonde(mondeId) {
    return preparerEtatPremiereCompletionFragment(mondeId);
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
async function declencherPostMonde(page, mondeId) {
    await page.evaluate(async (id) => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.(id);
    }, mondeId);

    await page.waitForFunction(
        () => {
            const recap = document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible');
            const cutscene = document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('actif');
            return recap || cutscene;
        },
        null,
        { timeout: 10000 }
    );

    const recapVisible = await page.evaluate(() =>
        document
            .getElementById('overlay-recap-monde')
            ?.classList.contains('objectif-overlay-visible')
    );
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
    }

    const sceneAttendue = obtenirScenePostMonde(mondeId);
    const attendScene = sceneAttendue && !MONDES_AVEC_TRANSITION_CHAPITRE.has(mondeId);
    if (attendScene) {
        await expect
            .poll(
                () =>
                    page.evaluate(
                        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
                    ),
                { timeout: 10000 }
            )
            .toBe(sceneAttendue);
    } else {
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
    }

    await assertAudioNarratifCutscene(page);
}

for (const mondeId of MONDES_POST_MONDE) {
    test(`post-monde — ${mondeId} (audit D)`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirCarteHistoire(page, etatPourPostMonde(mondeId));
        await declencherPostMonde(page, mondeId);

        await parcourirFluxPostVictoireAvecAssertions(
            page,
            mondeId,
            marqueursPourPostMonde(mondeId)
        );
        await viderOverlaysHistoireRapide(page, 16);
    });
}

test('post-monde — prologue humeur ROBO content (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, etatPourPostMonde('monde_prologue'));
    await declencherPostMonde(page, 'monde_prologue');
    await expect
        .poll(
            () => page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null),
            { timeout: 10000 }
        )
        .toBe('labo');
    await avancerCutsceneJusquaPivot(page, /Sa phrase s'est coupée/i);
    await assertHumeurPortraitCutscene(page, 'robo', 'content');
    await viderOverlaysHistoireRapide(page, 16);
});

test('post-monde — paradoxe humeur VERA douce (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, etatPourPostMonde('monde_paradoxe'));
    await declencherPostMonde(page, 'monde_paradoxe');
    await avancerCutsceneJusquaPivot(page, /lire entre les blocs/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'douce');
    await viderOverlaysHistoireRapide(page, 16);
});

const MONDES_HUMEUR_DEDIEE = new Set(['monde_prologue', 'monde_paradoxe']);

for (const [mondeId, cfg] of Object.entries(HUMEURS_POST_MONDE_PIVOT)) {
    if (MONDES_HUMEUR_DEDIEE.has(mondeId)) continue;

    test(`post-monde — ${mondeId} humeur ${cfg.personnage} ${cfg.humeur} (audit D)`, async ({
        page,
    }) => {
        test.setTimeout(120000);
        await ouvrirCarteHistoire(page, etatPourPostMonde(mondeId));
        await declencherPostMonde(page, mondeId);
        await avancerCutsceneJusquaPivot(page, cfg.pivot);
        await assertHumeurPortraitCutscene(page, cfg.personnage, cfg.humeur);
        await viderOverlaysHistoireRapide(page, 16);
    });
}

test('post-monde — re-completion prologue sans cutscene post-monde (audit D)', async ({ page }) => {
    test.setTimeout(60000);
    const etat = preparerEtatPremiereCompletionFragment('monde_lave');
    etat.mondesCompletes = [...etat.mondesCompletes, 'monde_prologue'];
    etat.fragmentsVusIds = [...(etat.fragmentsVusIds ?? []), 'apres_prologue'];
    await ouvrirCarteHistoire(page, etat);

    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_prologue');
    });

    await page.waitForFunction(
        () =>
            document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible'),
        null,
        { timeout: 10000 }
    );
    await page.locator('#btn-recap-continuer').click({ force: true });

    await page.waitForFunction(
        () => {
            const cutscene = document.getElementById('ecran-histoire-cutscene');
            const carte = document.getElementById('ecran-histoire-map');
            const texte =
                document.getElementById('histoire-cutscene-texte')?.textContent ??
                document.getElementById('texte-dialogue-cutscene')?.textContent ??
                '';
            const cutsceneVisible = cutscene?.classList.contains('actif');
            const carteVisible = carte?.classList.contains('actif');
            return carteVisible || (cutsceneVisible && !/satisfaction/i.test(texte));
        },
        null,
        { timeout: 10000 }
    );
    const texteCutscene = await page.evaluate(
        () =>
            document.getElementById('histoire-cutscene-texte')?.textContent ??
            document.getElementById('texte-dialogue-cutscene')?.textContent ??
            ''
    );
    expect(texteCutscene).not.toMatch(/satisfaction/i);
    await viderOverlaysHistoireRapide(page, 8);
});

test('post-monde — couvre les 15 mondes narratifs', () => {
    expect(MONDES_POST_MONDE).toHaveLength(15);
});
