import { BIOMES } from './config.js';
import { annulerMeteo } from './meteo.js';
import { AudioMoteur } from './audio.js';
import {
    calculerPointsProgression,
    obtenirRecordBiome,
    sauvegarderNiveauGlobal,
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
import { coop } from './coop-logique.js';
import { store } from './store-core.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { enregistrerTopOut, arreterSuiviMonde } from './gestionnaire-difficulte.js';
import { surFinDeMondeHistoire } from './histoire-manager.js';
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

export function terminerPartie(victoire = false) {
    if (coop.actif) return;
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
        : 'Sprint termine ! Victoire';

    const textes = BIOMES[obtenirBiomeActif()]?.textes ?? BIOMES.classique.textes;
    const titreGo = document.querySelector('.go-titre');
    if (titreGo) titreGo.textContent = victoire ? 'VICTOIRE !' : textes.gameOver;

    const scoreFinal = obtenirScoreFinalOracle();
    _appliquerStatsOracleFinPartie(scoreFinal);

    const nouveauRecord = sauvegarderRecord(scoreFinal);
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
        setTimeout(() => {
            afficherEcran(ECRANS.GAME_OVER);
            planifierBoucle();
        }, 350);
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

function _afficherActionsFinHistoire() {
    if (!modeHistoireEnCours()) {
        const btnCarte = document.getElementById('btn-histoire-carte');
        btnCarte?.classList.add('element-masque');
        arreterSuiviMonde();
    } else {
        surFinDeMondeHistoire(etat.lignes, etat.score);
    }
}
