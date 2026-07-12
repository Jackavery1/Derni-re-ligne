import { BIOMES } from '../config/biomes.js';
import { initialiserMeteo, annulerMeteo } from './meteo.js';
import { initialiserVivant, annulerTimersVivant } from './vivant.js';
import { AudioMoteur } from '../audio/audio.js';
import {
    etat,
    particules,
    textesFlottants,
    secousse,
    flashVerrou,
    flashLignes,
    flashTopout,
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
} from '../etat/store-jeu.js';
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
} from '../rendu/rendu-jeu.js';
import {
    reinitialiserMascottePartie,
    rafraichirStats,
    afficherEcran,
    cacherEcrans,
    retournerAuMenuTitre,
} from '../ui/ecrans-ui.js';
import { ECRANS } from '../etat/store-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { initStatsPartie } from '../achievements.js';
import { reinitialiserHistoriquePositions } from '../rendu/decorations-jeu.js';
import {
    donneesPartie,
    reinitialiserDonneesPartie,
    signalerApparitionPiece,
} from '../ui/profil-jeu.js';
import { annoncerPieceCourante } from '../ui/annonces.js';
import { store } from '../etat/store-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { obtenirIdBiomeFond } from '../rendu/biome-fond.js';
import { initialiserAudioBiome } from '../audio/audio-partie.js';
import { logger } from '../io/logger.js';
import { SEQUENCE_HISTOIRE } from '../histoire-donnees.js';
import { assurerRessourcesPartie } from '../io/prefetch-ressources-partie.js';
import { demarrerBoss, arreterBoss } from './boss-jeu.js';
import {
    initialiserMecaniquesHistoire,
    arreterMecaniquesHistoire,
} from '../histoire/mecaniques-histoire.js';
import { reinitialiserConditionsRuntime } from '../histoire/conditions-secrets.js';
import {
    oracle,
    reinitialiserOraclePartie,
    declencherCalculOracle,
    afficherSectionOracle,
    mettreAJourStatsOracleUI,
} from './oracle-jeu.js';
import { demarrerFondBiome, arreterFondBiome } from '../rendu/rendu-fond-biome.js';
import { reinitialiserTimerNiveau } from './timer-niveau.js';
import { reinitialiserGameFeel, demarrerGraceSpawn } from './game-feel-jeu.js';
import { rafraichirHudObjectifsHistoire } from '../ui/ui-objectifs-hud.js';
import { demanderConfirmationDialog } from '../ui/dialog-confirmation.js';
export { initialiserCanvas, assurerCanvasPartie } from './partie-canvas.js';

export async function confirmerRecommencer() {
    const confirme = await demanderConfirmationDialog({
        dialogId: 'dialog-recommencer-partie',
        btnOuiId: 'btn-confirm-recommencer-partie',
        btnNonId: 'btn-annuler-recommencer-partie',
        fallbackMessage: 'Recommencer la partie ?',
    });
    if (confirme) demarrerJeu();
}

function _arreterPartieEnCours() {
    arreterFondBiome();
    void import('../audio/melodie.js').then(({ arreterLectureMelodie }) => arreterLectureMelodie());
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
    void import('../histoire/histoire-session.js').then(({ retournerACarte }) => retournerACarte());
}

function initialiserFeaturesPartie() {
    reinitialiserOraclePartie();
    if (modeHistoireEnCours()) {
        reinitialiserConditionsRuntime();
    }
    afficherSectionOracle(oracle.actif);
    mettreAJourStatsOracleUI();
    document.getElementById('oracle-bonus-go-wrap')?.classList.add('element-masque');

    void import('../audio/melodie.js').then(({ reinitialiserMelodie }) => reinitialiserMelodie());
    reinitialiserHistoriquePositions();
    reinitialiserDonneesPartie();
    donneesPartie.biomeId = obtenirBiomeActif();
    initStatsPartie();
    void import('../codex.js').then((m) => m.planifierVerifierCodex());
    void import('./constellation.js').then(({ arreterConstellation }) => arreterConstellation());
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
    flashTopout.timer = 0;
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
    reinitialiserGameFeel();
    if (modeHistoireEnCours()) {
        annulerMeteo();
    } else {
        initialiserMeteo();
    }
    if (modeHistoireEnCours()) {
        annulerTimersVivant();
    } else {
        initialiserVivant();
    }

    etat.pieceActuelle = genererProchainePiece();
    activerReliqueSurPiece(etat.pieceActuelle);
    etat.filePieces = [genererProchainePiece(), genererProchainePiece(), genererProchainePiece()];
    demarrerGraceSpawn();
    signalerApparitionPiece();
    annoncerPieceCourante();
}

function initialiserAudioPartie() {
    initialiserAudioBiome(obtenirBiomeActif());
}

function initialiserUIPartie() {
    void import('../rendu/layout-jeu.js').then(({ adapterInterface }) => adapterInterface());
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
    void _demarrerJeuApresPrep();
}

async function _demarrerJeuApresPrep() {
    try {
        await assurerRessourcesPartie();
    } catch (err) {
        logger.error('Échec préparation partie :', err);
        return;
    }
    const { assurerCanvasPartie } = await import('./partie-canvas.js');
    if (!assurerCanvasPartie()) return;
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
