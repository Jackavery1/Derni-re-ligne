/** Barrel E2E — réexporte les helpers par flux (page, partie, coop, histoire, narratif). */

export {
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_AVANT_BOSS_SENTINELLE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_AVANT_BOSS_AVANTGARDE,
    ETAT_FIN_SECRETE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_INFERNO_PRET,
    ETAT_FIN_VRAIE_PRET,
    ETAT_OCEAN_FRAGMENT_PRET,
    ETAT_FORET_FRAGMENT_PRET,
    ETAT_GLACE_FRAGMENT_PRET,
    ETAT_CYBER_LABO_PRET,
    ETAT_AVANT_DESERT,
    ETAT_PARADOXE_DEBLOQUE,
    ETAT_AVANT_FIN_VRAIE,
    ETAT_AVANT_FIN_NORMALE,
    ETAT_FIN_NORMALE_PRET,
    ETAT_ENTREE_COSMOS,
    ETAT_ENTREE_VIDE,
    ETAT_ENTREE_TRAME,
    MONDES_CAMPAGNE_PRINCIPALE,
    MONDES_SECRETS_FIN_SECRETE,
} from './etats-histoire.mjs';

export {
    boutonEstVisible,
    elementAClasse,
    preparerPremierLancement,
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    fermerInfobulleContexteSiVisible,
} from './helpers-page.mjs';

export {
    fermerPanneauDetailSiOuvert,
    activerPausePartie,
    activerPausePartieTactile,
    selectionnerBiomeClavier,
    attendrePartieVisible,
    passerFluxLancementMonde,
    demarrerPartie,
    demarrerPartieViaClavier,
    terminerPartieCourante,
} from './helpers-partie.mjs';

export {
    activerPauseCoopTactile,
    demarrerPartieCoop,
    terminerPartieCoopCourante,
} from './helpers-coop.mjs';

export {
    ouvrirIntroHistoire,
    attendreRenduCarteHistoire,
    fermerRecapPostMonde,
    ouvrirCarteHistoire,
    lancerMondeBossBrasier,
    passerCutsceneHistoire,
} from './helpers-histoire.mjs';

export { PROFILS_IPHONE_SAFE_AREA, appliquerSafeAreaIphone } from './helpers-iphone-safe-area.mjs';

export {
    MARQUEURS_NARRATIFS_CAMPAGNE,
    SCENES_VICTOIRE_BOSS,
    lireTexteCutsceneActive,
    cliquerCutsceneSuivant,
    attendreCutsceneVictoireBoss,
    avancerCutsceneJusquaPivot,
    attendreSceneCutsceneActive,
    simulerVictoireBossHistoire,
    assertHumeurPortraitCutscene,
    parcourirVictoireBossJusquaPivot,
    attendreJournalHistoire,
    lancerMondeDepuisCarte,
    parcourirFluxPostVictoireAvecAssertions,
    viderOverlaysHistoireRapide,
    passerCutsceneEntiere,
    terminerCutscenesVersEcranFin,
    obtenirScenePostMonde,
    attendreFinOverlaysHistoire,
    attendreTypewriterInactif,
} from './helpers-narratif.mjs';

export {
    installerJournalVibrations,
    preparerSelectionPremiereVisiteModes,
    selectionnerBiomeVerrouilleConstellation,
    selectionnerMondeCarte,
    attendreBarreModesPretes,
    reinitialiserInfobulleMode,
    attendreInfobulleMode,
    basculerDefiJourDepuisSelection,
    basculerSprintDepuisSelection,
    basculerOracleDepuisSelection,
    basculerCoopDepuisSelection,
} from './helpers-audit-b.mjs';

/** Filtre les violations Axe bloquantes (hors contraste optionnel). */
export function filtrerViolationsCritiques(violations, { inclureContraste = false } = {}) {
    return violations.filter((v) => {
        if (v.impact === 'critical') return true;
        if (v.impact === 'serious' && v.id !== 'color-contrast') return true;
        if (inclureContraste && v.id === 'color-contrast') return true;
        return false;
    });
}
