import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    demarrerPartie,
    selectionnerBiomeClavier,
    ouvrirCarteHistoire,
    fermerInfobulleContexteSiVisible,
    ETAT_DEBLOCAGE_COMPLET,
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_FIN_VRAIE_PRET,
    ETAT_AVANT_FIN_SECRETE,
} from './helpers.mjs';

async function installerJournalVibrations(page) {
    await page.addInitScript(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        Object.defineProperty(navigator, 'vibrate', {
            configurable: true,
            value: (pattern) => {
                window.__NEO_VIBRATE_LOG__.push(pattern);
                return true;
            },
        });
        localStorage.setItem('derniereLigne_haptique', 'true');
    });
}

async function preparerSelectionPremiereVisiteModes(page, etat = ETAT_DEBLOCAGE_COMPLET) {
    await installerJournalVibrations(page);
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript((e) => {
        window.__NEO_SILENT_NOTIFS__ = false;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_tutorielOracleVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.removeItem('derniereLigne_infobullesModesJeu');
        localStorage.removeItem('derniereLigne_infobulleOracleCoop');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(e));
        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistrations().then((regs) => {
                for (const reg of regs) void reg.unregister();
            });
        }
    }, etat);
}

async function selectionnerBiomeVerrouilleConstellation(page, biomeId) {
    await page.evaluate((id) => {
        const select = document.getElementById('sel-biome-clavier');
        if (!select) return;
        for (const opt of select.options) {
            if (opt.value === id) {
                opt.disabled = false;
                select.value = id;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }, biomeId);
}

async function selectionnerMondeCarte(page, mondeId) {
    await expect(page.locator(`#histoire-monde-clavier option[value="${mondeId}"]`)).toBeAttached({
        timeout: 15000,
    });
    await page.evaluate((id) => {
        const select = document.getElementById('histoire-monde-clavier');
        if (!select) return;
        for (const opt of select.options) {
            if (opt.value === id) {
                opt.disabled = false;
                select.value = id;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }, mondeId);
}

async function attendreBarreModesPretes(page) {
    await expect(page.locator('#sel-barre-modes')).not.toHaveClass(/element-masque/, {
        timeout: 10000,
    });
    await expect(page.locator('#toggle-sprint')).toBeVisible();
}

async function reinitialiserInfobulleMode(page, modeId) {
    await page.evaluate((id) => {
        try {
            const raw = localStorage.getItem('derniereLigne_infobullesModesJeu');
            const vu = raw ? JSON.parse(raw) : {};
            delete vu[id];
            localStorage.setItem('derniereLigne_infobullesModesJeu', JSON.stringify(vu));
        } catch {
            /* ignore */
        }
    }, modeId);
}

async function attendreInfobulleMode(page, titrePartiel) {
    const overlay = page.locator('#overlay-infobulle-contexte');
    await expect(overlay).not.toHaveClass(/element-masque/, { timeout: 10000 });
    await expect(page.locator('#infobulle-contexte-titre')).toContainText(titrePartiel, {
        ignoreCase: true,
    });
    await page.evaluate(() => {
        document.getElementById('overlay-infobulle-contexte')?.classList.add('element-masque');
    });
    await expect(overlay).toHaveClass(/element-masque/);
}

async function basculerSprintDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerModeSprint } = await import('/js/mode-sprint.js');
        basculerModeSprint();
    });
}

async function basculerOracleDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerOracle } = await import('/js/oracle-jeu.js');
        basculerOracle();
    });
}

async function basculerCoopDepuisSelection(page) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('body')).not.toHaveClass(/partie-active/);
    await page.evaluate(async () => {
        const { basculerModeCoop } = await import('/js/coop-jeu.js');
        basculerModeCoop();
    });
}

test('audit B — haptique en partie via bus lignes effacees', async ({ page }) => {
    await installerJournalVibrations(page);
    await demarrerPartie(page);

    const ok = await page.evaluate(() => {
        window.__NEO_VIBRATE_LOG__ = [];
        window.__NEO_TEST__?.emettreEvenementBusJeu?.('lignes:effacees', {
            nbSupprimees: 4,
            lignesEffacees: [19, 18, 17, 16],
        });
        return Array.isArray(window.__NEO_VIBRATE_LOG__) && window.__NEO_VIBRATE_LOG__.length > 0;
    });
    expect(ok).toBe(true);

    const motif = await page.evaluate(() => window.__NEO_VIBRATE_LOG__?.[0] ?? null);
    expect(motif).toEqual([15, 40, 15, 40, 20]);
});

test('audit B — animation menu arretee en partie', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);

    await selectionnerBiomeClavier(page);
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 20000 });

    const menuInactif = await page.evaluate(() => window.__NEO_TEST__?.menuAnimActif?.() ?? null);
    expect(menuInactif).toBe(false);
});

test('audit B — infobulles modes sprint et sans fin', async ({ page }) => {
    await preparerSelectionPremiereVisiteModes(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await attendreBarreModesPretes(page);
    await fermerInfobulleContexteSiVisible(page);

    await reinitialiserInfobulleMode(page, 'sprint');
    await basculerSprintDepuisSelection(page);
    await attendreInfobulleMode(page, 'SPRINT');

    await reinitialiserInfobulleMode(page, 'sansFin');
    await basculerSprintDepuisSelection(page);
    await attendreInfobulleMode(page, 'SANS FIN');
});

test('audit B — infobulles oracle et coop', async ({ page }) => {
    await preparerSelectionPremiereVisiteModes(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await selectionnerBiomeClavier(page);
    await attendreBarreModesPretes(page);
    await fermerInfobulleContexteSiVisible(page);

    await reinitialiserInfobulleMode(page, 'oracle');
    await basculerOracleDepuisSelection(page);
    await attendreInfobulleMode(page, 'ORACLE');

    await basculerOracleDepuisSelection(page);
    await reinitialiserInfobulleMode(page, 'coop');
    await basculerCoopDepuisSelection(page);
    await attendreInfobulleMode(page, 'COOP');
});

test('audit B — infobulle defi du jour', async ({ page }) => {
    await preparerSelectionPremiereVisiteModes(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await selectionnerBiomeClavier(page);
    await fermerInfobulleContexteSiVisible(page);

    await expect(page.locator('#toggle-defi-jour-wrap')).not.toHaveClass(/element-masque/);
    await page.locator('#toggle-defi-jour').click({ force: true });
    await attendreInfobulleMode(page, 'DEFI');
});

test('audit B — constellation biome verrouille oriente vers histoire', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#sel-biome-clavier option[value="eclipse"]')).toBeAttached({
        timeout: 15000,
    });
    await selectionnerBiomeVerrouilleConstellation(page, 'eclipse');
    await expect(page.locator('#panneau-detail-description')).toContainText(/MODE HISTOIRE/i);
    await expect(page.locator('#btn-panneau-detail-secondaire')).toContainText(/MODE HISTOIRE/i);
});

test('audit B — codex chemins caches verrouille avec condition', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    await page.locator('.codex-onglet[data-chapitre="chroniques"]').click();
    await expect(page.locator('.codex-item[data-id="chemins_caches"]')).toBeVisible({
        timeout: 10000,
    });
    const entree = page.locator('.codex-item[data-id="chemins_caches"]');
    await expect(entree).toHaveClass(/verrouille/);
    await expect(entree.locator('.codex-item-cond')).toContainText(/Archiviste/i);
});

test('audit B — carte histoire compteur et modal Trame', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_FIN_VRAIE_PRET);
    await expect(page.locator('#histoire-prog-trame')).toContainText(/TRAME\s+2\/4/i);
    await page.locator('#btn-histoire-trame').click();
    await expect(page.locator('#overlay-trame-conditions')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#histoire-trame-detail-liste li')).toHaveCount(4);
    await page.locator('#btn-trame-fermer').click();
    await expect(page.locator('#overlay-trame-conditions')).toHaveClass(/element-masque/);
});

test('audit B — briefing Distorsion sur monde finale', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await selectionnerMondeCarte(page, 'monde_boss_4');
    await expect(page.locator('#btn-histoire-briefing-distorsion')).not.toHaveClass(
        /element-masque/
    );
    await page.locator('#btn-histoire-briefing-distorsion').click({ force: true });
    await expect(page.locator('#overlay-tutoriel')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#tutoriel-titre')).toContainText(/DISTORSION/i);
});

test('audit B — game over histoire avertissement continue Trame', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_FIN_VRAIE_PRET);
    await page.goto('/?neoTest=1');
    await attendreApplicationPrete(page);

    await page.evaluate(() => {
        window.__NEO_TEST__?.simulerGameOverBossDistorsion?.();
    });

    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#go-avertissement-trame')).toContainText(/Continue gratuit/i);
    await expect(page.locator('#btn-continue-boss')).toBeVisible();
});
