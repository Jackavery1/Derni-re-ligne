import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, lancerMondeDepuisCarte } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

test(
    'panneau objectifs prologue mobile sans debordement horizontal',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        test.setTimeout(45000);
        await page.setViewportSize({ width: 390, height: 844 });
        const etatProloguePanneau = {
            ...ETAT_HISTOIRE_VIDE,
            mondesDejaMontres: ['monde_prologue'],
        };
        await ouvrirCarteHistoire(page, etatProloguePanneau);
        await lancerMondeDepuisCarte(page, 'monde_prologue');

        const btnCommencer = page.locator('#btn-objectifs-commencer');
        await expect(btnCommencer).toBeVisible({ timeout: 10000 });

        const metriques = await page.evaluate(() => {
            const doc = document.documentElement;
            const btn = document.getElementById('btn-objectifs-commencer');
            const rect = btn?.getBoundingClientRect();
            return {
                debord: doc.scrollWidth > doc.clientWidth + 1,
                btnH: rect?.height ?? 0,
                btnW: rect?.width ?? 0,
            };
        });

        expect(metriques.debord).toBe(false);
        expect(metriques.btnH).toBeGreaterThanOrEqual(48);
        expect(metriques.btnW).toBeGreaterThan(0);

        await btnCommencer.click({ force: true, noWaitAfter: true });
        await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 10000 });
        await expect(page.locator('#overlay-objectifs-pre')).not.toHaveClass(
            /objectif-overlay-visible/
        );
    }
);

test(
    'carte histoire utilisable sur viewport mobile',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await ouvrirCarteHistoire(page);
        await expect(page.locator('#histoire-monde-clavier')).toBeVisible();
        await expect(page.locator('#canvas-histoire-map')).toBeVisible();

        const metriques = await page.evaluate(() => {
            const doc = document.documentElement;
            const retour = document.getElementById('btn-histoire-retour');
            const rect = retour?.getBoundingClientRect();
            return {
                debord: doc.scrollWidth > doc.clientWidth + 1,
                retourH: rect?.height ?? 0,
                retourW: rect?.width ?? 0,
            };
        });
        expect(metriques.debord).toBe(false);
        expect(metriques.retourH).toBeGreaterThanOrEqual(48);
        expect(metriques.retourW).toBeGreaterThanOrEqual(48);
    }
);

test(
    'cutscene mobile — boutons tactiles et pas de débordement',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        test.setTimeout(45000);
        await page.setViewportSize({ width: 390, height: 844 });
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
        await lancerMondeDepuisCarte(page, 'monde_prologue');

        const cutscene = page.locator('#ecran-histoire-cutscene');
        await expect(cutscene).toHaveClass(/actif/, { timeout: 10000 });

        const metriques = await page.evaluate(() => {
            const doc = document.documentElement;
            const suivant = document.getElementById('btn-cutscene-suivant');
            const passer = document.getElementById('btn-cutscene-passer');
            const rs = suivant?.getBoundingClientRect();
            const rp = passer?.getBoundingClientRect();
            return {
                debord: doc.scrollWidth > doc.clientWidth + 1,
                suivantH: rs?.height ?? 0,
                passerH: rp?.height ?? 0,
            };
        });
        expect(metriques.debord).toBe(false);
        expect(metriques.suivantH).toBeGreaterThanOrEqual(48);
        expect(metriques.passerH).toBeGreaterThanOrEqual(48);

        const portraitDessine = await page.evaluate(() => {
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
        });
        expect(portraitDessine).toBe(true);

        const portraitsStables = await page.evaluate(() => {
            const gauche = document.getElementById('canvas-portrait-gauche');
            const droite = document.getElementById('canvas-portrait-droite');
            const rects = [gauche, droite]
                .filter((c) => c instanceof HTMLCanvasElement && !c.classList.contains('absent'))
                .map((c) => c.getBoundingClientRect());
            return rects.every((r) => r.width >= 48 && r.height >= 48 && r.top >= 0 && r.left >= 0);
        });
        expect(portraitsStables).toBe(true);
    }
);

test(
    'scroll molette sur la carte histoire ne provoque pas d erreur',
    { tag: '@viewport-mobile-portrait' },
    async ({ page }) => {
        await ouvrirCarteHistoire(page);
        const canvas = page.locator('#canvas-histoire-map');
        await canvas.hover();
        await page.mouse.wheel(0, 400);
        await page.mouse.wheel(0, -200);
        await expect(canvas).toBeVisible();
        await expect(page.locator('#histoire-prog-mondes')).toContainText('MONDES');
    }
);
