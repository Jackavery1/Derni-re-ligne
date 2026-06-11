import { ETAT_HISTOIRE_VIDE } from './histoire-donnees.js';
import { sauvegarderEtatHistoire } from './progression-histoire.js';
import { supprimerStockageProgression } from './progression-stockage.js';
import { ecrireStockage } from './progression-stockage.js';
import { sauvegarderBiomeActif } from './progression-records.js';
import { reinitialiserStatsGlobales } from './achievements.js';
import { viderCodexPersiste } from './codex.js';
import { reinitialiserTutoriels } from './tutoriel.js';
import { reinitialiserIntroHistoire } from './histoire-intro.js';
import { rafraichirEtatHistoire } from './histoire-manager.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { mettreAJourMenuCampagneTitre } from './menu-titre-campagne.js';
import { logger } from './logger.js';

/** Remet à zéro toute la progression (campagne, modes, intro, codex, achievements, records). */
export function reinitialiserCampagneComplete() {
    supprimerStockageProgression();
    reinitialiserIntroHistoire();
    reinitialiserTutoriels();
    reinitialiserStatsGlobales();
    viderCodexPersiste();

    const etatVide = structuredClone(ETAT_HISTOIRE_VIDE);
    sauvegarderEtatHistoire(etatVide);
    ecrireStockage('derniereLigne_niveauGlobal', '0');
    sauvegarderBiomeActif('classique');

    rafraichirEtatHistoire();
    mettreAJourVisibiliteModesDebloques();
    mettreAJourMenuCampagneTitre();
    logger.info('[campagne] reinitialisation complete');
}
