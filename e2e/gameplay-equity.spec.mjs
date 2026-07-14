import { test, expect } from '@playwright/test';
import { demarrerPartie, demarrerPartieCoop } from './helpers.mjs';

test.describe('gameplay equity', () => {
    test('grace spawn active au demarrage de partie', async ({ page }) => {
        await demarrerPartie(page);
        const graceActive = await page.evaluate(
            () => window.__NEO_TEST__?.graceSpawnActiveTest?.() ?? false
        );
        expect(graceActive).toBe(true);
    });

    test('grace spawn couvre au moins 24 frames a 60fps', async ({ page }) => {
        await demarrerPartie(page);
        const ok = await page.evaluate(async () => {
            const grace = window.__NEO_TEST__?.obtenirGameFeel?.().spawnGraceRestant ?? 0;
            const { CONFIG } = await import('/js/config/config-jeu.js');
            const minMs = (24 * 1000) / 60;
            const framesConfig = Math.floor((CONFIG.spawnGraceMs * 60) / 1000);
            return CONFIG.spawnGraceMs >= minMs && grace > 0 && framesConfig >= 24;
        });
        expect(ok).toBe(true);
    });

    test('spawn grace mesure en frames a 60 fps (audit B G3)', async ({ page }) => {
        await demarrerPartie(page);
        const metriques = await page.evaluate(async () => {
            const { CONFIG } = await import('/js/config/config-jeu.js');
            const graceRestant = window.__NEO_TEST__?.obtenirGameFeel?.().spawnGraceRestant ?? 0;
            const framesConfig = Math.floor((CONFIG.spawnGraceMs * 60) / 1000);
            return { framesConfig, graceRestant, spawnGraceMs: CONFIG.spawnGraceMs };
        });
        expect(metriques.framesConfig).toBe(Math.floor((metriques.spawnGraceMs * 60) / 1000));
        expect(metriques.framesConfig).toBeGreaterThanOrEqual(24);
        expect(metriques.graceRestant).toBeGreaterThan(0);
    });

    test('coyote time actif apres quitter le sol', async ({ page }) => {
        await demarrerPartie(page);
        const coyoteOk = await page.evaluate(() => {
            const api = window.__NEO_TEST__;
            api?.activerPieceAuSolTest?.();
            api?.quitterSolPieceTest?.();
            return api?.coyoteActifTest?.() ?? false;
        });
        expect(coyoteOk).toBe(true);
    });

    test('ARE bloque les controles puis libere le buffer', async ({ page }) => {
        await demarrerPartie(page);
        const apresAre = await page.evaluate(() => {
            const api = window.__NEO_TEST__;
            if (!api?.forcerAreTest || !api.bufferiserInputTest || !api.tickGameFeel) return null;
            api.forcerAreTest();
            api.bufferiserInputTest('gauche');
            const pendantAre = api.pieceControlesActifsTest?.() ?? true;
            const bufferPendantAre = api.obtenirGameFeel?.().inputBuffer ?? [];
            api.tickGameFeel(200);
            const bufferApresAre = api.obtenirGameFeel?.().inputBuffer ?? [];
            const areRestant = api.obtenirGameFeel?.().areRestant ?? -1;
            return { pendantAre, bufferPendantAre, bufferApresAre, areRestant };
        });
        expect(apresAre).not.toBeNull();
        expect(apresAre.pendantAre).toBe(false);
        expect(apresAre.bufferPendantAre).toEqual(['gauche']);
        expect(apresAre.areRestant).toBe(0);
        expect(apresAre.bufferApresAre).toEqual([]);
    });

    test('buffer conserve trois inputs sans ecrasement (audit B G2)', async ({ page }) => {
        await demarrerPartie(page);
        const buffer = await page.evaluate(() => {
            const api = window.__NEO_TEST__;
            api?.bufferiserInputTest?.('gauche');
            api?.bufferiserInputTest?.('tourner_cw');
            api?.bufferiserInputTest?.('droite');
            return api?.obtenirGameFeel?.().inputBuffer ?? [];
        });
        expect(buffer).toEqual(['gauche', 'tourner_cw', 'droite']);
    });

    test('grace spawn expire apres au moins 24 frames a 60 fps', async ({ page }) => {
        await demarrerPartie(page);
        const metriques = await page.evaluate(async () => {
            const api = window.__NEO_TEST__;
            const { CONFIG } = await import('/js/config/config-jeu.js');
            const { demarrerGraceSpawn } = await import('/js/logique/game-feel-jeu.js');
            demarrerGraceSpawn();
            const frameMs = 1000 / 60;
            let ticks = 0;
            while ((api?.obtenirGameFeel?.().spawnGraceRestant ?? 0) > 0 && ticks < 120) {
                api?.tickGameFeel?.(frameMs);
                ticks++;
            }
            const framesConfig = Math.floor((CONFIG.spawnGraceMs * 60) / 1000);
            return {
                ticks,
                graceRestant: api?.obtenirGameFeel?.().spawnGraceRestant ?? -1,
                framesConfig,
            };
        });
        expect(metriques.graceRestant).toBe(0);
        expect(metriques.ticks).toBeGreaterThanOrEqual(24);
        expect(metriques.ticks).toBeLessThanOrEqual(metriques.framesConfig + 2);
    });

    test('input clavier ArrowLeft deplace la piece en partie', async ({ page }) => {
        await demarrerPartie(page);
        const avant = await page.evaluate(() => window.__NEO_TEST__?.obtenirColonnePieceActive?.());
        await page.keyboard.press('ArrowLeft');
        const apres = await page.evaluate(() => window.__NEO_TEST__?.obtenirColonnePieceActive?.());
        expect(typeof avant).toBe('number');
        expect(typeof apres).toBe('number');
        expect(apres).toBeLessThan(avant);
    });

    test('delai premier evenement vivant >= 120 frames a 60fps (audit B G3)', async ({ page }) => {
        await demarrerPartie(page);
        const metriques = await page.evaluate(async () => {
            return window.__NEO_TEST__?.obtenirDelaiPremierEvenementVivant?.('lave');
        });
        expect(metriques).not.toBeNull();
        expect(metriques.frames60).toBeGreaterThanOrEqual(120);
        expect(metriques.delaiMs).toBeGreaterThanOrEqual(22000);
    });

    test('buffer sprint autorise 3 actions (audit B G2)', async ({ page }) => {
        await demarrerPartie(page);
        const buffer = await page.evaluate(async () => {
            const { etat } = await import('/js/etat/store-jeu.js');
            etat.modeJeu = 'sprint';
            const api = window.__NEO_TEST__;
            api?.bufferiserInputTest?.('gauche');
            api?.bufferiserInputTest?.('tourner_cw');
            api?.bufferiserInputTest?.('droite');
            return api?.obtenirGameFeel?.().inputBuffer ?? [];
        });
        expect(buffer).toEqual(['gauche', 'tourner_cw', 'droite']);
    });

    test('buffer coop j1 autorise 3 actions (audit B G2)', async ({ page }) => {
        await demarrerPartieCoop(page);
        const buffer = await page.evaluate(async () => {
            return window.__NEO_TEST__?.remplirBufferCoopTest?.('j1', [
                'gauche',
                'tourner_cw',
                'droite',
            ]);
        });
        expect(buffer).toEqual(['gauche', 'tourner_cw', 'droite']);
    });

    test('boss combinaison sans repetition consecutive (audit B G2)', async ({ page }) => {
        await demarrerPartie(page);
        const resultat = await page.evaluate(() =>
            window.__NEO_TEST__?.simulerTiragesAttaqueCombinaison?.(60)
        );
        expect(resultat?.tirages).toBe(60);
        expect(resultat?.repetitionsConsecutives).toBe(0);
    });
});
