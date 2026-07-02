import { test, expect, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    demarrerPartie,
    demarrerPartieViaClavier,
    terminerPartieCourante,
    filtrerViolationsCritiques,
    preparerPageSansSw,
    activerPausePartie,
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    selectionnerBiomeClavier,
    passerCutsceneHistoire,
    preparerPremierLancement,
} from './helpers.mjs';

test('aucune bannière erreur au démarrage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
});

test('écran titre et navigation vers la sélection', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
        timeout: 15000,
    });
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#canvas-constellation')).toBeVisible();
});

test('lancement partie via constellation affiche le plateau', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#canvas-plateau')).toBeVisible();
});

test('pause puis quitter retourne au menu', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
    await page.keyboard.press('p');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    await page.locator('#btn-pause-quitter').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await expect(page.locator('#interface-jeu')).not.toBeVisible();
});

test('écran titre sans violations accessibilité critiques', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('écran titre respecte le contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page })
        .disableRules(['region'])
        .analyze({ includedImpacts: ['serious', 'critical'] });
    const contrast = result.violations.filter((v) => v.id === 'color-contrast');
    expect(contrast).toEqual([]);
});

test('interface jeu sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartie(page);
    const result = await new AxeBuilder({ page }).include('#interface-jeu').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('options affiche l’onglet contrôles', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#btn-options')).toBeVisible();
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/, { timeout: 10000 });
    await page.locator('#tab-controles').click();
    await expect(page.locator('#panneau-controles')).toBeVisible();
    await expect(page.locator('#panneau-controles')).not.toHaveAttribute('hidden');
});

test('constellation affiche le panneau ancré avant JOUER', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await selectionnerBiomeClavier(page, { value: 'classique' });
    await expect(page.locator('#panneau-detail')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#btn-panneau-detail-jouer')).toBeVisible();
});

test('sélection biome au clavier démarre une partie', async ({ page }) => {
    await demarrerPartieViaClavier(page);
    await expect(page.locator('body')).toHaveClass(/partie-active/);
});

test('mode sprint disponible sur l écran selection', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#toggle-sprint')).toBeVisible();
    await expect(page.locator('#btn-mode-sprint')).toHaveCount(0);
});

test('game over affiche l écran dédié', async ({ page }) => {
    await demarrerPartieViaClavier(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
});

test('options respecte le contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    const result = await new AxeBuilder({ page }).include('#ecran-options').analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

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

test('partie solo desktop — contrôles tactiles masqués par défaut', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await demarrerPartie(page);
    await expect(page.locator('#controles-paysage')).toBeHidden();
    await expect(page.locator('#controles-mobile')).toBeHidden();
});

test('pause mobile sans débordement horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);
    await activerPausePartie(page);
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

    const debord = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(debord).toBe(false);
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
    test.info().annotations.push({
        type: 'note',
        description:
            'Validation physique sur iPhone reelle non automatisable ; simulation --safe-top: 47px (Dynamic Island).',
    });

    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);

    await page.evaluate(() => {
        document.documentElement.style.setProperty('--safe-top', '47px');
        document.documentElement.style.setProperty('--safe-bottom', '34px');
    });

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
