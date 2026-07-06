import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    attendreCutsceneVictoireBoss,
    avancerCutsceneJusquaPivot,
    simulerVictoireBossHistoire,
    assertHumeurPortraitCutscene,
    parcourirVictoireBossJusquaPivot,
    lancerMondeDepuisCarte,
    ouvrirIntroHistoire,
    ETAT_ENTREE_COSMOS,
    ETAT_ENTREE_VIDE,
    ETAT_ENTREE_TRAME,
} from './helpers.mjs';
import {
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_AVANT_BOSS_SENTINELLE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_AVANT_BOSS_AVANTGARDE,
    ETAT_AVANT_FIN_VRAIE,
    ETAT_AVANT_FIN_NORMALE,
    ETAT_AVANT_FIN_SECRETE,
} from './etats-histoire.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

test('victoire Brasier — transition seuil_brasier → labo (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await simulerVictoireBossHistoire(page, 'monde_boss_1');
    await attendreCutsceneVictoireBoss(page);
    await parcourirVictoireBossJusquaPivot(page, 'brasier');
});

test('victoire Brasier — humeur ROBO triste (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await simulerVictoireBossHistoire(page, 'monde_boss_1');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Moi non plus je ne sais pas comment m'arrêter/i);
    await assertHumeurPortraitCutscene(page, 'robo', 'triste');
});

test('entree prologue — humeur VERA douce (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 20000,
    });
    await avancerCutsceneJusquaPivot(page, /Robo, tu m'entends/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'douce');
});

test('entree prologue — humeur VERA glitch avant coupure (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 20000,
    });
    await avancerCutsceneJusquaPivot(page, /Ce que tu sais déjà faire/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'glitch');
});

test('victoire Brasier — humeur brasier vacillant (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await simulerVictoireBossHistoire(page, 'monde_boss_1');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Tu\.\.\. tu n'as pas compris/i);
    await assertHumeurPortraitCutscene(page, 'brasier_voix', 'vacillant');
});

test('victoire Sentinelle — transition seuil_sentinelle → labo (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_SENTINELLE);
    await simulerVictoireBossHistoire(page, 'monde_boss_2');
    await attendreCutsceneVictoireBoss(page);
    await parcourirVictoireBossJusquaPivot(page, 'sentinelle');
});

test('victoire Sentinelle — humeur sentinelle vacillant (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_SENTINELLE);
    await simulerVictoireBossHistoire(page, 'monde_boss_2');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Je n'avais pas modélisé cette variable/i);
    await assertHumeurPortraitCutscene(page, 'sentinelle', 'vacillant');
});

test('victoire Archiviste — transition labo et paradoxe acceptable (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await simulerVictoireBossHistoire(page, 'monde_boss_3');
    await attendreCutsceneVictoireBoss(page);
    await parcourirVictoireBossJusquaPivot(page, 'archiviste');
});

test('victoire Archiviste — humeur archiviste vacillant (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await simulerVictoireBossHistoire(page, 'monde_boss_3');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /ERREUR_CRITIQUE/i);
    await assertHumeurPortraitCutscene(page, 'archiviste', 'vacillant');
});

test('victoire Archiviste — humeur vacillant sur replique finale (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await simulerVictoireBossHistoire(page, 'monde_boss_3');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /inventé\. Puis tu es devenu exactement/i);
    await assertHumeurPortraitCutscene(page, 'archiviste', 'vacillant');
});

test('victoire Avant-Garde — transition seuil_avantgarde (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_AVANTGARDE);
    await simulerVictoireBossHistoire(page, 'monde_boss_4');
    await attendreCutsceneVictoireBoss(page);
    await parcourirVictoireBossJusquaPivot(page, 'avantgarde');
});

test('victoire Avant-Garde — humeur avantgarde calme (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_AVANTGARDE);
    await simulerVictoireBossHistoire(page, 'monde_boss_4');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Elle dit bonjour/i);
    await assertHumeurPortraitCutscene(page, 'avantgarde', 'calme');
});

test('victoire Distorsion — cutscene finale fragmentation (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_VRAIE);
    await simulerVictoireBossHistoire(page, 'monde_finale');
    await attendreCutsceneVictoireBoss(page);
    await parcourirVictoireBossJusquaPivot(page, 'distorsion');
});

test('victoire Distorsion — humeur distorsion souffrante (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
    await simulerVictoireBossHistoire(page, 'monde_finale');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Tu m'as vaincue/i);
    await assertHumeurPortraitCutscene(page, 'distorsion', 'souffrante');
});

test('victoire Distorsion fin vraie — humeur distorsion curieuse (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_VRAIE);
    await simulerVictoireBossHistoire(page, 'monde_finale');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Alors que veux-tu/i);
    await assertHumeurPortraitCutscene(page, 'distorsion', 'curieuse');
});

test('victoire Distorsion fin vraie — humeur distorsion apaisee (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_VRAIE);
    await simulerVictoireBossHistoire(page, 'monde_finale');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Ce vide soudain/i);
    await assertHumeurPortraitCutscene(page, 'distorsion', 'apaisee');
});

test('victoire Distorsion fin secrète — humeur VERA douce (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await simulerVictoireBossHistoire(page, 'monde_finale');
    await attendreCutsceneVictoireBoss(page);
    await avancerCutsceneJusquaPivot(page, /Bienvenue dans le monde/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'douce');
});

test('intro Jour 2 554 — humeur VERA inquiete (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirIntroHistoire(page);
    await avancerCutsceneJusquaPivot(page, /J'ai compris trop tard/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'inquiete');
});

test.describe('audit D8 — UI mobile histoire', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE portrait

    test("cutscene et dialogue s'affichent correctement en portrait mobile", async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
        await simulerVictoireBossHistoire(page, 'monde_boss_1');
        await attendreCutsceneVictoireBoss(page);
        await avancerCutsceneJusquaPivot(page, /Moi non plus je ne sais pas comment m'arrêter/i);

        // Vérifier que le texte de dialogue est visible et ne déborde pas
        const dialogueBox = page.locator('#zone-dialogue-cutscene');
        await expect(dialogueBox).toBeVisible();
        await expect(dialogueBox).toHaveCSS('left', /auto/);
        await expect(dialogueBox).toHaveCSS('right', /auto/);
        await expect(dialogueBox).toHaveCSS('width', /.+/); // Vérifier qu'une largeur est définie

        // Vérifier la présence des portraits sans débordement
        await expect(page.locator('#canvas-portrait-gauche')).toBeVisible();
        await expect(page.locator('#canvas-portrait-droite')).toBeVisible();

        // Vérifier que le bouton suivant est visible
        await expect(page.locator('#btn-cutscene-suivant')).toBeVisible();
    });

    test("journal s'affiche correctement en portrait mobile", async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
        await page.evaluate(async () => {
            await window.__NEO_TEST__?.afficherJournalHistoire(
                {
                    numero: 1,
                    titre: 'TRANSMISSION ENDOMMAGEE',
                    sousTitre: 'MESSAGE DE VERA',
                    texte: [
                        {
                            personnage: 'vera',
                            texte: "Robo, si tu lis ça, c'est que j'ai échoué. Le temps s'est fracturé. Je suis désolée. J'aurais dû te dire plus tôt. Le miroir n'est pas ce que tu crois. Il nous observe. Il nous dévore.",
                        },
                        {
                            personnage: 'narrateur',
                            texte: "Le texte est saturé d'interférences. Des bribes s'échappent.",
                        },
                        {
                            personnage: 'vera',
                            texte: "Trouve la ligne. La dernière ligne. Avant qu'il ne soit trop tard.",
                        },
                    ],
                    estEndommage: true,
                    illustration: 'journal_generic_damages',
                },
                () => {}
            );
        });

        const journalOverlay = page.locator('#ecran-histoire-journal');
        await expect(journalOverlay).toBeVisible();

        const journalContenu = page.locator('#histoire-journal-contenu');
        await expect(journalContenu).toBeVisible();
        await expect(journalContenu).toHaveCSS('max-height', /.+/); // S'assurer que la hauteur est limitée
        await expect(journalContenu).toHaveCSS('overflow-y', 'auto'); // S'assurer qu'il y a un scroll

        // Vérifier que le titre et le texte sont visibles
        await expect(page.locator('#histoire-journal-titre')).toBeVisible();
        await expect(page.locator('#histoire-journal-texte')).toBeVisible();
        await expect(page.locator('.histoire-journal-para').first()).toBeVisible();

        // Vérifier que le bouton fermer est visible
        await expect(page.locator('#btn-journal-fermer')).toBeVisible();
    });

    test.use({ viewport: { width: 800, height: 400 } }); // Largeur compacte paysage

    test("carte histoire et panneau de détails s'affichent correctement en paysage mobile", async ({
        page,
    }) => {
        test.setTimeout(120000);
        await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
        await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });

        const panneauDetails = page.locator('#histoire-monde-details');
        await expect(panneauDetails).toBeVisible();
        await expect(panneauDetails).toHaveCSS('bottom', /.+/); // Vérifier qu'il est positionné en bas
        await expect(panneauDetails).toHaveCSS('left', '50%'); // Centré
        await expect(panneauDetails).toHaveCSS('transform', /translateX\(-50%\)/); // Centré
        await expect(panneauDetails).toHaveCSS('max-width', /.+/); // Largeur limitée
        await expect(panneauDetails).toHaveCSS('overflow-y', 'auto'); // Scroll si contenu long

        await expect(page.locator('.histoire-detail-nom')).toBeVisible();
        await expect(page.locator('.bouton-jouer-monde')).toBeVisible();

        // Vérifier que le header et le footer sont visibles
        await expect(page.locator('#histoire-map-header')).toBeVisible();
        await expect(page.locator('#histoire-map-footer')).toBeVisible();
    });
});

test('intro Jour 2 554 — humeur VERA determinee (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirIntroHistoire(page);
    await avancerCutsceneJusquaPivot(page, /Si tu m'entends un jour/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'determinee');
});

test('entree cosmos — humeur distorsion menacante (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_ENTREE_COSMOS);
    await lancerMondeDepuisCarte(page, 'monde_cosmos');
    await avancerCutsceneJusquaPivot(page, /Tu me vois, maintenant/i);
    await assertHumeurPortraitCutscene(page, 'distorsion', 'menacante');
});

test('entree vide — humeur distorsion menacante (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_ENTREE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_vide');
    await assertHumeurPortraitCutscene(page, 'distorsion', 'menacante');
});

test('entree trame — humeur VERA inquiete (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_ENTREE_TRAME);
    await lancerMondeDepuisCarte(page, 'monde_trame');
    await avancerCutsceneJusquaPivot(page, /Tu es là/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'inquiete');
});
