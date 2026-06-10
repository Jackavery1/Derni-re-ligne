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
    annoncer,
    afficherEcran,
    sauvegarderRecord,
    mettreAJourAffichageRecord,
    formaterTemps,
    obtenirTempsEcoule,
} from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { afficherMelodieGameOver } from './melodie.js';
import { finaliserStatsPartie } from './achievements.js';
import { verifierCodex } from './codex.js';
import { sauvegarderSnapshotProfil } from './profil-jeu.js';
import { store } from './store-core.js';
import { enregistrerTopOut, arreterSuiviMonde } from './gestionnaire-difficulte.js';
import { surFinDeMondeHistoire } from './histoire-manager.js';
import { bossEstActif, arreterBoss } from './boss-jeu.js';
import { onGameOverHistoire } from './mecaniques-histoire.js';
import { oracle, obtenirScoreFinalOracle } from './oracle-jeu.js';
import { statsGlobales } from './achievements.js';
import { arreterFondBiome } from './rendu-fond-biome.js';

export function terminerPartie(victoire = false) {
    arreterFondBiome();
    if (bossEstActif() && !victoire) {
        arreterBoss();
    }
    etat.estEnCours = false;
    if (store.histoire.actif && !victoire) {
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
    annoncer(victoire ? 'Sprint termine ! Victoire' : 'Partie terminee');

    const textes = BIOMES[obtenirBiomeActif()]?.textes ?? BIOMES.classique.textes;
    const titreGo = document.querySelector('.go-titre');
    if (titreGo) titreGo.textContent = victoire ? 'VICTOIRE !' : textes.gameOver;

    const scoreFinal = obtenirScoreFinalOracle();
    _appliquerStatsOracleFinPartie(scoreFinal);

    const nouveauRecord = sauvegarderRecord(scoreFinal);
    _appliquerProgressionFinPartie(scoreFinal);

    mettreAJourAffichageRecord();
    _remplirEcranGameOver(scoreFinal, nouveauRecord);

    const tempsPartie = Math.floor(obtenirTempsEcoule() / 1000);
    sauvegarderSnapshotProfil(etat.lignes, obtenirBiomeActif());
    finaliserStatsPartie(scoreFinal, tempsPartie);
    void verifierCodex();
    _afficherActionsFinHistoire();

    setTimeout(() => {
        afficherEcran(ECRANS.GAME_OVER);
        planifierBoucle();
    }, 350);

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
    if (badge) badge.style.display = nouveauRecord ? 'block' : 'none';
    if (nouveauRecord) reagirRoboNouveauRecord();
}

function _afficherActionsFinHistoire() {
    if (!store.histoire.actif) {
        const btnCarte = document.getElementById('btn-histoire-carte');
        if (btnCarte) btnCarte.style.display = 'none';
        arreterSuiviMonde();
    } else {
        surFinDeMondeHistoire(etat.lignes, etat.score);
    }
}
