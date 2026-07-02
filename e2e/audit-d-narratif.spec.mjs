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
} from './helpers.mjs';
import {
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_AVANT_BOSS_SENTINELLE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_AVANT_BOSS_AVANTGARDE,
    ETAT_AVANT_FIN_VRAIE,
    ETAT_AVANT_FIN_NORMALE,
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

test('intro Jour 2 554 — humeur VERA inquiete (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirIntroHistoire(page);
    await avancerCutsceneJusquaPivot(page, /J'ai compris trop tard/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'inquiete');
});

test('intro Jour 2 554 — humeur VERA determinee (audit D)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirIntroHistoire(page);
    await avancerCutsceneJusquaPivot(page, /Si tu m'entends un jour/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'determinee');
});
