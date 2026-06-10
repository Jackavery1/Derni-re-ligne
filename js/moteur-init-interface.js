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
import { demarrerJeu } from './partie.js';
import { ECRANS, obtenirBiomeActif, definirBiomeActif } from './store-jeu.js';
import { sauvegarderBiomeActif } from './progression.js';
import { initialiserBoutons } from './ui-init.js';
import { initialiserUiObjectifs } from './ui-panneau-objectifs.js';
import { initialiserTutoriel } from './tutoriel.js';
import { obtenirActions } from './actions-jeu.js';
import { exposerNeoTestApi } from './neo-test-api.js';

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
        document.body.dataset.neoTestReady = '1';
        exposerNeoTestApi({
            terminerPartie: (victoire) => obtenirActions().terminerPartie?.(victoire),
            demarrerPartieLibre: (biomeId = 'classique') => {
                definirBiomeActif(biomeId);
                sauvegarderBiomeActif(biomeId);
                demarrerJeu();
            },
        });
    }
}
