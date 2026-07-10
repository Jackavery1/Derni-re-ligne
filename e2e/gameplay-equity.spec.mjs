import { test, expect } from '@playwright/test';
import { demarrerPartie } from './helpers.mjs';

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
            return CONFIG.spawnGraceMs >= minMs && grace > 0;
        });
        expect(ok).toBe(true);
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

    test('buffer conserve deux inputs sans ecrasement', async ({ page }) => {
        await demarrerPartie(page);
        const buffer = await page.evaluate(() => {
            const api = window.__NEO_TEST__;
            api?.bufferiserInputTest?.('gauche');
            api?.bufferiserInputTest?.('tourner_cw');
            return api?.obtenirGameFeel?.().inputBuffer ?? [];
        });
        expect(buffer).toEqual(['gauche', 'tourner_cw']);
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
});
