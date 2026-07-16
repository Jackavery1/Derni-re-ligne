import { BIOMES } from '../config/biomes.js';
import { annulerMeteo } from './meteo.js';
import { AudioMoteur } from '../audio/audio.js';
import {
    calculerPointsProgression,
    sauvegarderNiveauGlobal,
    sauvegarderRecordSprintBiome,
} from '../io/progression.js';
import {
    etat,
    obtenirBiomeActif,
    obtenirNiveauGlobal,
    ajouterNiveauGlobal,
    ECRANS,
    store,
} from '../etat/store-jeu.js';
import {
    appliquerHumeurMascotte,
    reagirRoboGameOver,
    afficherEcran,
    sauvegarderRecord,
    mettreAJourAffichageRecord,
    obtenirTempsEcoule,
} from '../ui/ecrans-ui.js';
import { planifierBoucle } from './boucle-jeu.js';
import { afficherMelodieGameOver } from '../audio/melodie.js';
import { finaliserPartieCommune } from './partie-fin-commun.js';
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
import { vibrerFinPartie } from '../audio/haptique.js';
import { arreterFondBiome } from '../rendu/rendu-fond-biome.js';
import { planifierSoumissionLeaderboard } from '../io/leaderboard-cloud.js';
import {
    appliquerStatsOracleFinPartie,
    remplirEcranGameOver,
    afficherActionsFinHistoire,
} from '../ui/partie-fin-ecran-go.js';

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

/** Délai avant affichage game over (laisse le feedback audio/haptique se lire). */
export const DELAI_GAME_OVER_MS = 280;

/** @param {boolean} [victoire] @param {{ immediat?: boolean }} [options] */
export function terminerPartie(victoire = false, options = {}) {
    const { immediat = false } = options;
    if (modeCoopEnCours()) return;
    arreterFondBiome();
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
    AudioMoteur.arreterMusique(200);
    if (victoire) {
        appliquerHumeurMascotte('excite');
    } else {
        reagirRoboGameOver();
    }
    if (!victoire) setTimeout(() => AudioMoteur.son('game_over'), 250);
    else setTimeout(() => AudioMoteur.son('niveau'), 250);
    vibrerFinPartie(victoire);
    const annonceVictoire = modeHistoireEnCours()
        ? 'Monde termine ! Victoire'
        : etat.modeJeu === 'sprint'
          ? 'Sprint termine ! Victoire'
          : 'Partie terminee ! Victoire';

    const textes = BIOMES[obtenirBiomeActif()]?.textes ?? BIOMES.classique.textes;
    const titreGo = document.querySelector('#ecran-game-over .go-titre');
    if (titreGo) titreGo.textContent = victoire ? 'VICTOIRE !' : textes.gameOver;

    const scoreFinal = obtenirScoreFinalOracle();
    appliquerStatsOracleFinPartie(scoreFinal);

    const nouveauRecord = modeHistoireEnCours() ? false : sauvegarderRecord(scoreFinal);
    const nouveauRecordSprint = _enregistrerRecordsFinPartie(victoire, scoreFinal);
    _soumettreLeaderboardSiRecord(nouveauRecord, nouveauRecordSprint, scoreFinal);
    _appliquerProgressionFinPartie(scoreFinal);

    mettreAJourAffichageRecord();
    remplirEcranGameOver(scoreFinal, nouveauRecord);

    finaliserPartieCommune({
        score: scoreFinal,
        lignes: etat.lignes,
        biomeId: obtenirBiomeActif(),
        victoire,
        annonceVictoire,
        annonceDefaite: 'Partie terminee',
    });
    afficherActionsFinHistoire(victoire);

    if (!victoire) {
        appliquerRepliqueGameOverBoss(true, bossIdDefaite);
    } else {
        appliquerRepliqueGameOverBoss(false);
    }

    const montrerGameOver = () => {
        afficherEcran(ECRANS.GAME_OVER);
        planifierBoucle();
    };
    if (immediat) {
        montrerGameOver();
    } else {
        setTimeout(montrerGameOver, DELAI_GAME_OVER_MS);
    }

    setTimeout(() => afficherMelodieGameOver(), 400);
}
