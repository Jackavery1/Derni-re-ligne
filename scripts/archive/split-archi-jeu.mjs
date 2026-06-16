import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('js/archi-jeu.js', 'utf8').split('\n');

function slice(from, to) {
    return src.slice(from - 1, to).join('\n');
}

const partieHeader = `import { BIOMES } from './config.js';
import { AudioMoteur } from './audio.js';
import { creerPlateau, lierCouleursTetrominos } from './piece-jeu.js';
import { particules, definirBiomeActif, ECRANS } from './store-jeu.js';
import { lireStockage, ecrireStockage } from './progression.js';
import { planifierBoucle, suspendreBoucleSolo } from './boucle-jeu.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { dessinerPreview } from './rendu-jeu.js';
import { obtenirCanvas } from './dom-utils.js';
import {
    cacherEcrans,
    afficherEcran,
    retournerAuMenuTitre,
    appliquerThemeBiome,
} from './ecrans-ui.js';
import { arreterConstellation } from './constellation.js';
import { arreterAnimationMenu } from './menu-fond.js';
import { basculerOracle, oracle } from './oracle-jeu.js';
import { statsGlobales, sauvegarderStats, verifierAchievements } from './achievements.js';
import { obtenirTousNiveauxArchi } from './archi-generateur.js';
import {
    archi,
    historiqueArchi,
    archi_parserSilhouette,
    archi_prochainePiece,
    archi_calculerScoreTempsReel,
    archi_calculerEtoiles,
    archi_reinitialiserEtatNiveau,
} from './archi-logique.js';
import { archi_rendreFrame } from './archi-rendu.js';
import { adapterInterfaceArchi } from './layout-jeu.js';
`;

const selectionHeader = `import { BIOMES } from './config.js';
import { lireStockage } from './progression.js';
import { afficherEcran, cacherEcrans } from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import { statsGlobales } from './achievements.js';
import { obtenirTousNiveauxArchi } from './archi-generateur.js';
import { archi, archi_calculerEtoiles } from './archi-logique.js';
import { modeDevActif } from './mode-dev-etat.js';
import { sansAccentsE } from './texte-jeu.js';
import { rendreIconeSurCanvas } from './icones-pixel.js';
import { dessinerSilhouetteApercu } from './archi-apercu-silhouette.js';
import { obtenirIdIconeBiomeArchi } from './archi-icones-map.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from './ui-panneau-detail.js';
import {
    appliquerFiltreDifficulteArchi,
    initialiserFiltreDifficulteArchi,
    reinitialiserFiltreDifficulteArchiParDefaut,
} from './archi-filtre-difficulte.js';
import { demarrerArchi } from './archi-partie.js';
`;

writeFileSync('js/archi-partie.js', `${partieHeader}\n${slice(52, 286)}\n`);
writeFileSync('js/archi-selection.js', `${selectionHeader}\n${slice(288, 492)}\n`);

writeFileSync(
    'js/archi-jeu.js',
    `export { archi, modeArchiActif } from './archi-logique.js';
export {
    demarrerArchi,
    archi_mettreAJourInventaireUI,
    archi_mettreAJourScore,
    archi_terminerNiveau,
    archi_afficherResultat,
    archi_basculerPause,
    archi_reinitialiserNiveau,
    quitterModeArchi,
} from './archi-partie.js';
export { ouvrirDetailNiveauArchi, archi_afficherSelection } from './archi-selection.js';
`
);

console.log('Split archi-jeu OK');
