export { dessinerCellule, mettreAJourAmbiante } from './rendu-cellule.js';

export {
    declencherSecousse,
    getDecalageSecousse,
    mettreAJourSecousse,
    dessinerFlashVerrou,
    dessinerFlashLignes,
    demarrerTransition,
    mettreAJourTransition,
    afficherTexteFlottant,
    mettreAJourTextesFlottants,
    dessinerTextesFlottants,
} from './rendu-fx.js';

export {
    initParticulesAmbiance,
    mettreAJourParticulesAmbiance,
    dessinerFondBiome,
} from './rendu-ambiance.js';

export {
    dessinerPlateau,
    rendreFrameJeu,
    dessinerPieceFantome,
    dessinerPieceActive,
    dessinerParticules,
    dessinerOverlayBraise,
    obtenirYHautTas,
} from './rendu-plateau.js';

export { dessinerPreview, dessinerFileNext } from './rendu-previews.js';

import {
    dessinerRobo,
    demarrerBoucleRobo,
    arreterBoucleRobo,
    definirHumeurRobo,
    definirArcEnCiel,
    definirCouronne,
    convertirHumeurVersCanvas,
} from './rendu-robo.js';

export {
    dessinerRobo,
    demarrerBoucleRobo,
    arreterBoucleRobo,
    definirHumeurRobo,
    definirArcEnCiel,
    definirCouronne,
    convertirHumeurVersCanvas,
};

export function dessinerDecoRobo(actif) {
    definirArcEnCiel(actif);
}
