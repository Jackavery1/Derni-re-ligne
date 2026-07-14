import { test } from '@playwright/test';
import { ouvrirCarteHistoire } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import {
    OPTIONS_CAMPAGNE_PR,
    parcourirMondesCampagneNarratif,
} from './helpers-campagne-narratif.mjs';

const CAMPAGNE_PR = ['monde_prologue', 'monde_lave'];

test('audit D PR — campagne courte prologue + lave (fixtures D9)', async ({ page }) => {
    test.setTimeout(120_000);
    const etatDepart = {
        ...ETAT_HISTOIRE_VIDE,
        mondesDejaMontres: [],
    };
    await ouvrirCarteHistoire(page, etatDepart);
    await parcourirMondesCampagneNarratif(page, CAMPAGNE_PR, OPTIONS_CAMPAGNE_PR);
});
