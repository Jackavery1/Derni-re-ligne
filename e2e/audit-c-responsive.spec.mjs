import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    demarrerPartieCoop,
    demarrerPartieViaClavier,
    terminerPartieCourante,
    terminerPartieCoopCourante,
    appliquerSafeAreaIphone,
    PROFILS_IPHONE_SAFE_AREA,
    ANNOTATION_C11,
    creerPageIphone14,
    ouvrirCarteHistoire,
    lancerMondeDepuisCarte,
    activerPausePartieTactile,
    activerPauseCoopTactile,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ouvrirPremierNiveauArchitecte,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import {
    mesurerEncocheHaut,
    mesurerEncocheLaterale,
    mesurerBoutonsParIds,
    assertEncocheHautRespectee,
    assertEncocheLateraleRespectee,
    assertBoutonsTactilesMin,
} from './helpers-responsive-metriques.mjs';

test('audit C1 — letterbox canvas sans deformation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);

    const metriques = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-plateau');
        const iface = document.getElementById('interface-jeu');
        if (!canvas || !iface) return null;
        const rect = canvas.getBoundingClientRect();
        const ratioInterne = canvas.width / canvas.height;
        const ratioAffiche = rect.width / rect.height;
        const scale = parseFloat(getComputedStyle(iface).getPropertyValue('--iface-scale') || '1');
        const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2;
        return { ratioInterne, ratioAffiche, scale, overflowX };
    });

    expect(metriques).not.toBeNull();
    expect(metriques.ratioInterne).toBeCloseTo(0.5, 2);
    expect(metriques.ratioAffiche).toBeCloseTo(0.5, 1);
    expect(metriques.scale).toBeGreaterThan(0);
    expect(metriques.overflowX).toBe(false);
});

test('audit C11 — pause paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await demarrerPartie(page);
    await page.setViewportSize({ width: 667, height: 375 });
    await appliquerSafeAreaIphone(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

    const metriques = await mesurerEncocheHaut(page, {
        idEcran: 'ecran-pause',
        selecteurBouton: '#btn-reprendre',
    });
    assertEncocheHautRespectee(metriques, { safeTop: '47px' });
});

test('audit C11 — game over paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await page.setViewportSize({ width: 667, height: 375 });
    await demarrerPartieViaClavier(page);
    await appliquerSafeAreaIphone(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });

    const metriques = await mesurerEncocheHaut(page, {
        idEcran: 'ecran-game-over',
        selecteurBouton: '#ecran-game-over .go-boutons .bouton',
    });
    assertEncocheHautRespectee(metriques);
});

test('audit C11 — pause coop paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await demarrerPartieCoop(page);
    await page.setViewportSize({ width: 667, height: 375 });
    await appliquerSafeAreaIphone(page);
    await activerPauseCoopTactile(page);
    await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/);

    const metriques = await mesurerEncocheHaut(page, {
        idEcran: 'ecran-pause-coop',
        selecteurBouton: '#btn-coop-reprendre',
    });
    assertEncocheHautRespectee(metriques);
});

test('audit C11 — game over coop paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await demarrerPartieCoop(page);
    await page.setViewportSize({ width: 667, height: 375 });
    await appliquerSafeAreaIphone(page);
    await terminerPartieCoopCourante(page);

    const metriques = await mesurerEncocheHaut(page, {
        idEcran: 'ecran-game-over-coop',
        selecteurBouton: '#ecran-game-over-coop .go-boutons .bouton',
    });
    assertEncocheHautRespectee(metriques);
});

test('audit C11 — architecte paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await page.setViewportSize({ width: 667, height: 375 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await appliquerSafeAreaIphone(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const metriques = await page.evaluate(() => {
        const conteneur = document.getElementById('conteneur-principal-archi');
        const style = conteneur ? getComputedStyle(conteneur) : null;
        const valider = document.getElementById('btn-archi-valider-p');
        const rect = valider?.getBoundingClientRect();
        return {
            paddingTop: style?.paddingTop ?? '',
            validerH: rect?.height ?? 0,
            validerW: rect?.width ?? 0,
            paysageVisible:
                getComputedStyle(
                    document.getElementById('controles-archi-paysage') ?? document.body
                ).display !== 'none',
        };
    });
    expect(parseFloat(metriques.paddingTop)).toBeGreaterThanOrEqual(46);
    expect(metriques.paysageVisible).toBe(true);
    assertBoutonsTactilesMin([
        { id: 'btn-archi-valider-p', h: metriques.validerH, w: metriques.validerW },
    ]);
});

test('audit C1 — architecte telephone paysage tactile valider', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const piecesAvant = (await page.locator('#archi-pieces-used').textContent()) ?? '0';
    await page.locator('#btn-archi-valider-p').click({ force: true });
    await expect(page.locator('#archi-pieces-used')).not.toHaveText(piecesAvant);

    const metriques = await mesurerBoutonsParIds(page, [
        'btn-archi-gauche-p',
        'btn-archi-droite-p',
        'btn-archi-bas-p',
        'btn-archi-tourner-p',
        'btn-archi-valider-p',
    ]);
    assertBoutonsTactilesMin(metriques);
});

test('audit C11 — carte histoire iPhone respecte encoche simulee', async ({ browser }) => {
    test.info().annotations.push(ANNOTATION_C11);
    const { context, page } = await creerPageIphone14(browser);
    await ouvrirCarteHistoire(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await appliquerSafeAreaIphone(page);

    const metriques = await mesurerEncocheHaut(page, {
        idEcran: 'histoire-map-header',
        selecteurBouton: '#btn-histoire-retour',
    });
    assertEncocheHautRespectee(metriques, { safeTop: '47px' });
    await context.close();
});

test('audit C12 — pause portrait au touch', { tag: '@touch-only' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);
    await activerPausePartieTactile(page);
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

    const metriques = await page.evaluate(() => {
        const reprendre = document.getElementById('btn-reprendre');
        const quitter = document.getElementById('btn-pause-quitter');
        const rect = reprendre?.getBoundingClientRect();
        const quitterRect = quitter?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            boutonH: rect?.height ?? 0,
            boutonW: rect?.width ?? 0,
            quitterH: quitterRect?.height ?? 0,
            quitterW: quitterRect?.width ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
    expect(metriques.boutonW).toBeGreaterThanOrEqual(48);
    expect(metriques.quitterH).toBeGreaterThanOrEqual(48);
    expect(metriques.quitterW).toBeGreaterThanOrEqual(48);
});

test('audit C12 — pause coop portrait au touch', { tag: '@touch-only' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartieCoop(page);
    await activerPauseCoopTactile(page);
    await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/);

    const metriques = await page.evaluate(() => {
        const reprendre = document.getElementById('btn-coop-reprendre');
        const pauseMobile = document.getElementById('btn-pause-coop-mobile');
        const rect = reprendre?.getBoundingClientRect();
        const pauseRect = pauseMobile?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            boutonH: rect?.height ?? 0,
            boutonW: rect?.width ?? 0,
            pauseH: pauseRect?.height ?? 0,
            pauseW: pauseRect?.width ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
    expect(metriques.boutonW).toBeGreaterThanOrEqual(48);
    expect(metriques.pauseH).toBeGreaterThanOrEqual(48);
    expect(metriques.pauseW).toBeGreaterThanOrEqual(48);
});

test(
    'audit C13 — partie solo jouable en portrait sans overlay bloquant',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await demarrerPartie(page);
        await expect(page.locator('#overlay-orientation')).toHaveCount(0);
        await expect(page.locator('#interface-jeu')).toBeVisible();
        await expect(page.locator('#canvas-plateau')).toBeVisible();
    }
);

test(
    'audit C13 — coop jouable en portrait sans overlay bloquant',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        const { demarrerPartieCoop } = await import('./helpers.mjs');
        await page.setViewportSize({ width: 390, height: 844 });
        await demarrerPartieCoop(page);
        await expect(page.locator('#overlay-orientation')).toHaveCount(0);
        await expect(page.locator('#interface-jeu-coop')).toBeVisible();
    }
);

test(
    'audit C13 — architecte jouable en portrait sans overlay bloquant',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-architecte').click();
        await ouvrirPremierNiveauArchitecte(page);
        await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#overlay-orientation')).toHaveCount(0);
    }
);

test('audit C13 — cutscene histoire sans overlay orientation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#overlay-orientation')).toHaveCount(0);
});

for (const [id, profil] of Object.entries(PROFILS_IPHONE_SAFE_AREA)) {
    if (id.includes('landscape')) {
        test(`audit C14 — pause paysage encoches laterales (${id})`, async ({ page }) => {
            test.info().annotations.push({ type: 'note', description: profil.label });
            await demarrerPartie(page);
            await page.setViewportSize({ width: 667, height: 375 });
            await appliquerSafeAreaIphone(page, id);
            await page.keyboard.press('Escape');
            await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

            const metriques = await mesurerEncocheLaterale(page, {
                idConteneur: 'conteneur-principal',
                selecteurBouton: '#btn-reprendre',
            });

            assertEncocheLateraleRespectee(metriques, {
                safeLeft: `${profil.safeLeft}px`,
                minPadding: profil.safeLeft - 1,
                minLeft: profil.safeLeft - 1,
            });
        });
        continue;
    }

    test(`audit C14 — carte histoire portrait encoche (${id})`, async ({ browser }) => {
        test.info().annotations.push({ type: 'note', description: profil.label });
        const { context, page } = await creerPageIphone14(browser);
        await ouvrirCarteHistoire(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await appliquerSafeAreaIphone(page, id);

        const metriques = await mesurerEncocheHaut(page, {
            idEcran: 'histoire-map-header',
            selecteurBouton: '#btn-histoire-retour',
        });

        assertEncocheHautRespectee(metriques, {
            safeTop: `${profil.safeTop}px`,
            minPadding: profil.safeTop - 1,
            minTop: profil.safeTop - 1,
        });
        await context.close();
    });
}

test('audit C14 — HUD solo portrait lisible (typo micro + scale plancher)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);

    const metriques = await page.evaluate(() => {
        const label = document.querySelector('.stat-label');
        const styleLabel = label ? getComputedStyle(label) : null;
        const scale = Number(
            getComputedStyle(
                document.getElementById('interface-jeu') ?? document.body
            ).getPropertyValue('--iface-scale') || '1'
        );
        return {
            fontPx: styleLabel ? parseFloat(styleLabel.fontSize) : 0,
            scale,
        };
    });

    expect(metriques.fontPx).toBeGreaterThanOrEqual(11);
    expect(metriques.scale).toBeGreaterThanOrEqual(0.52);
});

test('audit C14b — HUD paysage labels lisibles (>= 9px)', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await demarrerPartie(page);

    const tailles = await page.evaluate(() => {
        const selecteurs = [
            '.panneau .section:nth-child(2) .stat-label',
            '#affichage-restant',
            '#section-timer-niveau .stat-label',
        ];
        return selecteurs.map((sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const px = parseFloat(getComputedStyle(el).fontSize);
            return Number.isFinite(px) ? px : 0;
        });
    });

    for (const taille of tailles.filter((t) => t !== null)) {
        expect(taille).toBeGreaterThanOrEqual(9);
    }
});

test('audit C2 — pause paysage clavier et controles lateraux >= 48px', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await demarrerPartie(page);

    await page.keyboard.press('Escape');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ecran-pause')).not.toHaveClass(/actif/);

    const metriques = await page.evaluate(() => {
        const paysage = document.getElementById('controles-paysage');
        const style = paysage ? getComputedStyle(paysage) : null;
        const rect = document.getElementById('btn-gauche-p')?.getBoundingClientRect();
        return {
            paysageVisible: style?.display !== 'none',
            gaucheH: rect?.height ?? 0,
            gaucheW: rect?.width ?? 0,
        };
    });

    expect(metriques.paysageVisible).toBe(true);
    expect(metriques.gaucheH).toBeGreaterThanOrEqual(48);
    expect(metriques.gaucheW).toBeGreaterThanOrEqual(48);
});

test('audit C15 — partie active bloque scroll tactile (touch-action)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);

    const metriques = await page.evaluate(() => ({
        touchActionPlateau: getComputedStyle(document.getElementById('canvas-plateau')).touchAction,
        touchActionPause: getComputedStyle(document.getElementById('btn-pause')).touchAction,
        partieActive: document.body.classList.contains('partie-active'),
        debord: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));

    expect(metriques.partieActive).toBe(true);
    expect(metriques.touchActionPlateau).toBe('none');
    expect(metriques.touchActionPause).toBe('manipulation');
    expect(metriques.debord).toBe(false);
});
