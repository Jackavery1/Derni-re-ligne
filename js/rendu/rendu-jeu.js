/**
 * Barrel public du rendu Canvas — cellules, FX, ambiance, plateau, previews et mascotte.
 * Les modules bas niveau (`rendu-plateau.js`, `rendu-fx.js`…) ne doivent pas être
 * importés directement depuis le moteur : passer par ce fichier.
 */
export { dessinerCellule, mettreAJourAmbiante } from './rendu-cellule.js';

export {
    declencherSecousse,
    obtenirDecalageSecousse,
    mettreAJourSecousse,
    dessinerFlashVerrou,
    dessinerFlashLignes,
    declencherFlashTopout,
    dessinerFlashTopout,
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

export {
    dessinerRobo,
    demarrerBoucleRobo,
    arreterBoucleRobo,
    definirHumeurRobo,
    definirArcEnCiel,
} from './rendu-robo.js';
