import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    demarrerPartieCoop,
    appliquerSafeAreaIphone,
    PROFILS_IPHONE_SAFE_AREA,
    creerPageIphone14,
    ouvrirCarteHistoire,
    lancerMondeDepuisCarte,
    activerPausePartieTactile,
    activerPauseCoopTactile,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ouvrirPremierNiveauArchitecte,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import {
    mesurerEncocheHaut,
    mesurerEncocheLaterale,
    mesurerBoutonsParIds,
    assertEncocheHautRespectee,
    assertEncocheLateraleRespectee,
    assertBoutonsTactilesMin,
    mesurerBoutonsPauseTactile,
    assertPauseTactileMin,
} from './helpers-responsive-metriques.mjs';

test(
    'audit C1 — letterbox canvas sans deformation',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await demarrerPartie(page);
        await expect
            .poll(
                () =>
                    page.evaluate(() => {
                        const canvas = document.getElementById('canvas-plateau');
                        return Boolean(canvas && canvas.width > 0 && canvas.height > 0);
                    }),
                { timeout: 5000 }
            )
            .toBe(true);

        const metriques = await page.evaluate(() => {
            const canvas = document.getElementById('canvas-plateau');
            const iface = document.getElementById('interface-jeu');
            if (!canvas || !iface) return null;
            const rect = canvas.getBoundingClientRect();
            const ratioInterne = canvas.width / canvas.height;
            const ratioAffiche = rect.width / rect.height;
            const scale = parseFloat(
                getComputedStyle(iface).getPropertyValue('--iface-scale') || '1'
            );
            const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2;
            return { ratioInterne, ratioAffiche, scale, overflowX };
        });

        expect(metriques).not.toBeNull();
        expect(metriques.ratioInterne).toBeCloseTo(0.5, 2);
        expect(metriques.ratioAffiche).toBeCloseTo(0.5, 1);
        expect(metriques.scale).toBeGreaterThan(0);
        expect(metriques.overflowX).toBe(false);
    }
);

test(
    'audit C1 — architecte telephone paysage tactile valider',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
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
    }
);

test('audit C12 — pause portrait au touch', { tag: '@touch-only' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartie(page);
    await activerPausePartieTactile(page);
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

    const metriques = await mesurerBoutonsPauseTactile(page, {
        reprendreId: 'btn-reprendre',
        secondaireId: 'btn-pause-quitter',
    });
    assertPauseTactileMin(metriques);
});

test('audit C12 — pause coop portrait au touch', { tag: '@touch-only' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await demarrerPartieCoop(page);
    await activerPauseCoopTactile(page);
    await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/);

    const metriques = await mesurerBoutonsPauseTactile(page, {
        reprendreId: 'btn-coop-reprendre',
        secondaireId: 'btn-pause-coop-mobile',
    });
    assertPauseTactileMin(metriques);
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

test(
    'audit C13 — cutscene histoire sans overlay orientation',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
        await lancerMondeDepuisCarte(page, 'monde_prologue');
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        await expect(page.locator('#overlay-orientation')).toHaveCount(0);
    }
);

for (const [id, profil] of Object.entries(PROFILS_IPHONE_SAFE_AREA)) {
    if (id.includes('landscape')) {
        test(
            `audit C14 — pause paysage encoches laterales (${id})`,
            { tag: '@viewport-mobile-landscape' },
            async ({ page }) => {
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
            }
        );
        continue;
    }

    test(
        `audit C14 — carte histoire portrait encoche (${id})`,
        { tag: '@viewport-mobile-portrait' },
        async ({ browser }) => {
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
        }
    );
}

test(
    'audit C14 — HUD solo portrait lisible (typo micro + scale plancher)',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
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
    }
);

test(
    'audit C14b — HUD paysage labels lisibles (>= 9px)',
    { tag: '@viewport-mobile-landscape' },
    async ({ page }) => {
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
    }
);

test(
    'audit C2 — pause paysage clavier et controles lateraux >= 48px',
    { tag: '@desktop-only' },
    async ({ page }) => {
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
    }
);

test(
    'audit C2 — options onglets et hint >= 48px',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').click();
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/);

        const metriques = await page.evaluate(() => {
            const ids = ['tab-reglages', 'tab-controles', 'btn-aller-controles'];
            return ids.map((id) => {
                const el = document.getElementById(id);
                const r = el?.getBoundingClientRect();
                return { id, h: r?.height ?? 0, w: r?.width ?? 0 };
            });
        });

        for (const m of metriques) {
            expect(m.h, m.id).toBeGreaterThanOrEqual(48);
            expect(m.w, m.id).toBeGreaterThanOrEqual(48);
        }
    }
);

test('audit C2 — codex onglets >= 48px', { tag: '@viewport-mobile-portrait' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);

    const metriques = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.codex-onglet')).map((el, i) => {
            const r = el.getBoundingClientRect();
            return {
                id: el.getAttribute('data-chapitre') ?? `onglet-${i}`,
                h: r.height,
                w: r.width,
            };
        });
    });

    expect(metriques.length).toBeGreaterThan(0);
    for (const m of metriques) {
        expect(m.h, m.id).toBeGreaterThanOrEqual(48);
        expect(m.w, m.id).toBeGreaterThanOrEqual(48);
    }
});

test(
    'audit C2 — pause et mute HUD >= 48px portrait',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await demarrerPartie(page);
        const metriques = await mesurerBoutonsParIds(page, ['btn-pause', 'btn-mute']);
        assertBoutonsTactilesMin(metriques);
    }
);

test(
    'audit C15 — partie active bloque scroll tactile (touch-action)',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await demarrerPartie(page);

        const metriques = await page.evaluate(() => ({
            touchActionPlateau: getComputedStyle(document.getElementById('canvas-plateau'))
                .touchAction,
            touchActionPause: getComputedStyle(document.getElementById('btn-pause')).touchAction,
            partieActive: document.body.classList.contains('partie-active'),
            debord: document.documentElement.scrollWidth > window.innerWidth + 1,
        }));

        expect(metriques.partieActive).toBe(true);
        expect(metriques.touchActionPlateau).toBe('none');
        expect(metriques.touchActionPause).toBe('manipulation');
        expect(metriques.debord).toBe(false);
    }
);
