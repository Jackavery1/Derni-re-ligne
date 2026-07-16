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
    ANNOTATION_C11,
    creerPageIphone14,
    ouvrirCarteHistoire,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ouvrirPremierNiveauArchitecte,
} from './helpers.mjs';
import {
    mesurerEncocheHaut,
    assertEncocheHautRespectee,
    assertBoutonsTactilesMin,
} from './helpers-responsive-metriques.mjs';

test(
    'audit C11 — pause paysage respecte encoche simulee',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
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
    }
);

test(
    'audit C11 — game over paysage respecte encoche simulee',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
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
    }
);

test(
    'audit C11 — pause coop paysage respecte encoche simulee',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
        test.info().annotations.push(ANNOTATION_C11);
        await demarrerPartieCoop(page);
        await page.setViewportSize({ width: 667, height: 375 });
        await appliquerSafeAreaIphone(page);
        const { activerPauseCoopTactile } = await import('./helpers.mjs');
        await activerPauseCoopTactile(page);
        await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/);

        const metriques = await mesurerEncocheHaut(page, {
            idEcran: 'ecran-pause-coop',
            selecteurBouton: '#btn-coop-reprendre',
        });
        assertEncocheHautRespectee(metriques);
    }
);

test(
    'audit C11 — game over coop paysage respecte encoche simulee',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
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
    }
);

test(
    'audit C11 — architecte paysage respecte encoche simulee',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
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
    }
);

test(
    'audit C11 — carte histoire iPhone respecte encoche simulee',
    { tag: '@viewport-mobile-portrait' },
    async ({ browser }) => {
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
    }
);
