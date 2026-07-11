import { test, expect } from '@playwright/test';
import {
    demarrerPartie,
    demarrerPartieViaClavier,
    terminerPartieCourante,
    preparerPageSansSw,
    activerPausePartie,
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    selectionnerBiomeClavier,
    passerCutsceneHistoire,
    preparerPremierLancement,
    appliquerSafeAreaIphone,
    ANNOTATION_C11,
    creerPageIphone14,
} from './helpers.mjs';
import { assertPasDeDebordementHorizontal } from './helpers-responsive-metriques.mjs';

test('écran titre utilisable sur viewport mobile', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#btn-jouer')).toBeVisible();
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#sel-biome-clavier')).toBeVisible();
});

test('nouvelle partie mobile ouvre la carte histoire', async ({ page }) => {
    test.setTimeout(60000);
    await preparerPremierLancement(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
    await page.locator('#btn-nouvelle-partie').click();
    await passerCutsceneHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
});

test('nouvelle partie tablette ouvre la carte histoire', async ({ page }) => {
    test.setTimeout(60000);
    await preparerPremierLancement(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
    await page.locator('#btn-nouvelle-partie').click();
    await passerCutsceneHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
});

test('constellation tablette paysage sans débordement horizontal', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#btn-jouer')).toBeVisible();
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#canvas-constellation')).toBeVisible();

    const metriques = await page.evaluate(() => ({
        debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        constellationVisible: Boolean(document.getElementById('canvas-constellation')),
    }));
    expect(metriques.debord).toBe(false);
    expect(metriques.constellationVisible).toBe(true);
});

test('partie solo paysage mobile — contrôles latéraux', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await demarrerPartie(page);
    await expect(page.locator('#controles-paysage')).toBeVisible();
    await expect(page.locator('#controles-mobile')).toBeHidden();

    const metriques = await page.evaluate(() => {
        const hold = document.getElementById('btn-reserve-p')?.getBoundingClientRect();
        const droite = document.getElementById('btn-droite-p')?.getBoundingClientRect();
        const gauche = document.getElementById('btn-gauche-p')?.getBoundingClientRect();
        return {
            h: gauche?.height ?? 0,
            w: gauche?.width ?? 0,
            holdAGauche: (hold?.left ?? 0) < window.innerWidth / 2,
            droiteADroite: (droite?.left ?? 0) > window.innerWidth / 2,
        };
    });
    expect(metriques.h).toBeGreaterThanOrEqual(48);
    expect(metriques.w).toBeGreaterThanOrEqual(48);
    expect(metriques.holdAGauche).toBe(true);
    expect(metriques.droiteADroite).toBe(true);
});

test('partie marathon paysage mobile — timer et panneau stats visibles', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await demarrerPartie(page);
    await expect(page.locator('#section-timer-niveau')).toBeVisible();
    await expect(page.locator('#affichage-temps-niveau')).toContainText(/\d{2}:\d{2}/);

    const metriques = await page.evaluate(() => {
        const echelle = document.getElementById('interface-echelle');
        const timer = document.getElementById('section-timer-niveau');
        const echelleRect = echelle?.getBoundingClientRect();
        const timerRect = timer?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            echelleDansEcran: Boolean(
                echelleRect && echelleRect.bottom <= window.innerHeight + 2 && echelleRect.top >= -2
            ),
            timerVisible: Boolean(
                timerRect && timerRect.height > 0 && timerRect.bottom <= window.innerHeight + 2
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.echelleDansEcran).toBe(true);
    expect(metriques.timerVisible).toBe(true);
});

test('partie laptop 1366x768 — panneaux sans scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await demarrerPartie(page);

    const metriques = await page.evaluate(() => {
        const panneaux = [...document.querySelectorAll('#interface-jeu .panneau')];
        const preview = document.getElementById('canvas-preview');
        const previewRect = preview?.getBoundingClientRect();
        const sectionNext = preview?.closest('.section')?.getBoundingClientRect();
        return {
            panneaux: panneaux.map((p) => {
                const style = getComputedStyle(p);
                return {
                    barreHorizontaleVisible:
                        style.overflowX !== 'hidden' &&
                        style.overflowX !== 'clip' &&
                        p.scrollWidth > p.clientWidth + 1,
                };
            }),
            previewDansSection: Boolean(
                previewRect &&
                sectionNext &&
                previewRect.left >= sectionNext.left - 1 &&
                previewRect.right <= sectionNext.right + 1
            ),
            largeurPanneau: panneaux[0]?.getBoundingClientRect().width ?? 0,
        };
    });

    expect(metriques.largeurPanneau).toBeGreaterThanOrEqual(120);
    expect(metriques.previewDansSection).toBe(true);
    for (const p of metriques.panneaux) {
        expect(p.barreHorizontaleVisible).toBe(false);
    }
});

test('partie solo desktop — contrôles tactiles masqués par défaut', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await demarrerPartie(page);
    await expect(page.locator('#controles-paysage')).toBeHidden();
    await expect(page.locator('#controles-mobile')).toBeHidden();
});

test('pause mobile sans débordement horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await demarrerPartie(page);
    await activerPausePartie(page);
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    await assertPasDeDebordementHorizontal(page);
});

test('game over mobile sans débordement horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartieViaClavier(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });

    const debord = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(debord).toBe(false);
});

test('pause paysage mobile sans debordement', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await demarrerPartie(page);
    await activerPausePartie(page);
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

    const metriques = await page.evaluate(() => {
        const contenu = document.querySelector('#ecran-pause .pause-contenu');
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            pauseOverflow: getComputedStyle(document.getElementById('ecran-pause') ?? document.body)
                .overflowY,
            boutonH: document.getElementById('btn-reprendre')?.getBoundingClientRect().height ?? 0,
            contenuOverflow: contenu ? getComputedStyle(contenu).overflowY : '',
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
});

test('game over paysage mobile sans debordement', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await demarrerPartieViaClavier(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });

    const metriques = await page.evaluate(() => {
        const contenu = document.querySelector('#ecran-game-over .go-contenu');
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            goOverflow: getComputedStyle(
                document.getElementById('ecran-game-over') ?? document.body
            ).overflowY,
            boutonH:
                document
                    .querySelector('#ecran-game-over .go-boutons .bouton')
                    ?.getBoundingClientRect().height ?? 0,
            contenuOverflow: contenu ? getComputedStyle(contenu).overflowY : '',
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
});

test('panneau detail JOUER visible sur petit ecran sans scroll force', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#btn-jouer')).toBeVisible();
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/, { timeout: 10000 });
    await selectionnerBiomeClavier(page);

    const metriques = await page.evaluate(() => {
        const btn = document.getElementById('btn-panneau-detail-jouer');
        btn?.scrollIntoView({ block: 'nearest' });
        const rect = btn?.getBoundingClientRect();
        const corps = document.getElementById('panneau-detail-corps');
        const corpsRect = corps?.getBoundingClientRect();
        return {
            h: rect?.height ?? 0,
            dansPanneau:
                Boolean(rect && corpsRect) &&
                rect.bottom <= corpsRect.bottom + 1 &&
                rect.top >= corpsRect.top - 1,
        };
    });
    expect(metriques.h).toBeGreaterThanOrEqual(48);
    expect(metriques.dansPanneau).toBe(true);
});

test('partie mobile — swipe horizontal deplace la piece', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);

    const avant = await page.evaluate(
        () => window.__NEO_TEST__?.obtenirColonnePieceActive?.() ?? null
    );
    expect(avant).not.toBeNull();

    await page.evaluate(() => {
        const canvas = document.getElementById('canvas-plateau');
        if (!(canvas instanceof HTMLCanvasElement)) return;
        const rect = canvas.getBoundingClientRect();
        const x0 = rect.left + rect.width / 2;
        const y0 = rect.top + rect.height / 2;
        const x1 = x0 + 48;
        const mk = (x, y) =>
            new Touch({
                identifier: 1,
                target: canvas,
                clientX: x,
                clientY: y,
            });
        canvas.dispatchEvent(
            new TouchEvent('touchstart', {
                bubbles: true,
                touches: [mk(x0, y0)],
                changedTouches: [mk(x0, y0)],
            })
        );
        canvas.dispatchEvent(
            new TouchEvent('touchmove', {
                bubbles: true,
                touches: [mk(x1, y0)],
                changedTouches: [mk(x1, y0)],
            })
        );
        canvas.dispatchEvent(
            new TouchEvent('touchend', {
                bubbles: true,
                touches: [],
                changedTouches: [mk(x1, y0)],
            })
        );
    });

    const apres = await page.evaluate(
        () => window.__NEO_TEST__?.obtenirColonnePieceActive?.() ?? null
    );
    expect(apres).toBeGreaterThan(avant);
});

test('codex mobile — grille deux colonnes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);

    const colonnes = await page.evaluate(() => {
        const liste = document.querySelector('#ecran-codex .codex-liste');
        if (!liste) return 0;
        return getComputedStyle(liste).gridTemplateColumns.split(' ').filter(Boolean).length;
    });
    expect(colonnes).toBe(2);
});

test('ecran chargement — padding safe-area declare', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    const padding = await page.evaluate(() => {
        const el = document.querySelector('.ecran-chargement');
        if (!el) return null;
        return getComputedStyle(el).paddingTop;
    });
    expect(padding).toBeTruthy();
});

test('iphone — contenu menu titre respecte encoche simulee (audit C11)', async ({ browser }) => {
    test.info().annotations.push(ANNOTATION_C11);

    const { context, page } = await creerPageIphone14(browser);
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);

    await appliquerSafeAreaIphone(page, 'iPhone 14');

    const metriques = await page.evaluate(() => {
        const btn = document.getElementById('btn-jouer');
        const ecran = document.getElementById('ecran-titre');
        const btnRect = btn?.getBoundingClientRect();
        const ecranRect = ecran?.getBoundingClientRect();
        const paddingTop = getComputedStyle(document.documentElement).getPropertyValue(
            '--safe-top'
        );
        return {
            topEcran: ecranRect?.top ?? -1,
            topBouton: btnRect?.top ?? -1,
            safeTop: paddingTop.trim(),
        };
    });
    expect(metriques.safeTop).toBe('47px');
    expect(metriques.topEcran).toBeGreaterThanOrEqual(46);
    expect(metriques.topBouton).toBeGreaterThanOrEqual(46);

    await context.close();
});
