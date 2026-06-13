import { BIOMES } from './config.js';
import { annulerMeteo } from './meteo.js';
import { AudioMoteur } from './audio.js';
import {
    calculerPointsProgression,
    obtenirRecordBiome,
    sauvegarderNiveauGlobal,
    sauvegarderRecordSprintBiome,
} from './progression.js';
import { etat, obtenirBiomeActif, obtenirNiveauGlobal, ajouterNiveauGlobal } from './store-jeu.js';
import {
    appliquerHumeurMascotte,
    reagirRoboGameOver,
    reagirRoboNouveauRecord,
    afficherEcran,
    sauvegarderRecord,
    mettreAJourAffichageRecord,
    formaterTemps,
    obtenirTempsEcoule,
} from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { afficherMelodieGameOver } from './melodie.js';
import { finaliserPartieCommune } from './partie-fin-commun.js';
import { modeCoopEnCours } from './registre-modes.js';
import { store } from './store-core.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { defiJourActif } from './mode-defi-jour.js';
import { obtenirDefiDuJour, enregistrerScoreDefiJour } from './defi-jour.js';
import { enregistrerTopOut, arreterSuiviMonde } from './gestionnaire-difficulte.js';
import {
    surFinDeMondeHistoire,
    peutContinuerBossGratuit,
    obtenirEtatHistoire,
} from './histoire-manager.js';
import { sansAccentsE } from './texte-jeu.js';
import {
    bossEstActif,
    arreterBoss,
    obtenirBossIdActif,
    appliquerRepliqueGameOverBoss,
} from './boss-jeu.js';
import { onGameOverHistoire } from './mecaniques-histoire.js';
import { oracle, obtenirScoreFinalOracle } from './oracle-jeu.js';
import { statsGlobales } from './achievements.js';
import { arreterFondBiome } from './rendu-fond-biome.js';

function _enregistrerRecordsFinPartie(victoire, scoreFinal) {
    if (victoire && etat.modeJeu === 'sprint' && !modeHistoireEnCours()) {
        sauvegarderRecordSprintBiome(obtenirBiomeActif(), obtenirTempsEcoule());
    }
    if (victoire && defiJourActif && !modeHistoireEnCours()) {
        const defi = obtenirDefiDuJour();
        if (obtenirBiomeActif() === defi.biomeId && etat.lignes >= defi.objectifLignes) {
            enregistrerScoreDefiJour(defi.date, scoreFinal);
        }
    }
}

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
    const annonceVictoire = modeHistoireEnCours()
        ? 'Monde termine ! Victoire'
        : etat.modeJeu === 'sprint'
          ? 'Sprint termine ! Victoire'
          : 'Partie terminee ! Victoire';

    const textes = BIOMES[obtenirBiomeActif()]?.textes ?? BIOMES.classique.textes;
    const titreGo = document.querySelector('.go-titre');
    if (titreGo) titreGo.textContent = victoire ? 'VICTOIRE !' : textes.gameOver;

    const scoreFinal = obtenirScoreFinalOracle();
    _appliquerStatsOracleFinPartie(scoreFinal);

    const nouveauRecord = sauvegarderRecord(scoreFinal);
    _enregistrerRecordsFinPartie(victoire, scoreFinal);
    _appliquerProgressionFinPartie(scoreFinal);

    mettreAJourAffichageRecord();
    _remplirEcranGameOver(scoreFinal, nouveauRecord);

    finaliserPartieCommune({
        score: scoreFinal,
        lignes: etat.lignes,
        biomeId: obtenirBiomeActif(),
        victoire,
        annonceVictoire,
        annonceDefaite: 'Partie terminee',
    });
    _afficherActionsFinHistoire();

    if (!victoire) {
        appliquerRepliqueGameOverBoss(true, bossIdDefaite);
    } else {
        appliquerRepliqueGameOverBoss(false);
    }

    const afficherGameOver = !(modeHistoireEnCours() && victoire);
    if (afficherGameOver) {
        const montrerGameOver = () => {
            afficherEcran(ECRANS.GAME_OVER);
            planifierBoucle();
        };
        if (immediat) {
            montrerGameOver();
        } else {
            setTimeout(montrerGameOver, 350);
        }
    }

    setTimeout(() => afficherMelodieGameOver(), 400);
}

function _appliquerStatsOracleFinPartie(scoreFinal) {
    void scoreFinal;
    if (!oracle.actif) return;
    statsGlobales.oraclePartiesJouees++;
    statsGlobales.oracleTotalDeviations += oracle.piecesIgnorees;
    statsGlobales.oracleDeviationsPartieActuelle = oracle.piecesIgnorees;
    if (oracle.multiplicateur > statsGlobales.oracleMeilleuresMult) {
        statsGlobales.oracleMeilleuresMult = oracle.multiplicateur;
    }
    if (oracle.scoreBonus > 0) {
        const elBonus = document.getElementById('oracle-bonus-go');
        if (elBonus) {
            elBonus.textContent = `+${oracle.scoreBonus.toLocaleString('fr-FR')}`;
            document.getElementById('oracle-bonus-go-wrap')?.classList.remove('element-masque');
        }
    }
}

function _appliquerProgressionFinPartie(scoreFinal) {
    const points = calculerPointsProgression(scoreFinal, etat.lignes);
    if (points > 0) {
        ajouterNiveauGlobal(points);
        sauvegarderNiveauGlobal(obtenirNiveauGlobal());
    }
}

function _remplirEcranGameOver(scoreFinal, nouveauRecord) {
    document.getElementById('score-final').textContent = scoreFinal.toLocaleString('fr-FR');
    document.getElementById('lignes-finales').textContent = String(etat.lignes);
    document.getElementById('niveau-final').textContent = String(etat.niveau);
    document.getElementById('record-final').textContent =
        obtenirRecordBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
    document.getElementById('temps-final').textContent = formaterTemps(obtenirTempsEcoule());

    const badge = document.getElementById('badge-record');
    badge?.classList.toggle('element-masque', !nouveauRecord);
    if (nouveauRecord) reagirRoboNouveauRecord();
}

function _afficherContinuesCampagneGameOver() {
    const el = document.getElementById('go-continues-campagne');
    if (!el) return;

    if (!modeHistoireEnCours()) {
        el.classList.add('element-masque');
        return;
    }

    const nb = obtenirEtatHistoire()?.nbContinuesUtilises ?? 0;
    if (nb <= 0) {
        el.classList.add('element-masque');
        return;
    }

    el.textContent = sansAccentsE(
        `Continues campagne utilises : ${nb} — peut affecter la fin Trame.`
    );
    el.classList.remove('element-masque');
}

function _afficherActionsFinHistoire() {
    const btnContinue = document.getElementById('btn-continue-boss');
    const btnCarte = document.getElementById('btn-histoire-carte');
    if (!modeHistoireEnCours()) {
        btnCarte?.classList.add('element-masque');
        btnContinue?.classList.add('element-masque');
        document.getElementById('go-avertissement-trame')?.classList.add('element-masque');
        document.getElementById('go-continues-campagne')?.classList.add('element-masque');
        arreterSuiviMonde();
    } else {
        surFinDeMondeHistoire(etat.lignes, etat.score);
        const continueGratuit = peutContinuerBossGratuit();
        btnContinue?.classList.toggle('element-masque', !continueGratuit);
        if (continueGratuit) btnCarte?.classList.add('element-masque');
        _afficherAvertissementTrameGameOver(continueGratuit);
        _afficherContinuesCampagneGameOver();
    }
}

function _afficherAvertissementTrameGameOver(continueGratuit) {
    const el = document.getElementById('go-avertissement-trame');
    if (!el) return;

    if (continueGratuit) {
        el.textContent = sansAccentsE(
            'Continue gratuit disponible — sans impact sur la fin Trame (condition 3/4).'
        );
        el.classList.remove('element-masque');
        return;
    }

    const etatHist = obtenirEtatHistoire();
    if (etatHist.conditionsTrame?.tousBossSansContinue === false) {
        el.textContent = sansAccentsE(
            "Un Continue empeche la fin Trame. La condition « Tous les boss sans continue » n'est plus remplie."
        );
        el.classList.remove('element-masque');
        return;
    }

    el.classList.add('element-masque');
}
