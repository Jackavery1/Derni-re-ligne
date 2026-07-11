import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('js/archi-jeu.js', 'utf8').split('\n');

function slice(from, to) {
    return src.slice(from - 1, to).join('\n');
}

const partieHeader = `import { BIOMES } from '../../js/config/config.js';
import { AudioMoteur } from '../../js/audio/audio.js';
import { creerPlateau, lierCouleursTetrominos } from '../../js/logique/piece-jeu.js';
import { particules, definirBiomeActif, ECRANS } from '../../js/etat/store-jeu.js';
import { lireStockage, ecrireStockage } from '../../js/io/progression.js';
import { planifierBoucle, suspendreBoucleSolo } from '../../js/logique/boucle-jeu.js';
import { mettreAJourParticules } from '../../js/rendu/particules-jeu.js';
import { dessinerPreview } from '../../js/rendu/rendu-jeu.js';
import { obtenirCanvas } from '../../js/logique/dom-utils.js';
import {
    cacherEcrans,
    afficherEcran,
    retournerAuMenuTitre,
    appliquerThemeBiome,
} from '../../js/ui/ecrans-ui.js';
import { arreterConstellation } from '../../js/logique/constellation.js';
import { arreterAnimationMenu } from '../../js/rendu/menu-fond.js';
import { basculerOracle, oracle } from '../../js/logique/oracle-jeu.js';
import { statsGlobales, sauvegarderStats, verifierAchievements } from '../../js/achievements.js';
import { obtenirTousNiveauxArchi } from '../../js/logique/archi-generateur.js';
import {
    archi,
    historiqueArchi,
    archi_parserSilhouette,
    archi_prochainePiece,
    archi_calculerScoreTempsReel,
    archi_calculerEtoiles,
    archi_reinitialiserEtatNiveau,
} from '../../js/logique/archi-logique.js';
import { archi_rendreFrame } from '../../js/rendu/archi-rendu.js';
import { adapterInterfaceArchi } from '../../js/rendu/layout-jeu.js';
`;

const selectionHeader = `import { BIOMES } from '../../js/config/config.js';
import { lireStockage } from '../../js/io/progression.js';
import { afficherEcran, cacherEcrans } from '../../js/ui/ecrans-ui.js';
import { ECRANS } from '../../js/etat/store-jeu.js';
import { statsGlobales } from '../../js/achievements.js';
import { obtenirTousNiveauxArchi } from '../../js/logique/archi-generateur.js';
import { archi, archi_calculerEtoiles } from '../../js/logique/archi-logique.js';
import { modeDevActif } from '../../js/logique/mode-dev-etat.js';
import { sansAccentsE } from '../../js/logique/texte-jeu.js';
import { rendreIconeSurCanvas } from '../../js/rendu/icones-pixel.js';
import { dessinerSilhouetteApercu } from '../../js/rendu/archi-apercu-silhouette.js';
import { obtenirIdIconeBiomeArchi } from '../../js/rendu/archi-icones-map.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from '../../js/ui/ui-panneau-detail.js';
import {
    appliquerFiltreDifficulteArchi,
    initialiserFiltreDifficulteArchi,
    reinitialiserFiltreDifficulteArchiParDefaut,
} from '../../js/logique/archi-filtre-difficulte.js';
import { demarrerArchi } from '../../js/logique/archi-partie.js';
`;

writeFileSync('js/archi-partie.js', `${partieHeader}\n${slice(52, 286)}\n`);
writeFileSync('js/archi-selection.js', `${selectionHeader}\n${slice(288, 492)}\n`);

writeFileSync(
    'js/archi-jeu.js',
    `export { archi, modeArchiActif } from '../../js/logique/archi-logique.js';
export {
    demarrerArchi,
    archi_mettreAJourInventaireUI,
    archi_mettreAJourScore,
    archi_terminerNiveau,
    archi_afficherResultat,
    archi_basculerPause,
    archi_reinitialiserNiveau,
    quitterModeArchi,
} from '../../js/logique/archi-partie.js';
export { ouvrirDetailNiveauArchi, archi_afficherSelection } from '../../js/logique/archi-selection.js';
`
);

console.log('Split archi-jeu OK');
