import { BIOMES } from './config.js';
import { arreterConstellation } from './constellation.js';
import { initialiserMeteo, annulerMeteo } from './meteo.js';
import { initialiserVivant, annulerTimersVivant } from './vivant.js';
import { AudioMoteur } from './audio.js';
import {
    etat,
    particules,
    textesFlottants,
    secousse,
    flashVerrou,
    flashLignes,
    dasEtat,
    obtenirBiomeActif,
    obtenirSacPieces,
    obtenirCtxReserve,
    obtenirCanvasReserve,
    definirReliqueEnAttente,
    definirReliqueActive,
    definirCompteurPieces,
    definirSeuilProchRelique,
    definirCouleurAmbRgb,
    definirDerniereSecondeTemps,
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
    definirAccumulateur,
    definirDernierTimestamp,
} from './store-jeu.js';
import {
    creerPlateau,
    genererProchainePiece,
    activerReliqueSurPiece,
    remplirSac,
    reinitialiserDas,
    hexVersRgb,
    mettreAJourIndicateurRelique,
} from './piece-jeu.js';
import {
    initParticulesAmbiance,
    dessinerFileNext,
    rendreFrameJeu,
    demarrerTransition,
} from './rendu-jeu.js';
import {
    reinitialiserMascottePartie,
    rafraichirStats,
    afficherEcran,
    cacherEcrans,
    retournerAuMenuTitre,
} from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { reinitialiserMelodie, arreterLectureMelodie } from './melodie.js';
import { initStatsPartie } from './achievements.js';
import { verifierCodex } from './codex.js';
import { reinitialiserHistoriquePositions } from './decorations-jeu.js';
import {
    donneesPartie,
    reinitialiserDonneesPartie,
    signalerApparitionPiece,
} from './profil-jeu.js';
import { annoncerPieceCourante } from './annonces.js';
import { store } from './store-core.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { obtenirIdBiomeFond } from './biome-fond.js';
import { initialiserAudioBiome } from './audio-partie.js';
import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { demarrerBoss, arreterBoss } from './boss-jeu.js';
import { initialiserMecaniquesHistoire, arreterMecaniquesHistoire } from './mecaniques-histoire.js';
import { reinitialiserConditionsRuntime } from './conditions-secrets.js';
import {
    oracle,
    reinitialiserOraclePartie,
    declencherCalculOracle,
    afficherSectionOracle,
    mettreAJourStatsOracleUI,
} from './oracle-jeu.js';
import { demarrerFondBiome, arreterFondBiome } from './rendu-fond-biome.js';
import { reinitialiserTimerNiveau } from './timer-niveau.js';
import { rafraichirHudObjectifsHistoire } from './ui-panneau-objectifs.js';
export { initialiserCanvas } from './partie-canvas.js';
export { terminerPartie } from './partie-fin.js';

export function confirmerRecommencer() {
    if (window.confirm('Recommencer la partie ?')) demarrerJeu();
}

function _arreterPartieEnCours() {
    arreterFondBiome();
    arreterLectureMelodie();
    annulerTimersVivant();
    etat.estEnCours = false;
    etat.estEnPause = false;
    particules.length = 0;
    annulerMeteo();
    arreterBoss();
    arreterMecaniquesHistoire();
    AudioMoteur.arreterMusique();
    reinitialiserMascottePartie();
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.textContent = '⏸ PAUSE';
}

export function quitterVersMenu() {
    _arreterPartieEnCours();
    retournerAuMenuTitre();
}

export function quitterVersCarteHistoire() {
    if (!modeHistoireEnCours()) return;
    _arreterPartieEnCours();
    void import('./histoire-manager.js').then(({ retournerACarte }) => retournerACarte());
}

function initialiserFeaturesPartie() {
    reinitialiserOraclePartie();
    if (modeHistoireEnCours()) {
        reinitialiserConditionsRuntime();
    }
    afficherSectionOracle(oracle.actif);
    mettreAJourStatsOracleUI();
    document.getElementById('oracle-bonus-go-wrap')?.classList.add('element-masque');

    reinitialiserMelodie();
    reinitialiserHistoriquePositions();
    reinitialiserDonneesPartie();
    donneesPartie.biomeId = obtenirBiomeActif();
    initStatsPartie();
    void verifierCodex();
    arreterConstellation();
}

function initialiserEtatPartie() {
    etat.plateau = creerPlateau();
    etat.victoireSprint = false;
    etat.score = 0;
    etat.lignes = 0;
    etat.niveau = 1;
    etat.pieceEnReserve = null;
    etat.reserveUtilisee = false;
    etat.estEnCours = true;
    etat.estEnPause = false;
    etat.combo = 0;
    etat.dernierEtaitTetris = false;
    etat.tempsDebut = Date.now();
    etat.tempsPauseAccumule = 0;
    etat.tempsPauseDebut = null;
    particules.length = 0;
    textesFlottants.length = 0;
    definirCouleurAmbRgb(hexVersRgb(BIOMES[obtenirBiomeActif()].lueurCoul));
    secousse.timer = 0;
    flashVerrou.timer = 0;
    flashVerrou.cellules = [];
    flashLignes.timer = 0;
    flashLignes.lignes = [];
    definirDerniereSecondeTemps(-1);
    obtenirSacPieces().length = 0;
    remplirSac();
    definirPieceAuSol(false);
    definirLockDelayRestant(0);
    definirNbLockResets(0);
    Object.keys(dasEtat).forEach(reinitialiserDas);

    definirCompteurPieces(0);
    definirSeuilProchRelique(Math.floor(Math.random() * 6) + 15);
    definirReliqueEnAttente(false);
    definirReliqueActive(null);
    initialiserMeteo();
    if (modeHistoireEnCours()) {
        annulerTimersVivant();
    } else {
        initialiserVivant();
    }

    etat.pieceActuelle = genererProchainePiece();
    activerReliqueSurPiece(etat.pieceActuelle);
    etat.filePieces = [genererProchainePiece(), genererProchainePiece(), genererProchainePiece()];
    signalerApparitionPiece();
    annoncerPieceCourante();
}

function initialiserAudioPartie() {
    initialiserAudioBiome(obtenirBiomeActif());
}

function initialiserUIPartie() {
    void import('./layout-jeu.js').then(({ adapterInterface }) => adapterInterface());
    const ctxReserve = obtenirCtxReserve();
    const canvasReserve = obtenirCanvasReserve();
    if (!ctxReserve || !canvasReserve) {
        throw new Error('Canvas reserve indisponible');
    }
    ctxReserve.clearRect(0, 0, canvasReserve.width, canvasReserve.height);
    dessinerFileNext();
    mettreAJourIndicateurRelique();

    rafraichirStats();
    reinitialiserTimerNiveau();
    const elTemps = document.getElementById('affichage-temps');
    if (elTemps) elTemps.textContent = '00:00';
    cacherEcrans();
    initParticulesAmbiance();
    arreterMecaniquesHistoire();
    initialiserMecaniquesHistoire();
    document.body.classList.add('partie-active');
    reinitialiserMascottePartie();

    document.getElementById('btn-pause').textContent = '⏸ PAUSE';

    if (modeHistoireEnCours()) {
        rafraichirHudObjectifsHistoire();
    }

    definirAccumulateur(0);
    rendreFrameJeu();
    declencherCalculOracle();
}

export function demarrerJeu() {
    demarrerTransition();
    initialiserFeaturesPartie();
    initialiserAudioPartie();
    initialiserEtatPartie();

    if (modeHistoireEnCours() && store.histoire.mondeActuel) {
        const monde = SEQUENCE_HISTOIRE.find((m) => m.id === store.histoire.mondeActuel);
        if (monde?.estBoss && monde?.bossId) {
            demarrerBoss(monde.bossId);
        } else {
            arreterBoss();
        }
    } else {
        arreterBoss();
    }

    initialiserUIPartie();
    demarrerFondBiome(obtenirIdBiomeFond());
    planifierBoucle();
}

export function basculerPause() {
    if (!etat.estEnCours) return;

    etat.estEnPause = !etat.estEnPause;

    if (etat.estEnPause) {
        annulerTimersVivant();
        etat.tempsPauseDebut = Date.now();
        AudioMoteur.definirVolumePauseMusique(true);
        afficherEcran(ECRANS.PAUSE);
    } else {
        if (etat.tempsPauseDebut) {
            etat.tempsPauseAccumule += Date.now() - etat.tempsPauseDebut;
            etat.tempsPauseDebut = null;
        }
        AudioMoteur.definirVolumePauseMusique(false);
        cacherEcrans();
        definirAccumulateur(0);
        definirDernierTimestamp(performance.now());
        definirDerniereSecondeTemps(-1);
    }

    document.getElementById('btn-pause').textContent = etat.estEnPause ? '▶ REPRENDRE' : '⏸ PAUSE';
}
