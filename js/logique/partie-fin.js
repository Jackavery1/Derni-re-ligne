import { BIOMES } from '../config/biomes.js';
import { annulerMeteo } from './meteo.js';
import {
    calculerPointsProgression,
    sauvegarderNiveauGlobal,
    sauvegarderRecordSprintBiome,
    sauvegarderRecordBiome,
} from '../io/progression.js';
import {
    etat,
    obtenirBiomeActif,
    obtenirNiveauGlobal,
    ajouterNiveauGlobal,
    store,
} from '../etat/store-jeu.js';
import { obtenirTempsEcoule } from './temps-partie.js';
import { finaliserPartieCommune } from './partie-fin-commun.js';
import { DELAI_GAME_OVER_MS } from './partie-fin-constantes.js';
import { modeCoopEnCours } from '../etat/registre-modes.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { defiJourActif } from './mode-defi-jour.js';
import { obtenirDefiDuJour, enregistrerScoreDefiJour } from './defi-jour.js';
import { enregistrerTopOut } from './gestionnaire-difficulte.js';
import {
    bossEstActif,
    arreterBoss,
    obtenirBossIdActif,
    appliquerRepliqueGameOverBoss,
} from './boss-jeu.js';
import { onGameOverHistoire } from '../histoire/mecaniques-histoire.js';
import { obtenirScoreFinalOracle } from './oracle-jeu.js';
import { planifierSoumissionLeaderboard } from '../io/leaderboard-cloud.js';
import { emettre } from '../etat/bus-jeu.js';

function _soumettreLeaderboardSiRecord(nouveauRecordMarathon, nouveauRecordSprint, scoreFinal) {
    if (modeHistoireEnCours() || modeCoopEnCours()) return;
    if (!nouveauRecordMarathon && !nouveauRecordSprint) return;
    const mode = etat.modeJeu === 'sprint' ? 'sprint' : 'marathon';
    planifierSoumissionLeaderboard({
        mode,
        biome: obtenirBiomeActif(),
        score: scoreFinal,
        sprintMs: mode === 'sprint' ? obtenirTempsEcoule() : null,
        niveau: etat.niveau,
    });
}

function _enregistrerRecordsFinPartie(victoire, scoreFinal) {
    let nouveauRecordSprint = false;
    if (victoire && etat.modeJeu === 'sprint' && !modeHistoireEnCours()) {
        nouveauRecordSprint = sauvegarderRecordSprintBiome(
            obtenirBiomeActif(),
            obtenirTempsEcoule()
        );
    }
    if (victoire && defiJourActif && !modeHistoireEnCours()) {
        const defi = obtenirDefiDuJour();
        if (obtenirBiomeActif() === defi.biomeId && etat.lignes >= defi.objectifLignes) {
            enregistrerScoreDefiJour(defi.date, scoreFinal);
        }
    }
    return nouveauRecordSprint;
}

function _appliquerProgressionFinPartie(scoreFinal) {
    const points = calculerPointsProgression(scoreFinal, etat.lignes);
    if (points > 0) {
        ajouterNiveauGlobal(points);
        sauvegarderNiveauGlobal(obtenirNiveauGlobal());
    }
}

export { DELAI_GAME_OVER_MS };

/** @param {boolean} [victoire] @param {{ immediat?: boolean }} [options] */
export function terminerPartie(victoire = false, options = {}) {
    const { immediat = false } = options;
    if (modeCoopEnCours()) return;
    emettre('fond-biome:arreter');
    const bossIdDefaite = !victoire ? obtenirBossIdActif() : null;
    if (bossEstActif() && !victoire) {
        arreterBoss();
    }
    etat.estEnCours = false;
    if (modeHistoireEnCours() && !victoire) {
        enregistrerTopOut();
        onGameOverHistoire(etat.lignes, store.histoire.mondeActuel ?? '');
    }
    annulerMeteo();

    const annonceVictoire = modeHistoireEnCours()
        ? 'Monde termine ! Victoire'
        : etat.modeJeu === 'sprint'
          ? 'Sprint termine ! Victoire'
          : 'Partie terminee ! Victoire';

    const textes = BIOMES[obtenirBiomeActif()]?.textes ?? BIOMES.classique.textes;
    const titreGo = victoire ? 'VICTOIRE !' : textes.gameOver;

    const scoreFinal = obtenirScoreFinalOracle();
    const nouveauRecord = modeHistoireEnCours()
        ? false
        : sauvegarderRecordBiome(obtenirBiomeActif(), scoreFinal, etat.niveau);
    const nouveauRecordSprint = _enregistrerRecordsFinPartie(victoire, scoreFinal);
    _soumettreLeaderboardSiRecord(nouveauRecord, nouveauRecordSprint, scoreFinal);
    _appliquerProgressionFinPartie(scoreFinal);

    finaliserPartieCommune({
        score: scoreFinal,
        lignes: etat.lignes,
        biomeId: obtenirBiomeActif(),
        victoire,
        annonceVictoire,
        annonceDefaite: 'Partie terminee',
    });

    if (!victoire) {
        appliquerRepliqueGameOverBoss(true, bossIdDefaite);
    } else {
        appliquerRepliqueGameOverBoss(false);
    }

    emettre('partie:finie', {
        victoire,
        immediat,
        titreGo,
        scoreFinal,
        nouveauRecord,
    });
}
