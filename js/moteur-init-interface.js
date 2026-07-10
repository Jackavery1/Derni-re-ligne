import { chargerStats } from './achievements/achievements-stats.js';
import { planifierBoucle } from './boucle-jeu.js';
import { mettreAJourAffichageRecord, chargerProgression } from './rendu/hud-jeu.js';
import { appliquerThemeBiome } from './rendu/themes-biome.js';
import { afficherEcranDiffere } from './ui/navigation-lazy.js';
import { initialiserInput } from './logique/input-jeu.js';
import { adapterInterface, initialiserLayout } from './rendu/layout-jeu.js';
import { initPiecesFond } from './menu-fond.js';
import { ECRANS, obtenirBiomeActif } from './etat/store-jeu.js';
import { initialiserBoutons } from './ui/ui-init.js';

function initialiserModulesDifferees() {
    void import('./histoire/histoire-mondes.js').then(({ rafraichirEtatHistoire }) =>
        rafraichirEtatHistoire()
    );
    void import('./ui/ui-panneau-objectifs.js').then(({ initialiserUiObjectifs }) =>
        initialiserUiObjectifs()
    );
    void import('./logique/dev-ecouteur.js').then(({ initialiserEcouteurDev }) =>
        initialiserEcouteurDev()
    );
    void import('./ui/tutoriel.js').then(({ initialiserTutoriel }) => initialiserTutoriel());
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
