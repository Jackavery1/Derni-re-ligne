import { readFileSync, writeFileSync } from 'fs';

const lines = readFileSync('js/achievements.js', 'utf8').split('\n');

const statsHeader = `import { logger } from '../../js/logger.js';
import {
    lireStockageJson,
    ecrireStockageJson,
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
} from '../../js/io/progression.js';
import { store } from '../../js/etat/store-core.js';
import { obtenirBiomeActif } from '../../js/etat/store-jeu.js';
import { melodie } from '../../js/audio/melodie.js';
import { creerFileNotifications } from '../../js/ui/notifications-file.js';
import { reinitialiserStatsAchievementsHistoire } from '../../js/achievements/achievements-histoire.js';
import { ACHIEVEMENTS } from '../../js/achievements-donnees.js';
import { sansAccentsE } from '../../js/logique/texte-jeu.js';
import { modeHistoireEnCours } from '../../js/etat/mode-histoire.js';

`;

const uiHeader = `import { ACHIEVEMENTS } from '../../js/achievements-donnees.js';
import { sansAccentsE } from '../../js/logique/texte-jeu.js';
import { statsGlobales } from '../../js/achievements/achievements-stats.js';
import { rendreIconeSurCanvas, rendreIconeGlitchSurCanvas } from '../../js/rendu/icones-pixel.js';
import {
    obtenirIdIconeAchievement,
    obtenirAccentCategorie,
    obtenirAccentFiltre,
    obtenirLibelleCategorieFiltre,
    obtenirTexteVerrouille,
    obtenirTexteVerrouillePanneau,
} from '../../js/achievements/achievements-icones-map.js';
import { obtenirProgressionAchievement } from '../../js/achievements/achievements-progres.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from '../../js/ui/ui-panneau-detail.js';

`;

writeFileSync('js/achievements-stats.js', statsHeader + lines.slice(35, 344).join('\n') + '\n');
writeFileSync('js/achievements-ui.js', uiHeader + lines.slice(345).join('\n') + '\n');

writeFileSync(
    'js/achievements.js',
    `export { ACHIEVEMENTS } from '../../js/achievements-donnees.js';
export {
    statsGlobales,
    chargerStats,
    reinitialiserStatsGlobales,
    sauvegarderStats,
    initStatsPartie,
    majStatsLignesEffacees,
    majStatsScorePartie,
    majStatsRelique,
    majStatsMeteo,
    majStatsReactionRobo,
    finaliserStatsPartie,
    verifierAchievements,
} from '../../js/achievements/achievements-stats.js';
export { genererGalerieAchievements, ouvrirExploitMemorial } from '../../js/achievements/achievements-ui.js';
`
);

console.log('Split achievements OK');
