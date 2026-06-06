import { BIOMES } from './config.js';
import { arreterConstellation } from './constellation.js';
import { initialiserMeteo, annulerMeteo } from './meteo.js';
import { initialiserVivant, annulerTimersVivant } from './vivant.js';
import { AudioMoteur } from './audio.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import {
    sauvegarderNiveauGlobal,
    obtenirRecordBiome,
    calculerPointsProgression,
} from './progression.js';
import {
    etat,
    particules,
    textesFlottants,
    secousse,
    flashVerrou,
    flashLignes,
    dasEtat,
    obtenirBiomeActif,
    obtenirNiveauGlobal,
    obtenirSacPieces,
    obtenirTouchDepart,
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
    definirRefsCanvas,
    definirTouchDepart,
    ajouterNiveauGlobal,
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
    changerHumeur,
    annoncer,
    rafraichirStats,
    sauvegarderRecord,
    mettreAJourAffichageRecord,
    afficherEcran,
    cacherEcrans,
    formaterTemps,
    obtenirTempsEcoule,
} from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { arreterAnimationMenu } from './menu-fond.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
} from './logique-partie.js';
import { reinitialiserMelodie, afficherMelodieGameOver, arreterLectureMelodie } from './melodie.js';
import { initStatsPartie, finaliserStatsPartie } from './achievements.js';
import { verifierCodex } from './codex.js';
import { reinitialiserHistoriquePositions } from './decorations-jeu.js';
import {
    donneesPartie,
    reinitialiserDonneesPartie,
    signalerApparitionPiece,
    sauvegarderSnapshotProfil,
} from './profil-jeu.js';
import { store } from './store-core.js';
import { surFinDeMondeHistoire } from './histoire-manager.js';
import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { demarrerBoss, arreterBoss, bossEstActif } from './boss-jeu.js';
import {
    initialiserMecaniquesHistoire,
    arreterMecaniquesHistoire,
    onGameOverHistoire,
} from './mecaniques-histoire.js';
import { reinitialiserConditionsRuntime } from './conditions-secrets.js';
import {
    oracle,
    reinitialiserOraclePartie,
    declencherCalculOracle,
    afficherSectionOracle,
    mettreAJourStatsOracleUI,
    obtenirScoreFinalOracle,
} from './oracle-jeu.js';
import { statsGlobales } from './achievements.js';

export function initialiserCanvas() {
    const cp = obtenirCanvas('canvas-plateau');
    const cprev = obtenirCanvas('canvas-preview');
    const cres = obtenirCanvas('canvas-reserve');
    if (!cp || !cprev || !cres) {
        logger.error('Canvas introuvable dans le DOM');
        afficherErreurUtilisateur(
            'Impossible de charger le jeu — canvas manquant. Rechargez la page.'
        );
        return false;
    }
    definirRefsCanvas({
        canvasPlateau: cp,
        ctx: cp.getContext('2d', { alpha: false }),
        canvasPreview: cprev,
        ctxPreview: cprev.getContext('2d'),
        canvasReserve: cres,
        ctxReserve: cres.getContext('2d'),
    });

    if (!cp.dataset.evenementsOk) {
        cp.dataset.evenementsOk = '1';
        cp.addEventListener(
            'touchstart',
            (e) => {
                definirTouchDepart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            },
            { passive: true }
        );
        cp.addEventListener(
            'touchend',
            (e) => {
                const touchDepart = obtenirTouchDepart();
                if (!touchDepart) return;
                const dx = e.changedTouches[0].clientX - touchDepart.x;
                const dy = e.changedTouches[0].clientY - touchDepart.y;
                const seuil = 25;
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > seuil) deplacerDroite();
                    if (dx < -seuil) deplacerGauche();
                } else {
                    if (dy > seuil) deplacerBas();
                    if (dy < -seuil) chuteRapide();
                }
                definirTouchDepart(null);
            },
            { passive: true }
        );
        cp.addEventListener('click', () => {
            if (!etat.pieceActuelle?.reliqueForme) tourner(1);
        });
    }
    return true;
}

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
    changerHumeur('neutre');
    cacherEcrans();
    afficherEcran(ECRANS.TITRE);
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
    changerHumeur('neutre');

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

export function terminerPartie(victoire = false) {
    if (bossEstActif() && !victoire) {
        arreterBoss();
    }
    etat.estEnCours = false;
    if (store.histoire.actif && !victoire) {
        onGameOverHistoire(etat.lignes, store.histoire.mondeActuel ?? '');
    }
    annulerMeteo();
    AudioMoteur.arreterMusique(200);
    changerHumeur(victoire ? 'excite' : 'triste');
    if (!victoire) setTimeout(() => AudioMoteur.son('game_over'), 250);
    annoncer(victoire ? 'Sprint terminé ! Victoire' : 'Partie terminée');

    const textes = BIOMES[obtenirBiomeActif()]?.textes ?? BIOMES.classique.textes;
    const titreGo = document.querySelector('.go-titre');
    if (titreGo) titreGo.textContent = victoire ? 'VICTOIRE !' : textes.gameOver;

    const scoreFinal = obtenirScoreFinalOracle();

    if (oracle.actif) {
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

    const nouveauRecord = sauvegarderRecord(scoreFinal);

    const points = calculerPointsProgression(scoreFinal, etat.lignes);
    if (points > 0) {
        ajouterNiveauGlobal(points);
        sauvegarderNiveauGlobal(obtenirNiveauGlobal());
    }

    mettreAJourAffichageRecord();

    document.getElementById('score-final').textContent = scoreFinal.toLocaleString('fr-FR');
    document.getElementById('lignes-finales').textContent = String(etat.lignes);
    document.getElementById('niveau-final').textContent = String(etat.niveau);
    document.getElementById('record-final').textContent =
        obtenirRecordBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
    document.getElementById('temps-final').textContent = formaterTemps(obtenirTempsEcoule());

    const badge = document.getElementById('badge-record');
    if (badge) badge.style.display = nouveauRecord ? 'block' : 'none';

    const tempsPartie = Math.floor(obtenirTempsEcoule() / 1000);
    sauvegarderSnapshotProfil(etat.lignes, obtenirBiomeActif());
    finaliserStatsPartie(scoreFinal, tempsPartie);
    void verifierCodex();

    if (!store.histoire.actif) {
        const btnCarte = document.getElementById('btn-histoire-carte');
        if (btnCarte) btnCarte.style.display = 'none';
    } else {
        surFinDeMondeHistoire(etat.lignes, scoreFinal);
    }

    setTimeout(() => {
        afficherEcran(ECRANS.GAME_OVER);
        planifierBoucle();
    }, 350);

    setTimeout(() => afficherMelodieGameOver(), 400);
}
