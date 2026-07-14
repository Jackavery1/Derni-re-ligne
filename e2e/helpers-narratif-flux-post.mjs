import { expect } from '@playwright/test';
import { MARQUEURS_NARRATIFS_CAMPAGNE } from './helpers-narratif-donnees.mjs';
import {
    attendreOverlayPostVictoire,
    avancerCutsceneUneLigne,
    assertAudioNarratifCutscene,
} from './helpers-narratif-core.mjs';

/** @param {import('@playwright/test').Page} page */
async function fermerTutorielSiVisible(page) {
    const ferme = await page.evaluate(() => {
        const btn = document.getElementById('btn-tutoriel-fermer');
        if (!btn?.offsetParent) return false;
        btn.click();
        return true;
    });
    return ferme;
}

/** @param {import('@playwright/test').Page} page @param {string[]} corpus @param {number} typewriterTimeout @param {boolean} [strictTypewriter] */
async function parcourirCutscenePostVictoire(page, corpus, typewriterTimeout, strictTypewriter) {
    for (let j = 0; j < 80; j++) {
        if (page.isClosed()) break;
        if (await fermerTutorielSiVisible(page)) continue;
        const actif = await page.evaluate(
            () =>
                document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif') ??
                false
        );
        if (!actif) break;
        const { texte: t, avance } = await avancerCutsceneUneLigne(
            page,
            typewriterTimeout,
            strictTypewriter
        );
        if (t.trim()) corpus.push(t);
        if (!avance) {
            const passe = await page.evaluate(() => {
                const btn = document.getElementById('btn-cutscene-passer');
                if (!btn?.offsetParent) return false;
                btn.click();
                return true;
            });
            if (passe) continue;
            break;
        }
    }
}

/** @param {import('@playwright/test').Page} page @param {string[]} corpus */
async function collecterJournalPostVictoire(page, corpus) {
    const texteJournal = await page.evaluate(() => {
        const titre = document.getElementById('histoire-journal-titre')?.textContent ?? '';
        const corps = document.getElementById('histoire-journal-texte')?.textContent ?? '';
        return `${titre}\n${corps}`.trim();
    });
    if (texteJournal) corpus.push(texteJournal);
    await page.evaluate(() => {
        document.getElementById('btn-journal-fermer')?.click();
    });
}

/**
 * Parcourt recap / cutscenes / journal post-victoire et vérifie les marqueurs narratifs.
 * @param {import('@playwright/test').Page} page
 * @param {string} mondeId
 * @param {RegExp[]} [marqueurs]
 * @param {number} [max]
 * @param {{ exigerCorpus?: boolean, typewriterTimeout?: number, strictTypewriter?: boolean, verifierAudio?: boolean }} [options]
 */
export async function parcourirFluxPostVictoireAvecAssertions(
    page,
    mondeId,
    marqueurs = MARQUEURS_NARRATIFS_CAMPAGNE[mondeId] ?? [],
    max = 80,
    options = {}
) {
    const corpus = [];
    const typewriterTimeout = options.typewriterTimeout ?? 3000;

    await attendreOverlayPostVictoire(page);

    if (options.verifierAudio) {
        const cutscene = await page.evaluate(() =>
            document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif')
        );
        if (cutscene) {
            await assertAudioNarratifCutscene(page);
        }
    }

    let pausesConsecutives = 0;

    for (let i = 0; i < max; i++) {
        if (page.isClosed()) break;
        if (await fermerTutorielSiVisible(page)) continue;
        const etat = await page.evaluate(() => ({
            recap: document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible'),
            cutscene: document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('actif'),
            journal: document.getElementById('ecran-histoire-journal')?.classList.contains('actif'),
            tutoriel: !document
                .getElementById('overlay-tutoriel')
                ?.classList.contains('element-masque'),
        }));

        if (etat.tutoriel) {
            await fermerTutorielSiVisible(page);
            continue;
        }

        if (!etat.recap && !etat.cutscene && !etat.journal) {
            pausesConsecutives++;
            if (pausesConsecutives >= 6) break;
            try {
                await attendreOverlayPostVictoire(page, 1500);
            } catch {
                break;
            }
            continue;
        }
        pausesConsecutives = 0;

        if (etat.recap) {
            await page.evaluate(() => {
                document.getElementById('btn-recap-continuer')?.click();
            });
            continue;
        }
        if (etat.cutscene) {
            await parcourirCutscenePostVictoire(
                page,
                corpus,
                typewriterTimeout,
                options.strictTypewriter
            );
            continue;
        }
        if (etat.journal) {
            await collecterJournalPostVictoire(page, corpus);
            continue;
        }
        try {
            await attendreOverlayPostVictoire(page, 1500);
        } catch {
            break;
        }
    }

    const texte = corpus.join('\n');
    if (options.exigerCorpus) {
        expect(texte.trim().length).toBeGreaterThan(8);
    }
    if (marqueurs.length === 0) return;
    for (const re of marqueurs) {
        expect(texte).toMatch(re);
    }
}
