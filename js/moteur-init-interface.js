import { chargerStats } from './achievements-stats.js';
import { planifierBoucle } from './boucle-jeu.js';
import { mettreAJourAffichageRecord, chargerProgression } from './hud-jeu.js';
import { appliquerThemeBiome } from './themes-biome.js';
import { afficherEcranDiffere } from './navigation-lazy.js';
import { initialiserInput } from './input-jeu.js';
import { adapterInterface, initialiserLayout } from './layout-jeu.js';
import { initPiecesFond } from './menu-fond.js';
import { ECRANS, obtenirBiomeActif } from './store-jeu.js';
import { initialiserBoutons } from './ui-init.js';

function initialiserModulesDifferees() {
    void import('./histoire-manager.js').then(({ rafraichirEtatHistoire }) =>
        rafraichirEtatHistoire()
    );
    void import('./ui-panneau-objectifs.js').then(({ initialiserUiObjectifs }) =>
        initialiserUiObjectifs()
    );
    void import('./mode-developpeur.js').then(({ initialiserModeDeveloppeur }) =>
        initialiserModeDeveloppeur()
    );
    void import('./tutoriel.js').then(({ initialiserTutoriel }) => initialiserTutoriel());
}

export function initialiserInterfaceMoteur() {
    chargerStats();
    adapterInterface();
    initialiserLayout();
    chargerProgression();
    appliquerThemeBiome(obtenirBiomeActif());
    mettreAJourAffichageRecord();
    initPiecesFond();
    initialiserInput();
    initialiserBoutons();
    initialiserModulesDifferees();
    afficherEcranDiffere(ECRANS.TITRE);
    planifierBoucle();
}
