import { chargerStats } from './achievements.js';
import { rechargerCodex, initialiserCodexUI } from './codex.js';
import { initialiserInputArchi } from './archi-input.js';
import { initialiserInputCoop } from './coop-input.js';
import { planifierBoucle } from './boucle-jeu.js';
import {
    afficherEcran,
    appliquerThemeBiome,
    mettreAJourAffichageRecord,
    chargerProgression,
} from './ecrans-ui.js';
import { rafraichirEtatHistoire } from './histoire-manager.js';
import { initialiserInput } from './input-jeu.js';
import { adapterInterface, initialiserLayout } from './layout-jeu.js';
import { initialiserModeDeveloppeur } from './mode-developpeur.js';
import { initPiecesFond } from './menu-fond.js';
import { initialiserOptions } from './options-ui.js';
import { demarrerBoucleRobo } from './rendu-robo.js';
import { ECRANS, obtenirBiomeActif } from './store-jeu.js';
import { initialiserBoutons } from './ui-init.js';
import { initialiserUiObjectifs } from './ui-panneau-objectifs.js';
import { initialiserTutoriel } from './tutoriel.js';
import { obtenirActions } from './actions-jeu.js';

export function initialiserInterfaceMoteur() {
    chargerStats();
    rafraichirEtatHistoire();
    adapterInterface();
    initialiserLayout();
    chargerProgression();
    rechargerCodex();
    appliquerThemeBiome(obtenirBiomeActif());
    mettreAJourAffichageRecord();
    initPiecesFond();
    initialiserOptions();
    initialiserInput();
    initialiserInputCoop();
    initialiserInputArchi();
    initialiserBoutons();
    initialiserCodexUI();
    initialiserUiObjectifs();
    initialiserModeDeveloppeur();
    afficherEcran(ECRANS.TITRE);
    initialiserTutoriel();
    planifierBoucle();
    demarrerBoucleRobo();

    if (typeof window !== 'undefined') {
        /** @type {any} */ (window).__NEO_TEST__ = {
            terminerPartie: (victoire) => obtenirActions().terminerPartie?.(victoire),
        };
        document.body.dataset.neoTestReady = '1';
    }
}
