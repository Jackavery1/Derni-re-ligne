import { readFileSync, writeFileSync } from 'fs';

const lines = readFileSync('js/achievements.js', 'utf8').split('\n');

const statsHeader = `import { logger } from './logger.js';
import {
    lireStockageJson,
    ecrireStockageJson,
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
} from './progression.js';
import { store } from './store-core.js';
import { obtenirBiomeActif } from './store-jeu.js';
import { melodie } from './melodie.js';
import { creerFileNotifications } from './notifications-file.js';
import { reinitialiserStatsAchievementsHistoire } from './achievements-histoire.js';
import { ACHIEVEMENTS } from './achievements-donnees.js';
import { sansAccentsE } from './texte-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';

`;

const uiHeader = `import { ACHIEVEMENTS } from './achievements-donnees.js';
import { sansAccentsE } from './texte-jeu.js';
import { statsGlobales } from './achievements-stats.js';
import { rendreIconeSurCanvas, rendreIconeGlitchSurCanvas } from './icones-pixel.js';
import {
    obtenirIdIconeAchievement,
    obtenirAccentCategorie,
    obtenirAccentFiltre,
    obtenirLibelleCategorieFiltre,
    obtenirTexteVerrouille,
    obtenirTexteVerrouillePanneau,
} from './achievements-icones-map.js';
import { obtenirProgressionAchievement } from './achievements-progres.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from './ui-panneau-detail.js';

`;

writeFileSync('js/achievements-stats.js', statsHeader + lines.slice(35, 344).join('\n') + '\n');
writeFileSync('js/achievements-ui.js', uiHeader + lines.slice(345).join('\n') + '\n');

writeFileSync(
    'js/achievements.js',
    `export { ACHIEVEMENTS } from './achievements-donnees.js';
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
} from './achievements-stats.js';
export { genererGalerieAchievements, ouvrirExploitMemorial } from './achievements-ui.js';
`
);

console.log('Split achievements OK');
