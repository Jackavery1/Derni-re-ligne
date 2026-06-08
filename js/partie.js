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
    appliquerThemeBiome,
    appliquerTextesBiome,
    appliquerThemeMascotte,
    reinitialiserMascottePartie,
    rafraichirStats,
    afficherEcran,
    cacherEcrans,
    retournerAuMenuTitre,
} from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { arreterAnimationMenu } from './menu-fond.js';
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
export { initialiserCanvas } from './partie-canvas.js';
export { terminerPartie } from './partie-fin.js';

export function confirmerRecommencer() {
    if (window.confirm('Recommencer la partie ?')) demarrerJeu();
}

export function quitterVersMenu() {
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
    retournerAuMenuTitre();
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.textContent = '⏸ PAUSE';
}

function initialiserFeaturesPartie() {
    reinitialiserOraclePartie();
    if (store.histoire.actif) {
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
    initialiserVivant();

    etat.pieceActuelle = genererProchainePiece();
    activerReliqueSurPiece(etat.pieceActuelle);
    etat.filePieces = [genererProchainePiece(), genererProchainePiece(), genererProchainePiece()];
    signalerApparitionPiece();
    annoncerPieceCourante();
}

function initialiserAudioPartie() {
    appliquerThemeBiome(obtenirBiomeActif());
    appliquerTextesBiome(obtenirBiomeActif());
    appliquerThemeMascotte();
    AudioMoteur.init();
    if (AudioMoteur.ctx && AudioMoteur.actif) {
        const biomeActif = obtenirBiomeActif();
        const biomePrecedent = AudioMoteur.biomeMusique;
        AudioMoteur.arreterMusique(0);
        const delai = biomePrecedent && biomePrecedent !== biomeActif ? 350 : 50;
        setTimeout(() => AudioMoteur.demarrerMusique(biomeActif), delai);
    }
    arreterAnimationMenu();
}

function initialiserUIPartie() {
    const ctxReserve = obtenirCtxReserve();
    const canvasReserve = obtenirCanvasReserve();
    ctxReserve.clearRect(0, 0, canvasReserve.width, canvasReserve.height);
    dessinerFileNext();
    mettreAJourIndicateurRelique();

    rafraichirStats();
    const elTemps = document.getElementById('affichage-temps');
    if (elTemps) elTemps.textContent = '00:00';
    cacherEcrans();
    initParticulesAmbiance();
    arreterMecaniquesHistoire();
    initialiserMecaniquesHistoire();
    document.body.classList.add('partie-active');
    reinitialiserMascottePartie();

    document.getElementById('btn-pause').textContent = '⏸ PAUSE';

    definirAccumulateur(0);
    rendreFrameJeu();
    declencherCalculOracle();
}

export function demarrerJeu() {
    demarrerTransition();
    initialiserFeaturesPartie();
    initialiserAudioPartie();
    initialiserEtatPartie();

    if (store.histoire.actif && store.histoire.mondeActuel) {
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
