import { ETAT_HISTOIRE_VIDE } from '../histoire-donnees.js';
import { sauvegarderEtatHistoire } from '../io/progression-histoire.js';
import { supprimerStockageProgression } from '../io/progression-stockage.js';
import { ecrireStockage } from '../io/progression-stockage.js';
import { sauvegarderBiomeActif } from '../io/progression-records.js';
import { reinitialiserStatsGlobales } from '../achievements.js';
import { viderCodexPersiste } from '../codex.js';
import { reinitialiserTutoriels } from '../ui/tutoriel.js';
import { reinitialiserIntroHistoire } from './histoire-intro.js';
import { rafraichirEtatHistoire } from './histoire-mondes.js';
import { mettreAJourVisibiliteModesDebloques } from '../ui/deblocage-ui.js';
import { mettreAJourMenuCampagneTitre } from './menu-titre-campagne.js';
import { logger } from '../io/logger.js';

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
