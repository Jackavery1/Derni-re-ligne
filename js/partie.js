import { BIOMES } from './config.js';
import { arreterConstellation } from './constellation.js';
import { initialiserMeteo, annulerMeteo } from './meteo.js';
import { AudioMoteur } from './audio.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import {
    sauvegarderNiveauGlobal,
    obtenirRecordBiome,
    calculerPointsProgression,
} from './progression.js';
import {
    etat,
    biomeActif,
    niveauGlobal,
    particules,
    textesFlottants,
    sacPieces,
    secousse,
    flashVerrou,
    flashLignes,
    dasEtat,
    canvasReserve,
    ctxReserve,
    touchDepart,
    definirReliqueEnAttente,
    definirReliqueActive,
    definirCompteurPieces,
    definirSeuilProchRelique,
    definirCouleurAmbRgb,
    definirDerniereSecondeTemps,
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
    definirTransitionAlpha,
    definirAccumulateur,
    definirDernierTimestamp,
    definirRefsCanvas,
    definirTouchDepart,
    ajouterNiveauGlobal,
} from './contexte-jeu.js';
import {
    creerPlateau,
    genererProchainePiece,
    activerReliqueSurPiece,
    remplirSac,
    reinitialiserDas,
    hexVersRgb,
    mettreAJourIndicateurRelique,
} from './piece-jeu.js';
import { initParticulesAmbiance, dessinerFileNext, rendreFrameJeu } from './rendu-jeu.js';
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
import { ECRANS } from './contexte-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import { arreterAnimationMenu } from './menu-fond.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
} from './logique-partie.js';

export function initialiserCanvas() {
    const cp = document.getElementById('canvas-plateau');
    const cprev = document.getElementById('canvas-preview');
    const cres = document.getElementById('canvas-reserve');
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
    etat.estEnCours = false;
    etat.estEnPause = false;
    particules.length = 0;
    annulerMeteo();
    AudioMoteur.arreterMusique();
    changerHumeur('neutre');
    cacherEcrans();
    afficherEcran(ECRANS.TITRE);
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.textContent = '⏸ PAUSE';
}

export function demarrerJeu() {
    arreterConstellation();
    appliquerThemeBiome(biomeActif);
    appliquerTextesBiome(biomeActif);
    appliquerThemeMascotte();
    AudioMoteur.init();
    if (AudioMoteur.ctx && AudioMoteur.actif) {
        if (AudioMoteur.intervalMusique && AudioMoteur.biomeMusique !== biomeActif) {
            AudioMoteur.transitionMusique(biomeActif);
        } else {
            AudioMoteur.demarrerMusique(biomeActif);
        }
    }
    arreterAnimationMenu();

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
    initParticulesAmbiance();
    definirCouleurAmbRgb(hexVersRgb(BIOMES[biomeActif].lueurCoul));
    secousse.timer = 0;
    flashVerrou.timer = 0;
    flashVerrou.cellules = [];
    flashLignes.timer = 0;
    flashLignes.lignes = [];
    definirDerniereSecondeTemps(-1);
    sacPieces.length = 0;
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

    etat.pieceActuelle = genererProchainePiece();
    activerReliqueSurPiece(etat.pieceActuelle);
    etat.filePieces = [genererProchainePiece(), genererProchainePiece(), genererProchainePiece()];

    ctxReserve.clearRect(0, 0, canvasReserve.width, canvasReserve.height);
    dessinerFileNext();
    mettreAJourIndicateurRelique();

    rafraichirStats();
    const elTemps = document.getElementById('affichage-temps');
    if (elTemps) elTemps.textContent = '00:00';
    cacherEcrans();
    document.body.classList.add('partie-active');
    changerHumeur('neutre');

    document.getElementById('btn-pause').textContent = '⏸ PAUSE';

    definirAccumulateur(0);
    definirTransitionAlpha(1);
    rendreFrameJeu();
    planifierBoucle();
}

export function basculerPause() {
    if (!etat.estEnCours) return;

    etat.estEnPause = !etat.estEnPause;

    if (etat.estEnPause) {
        etat.tempsPauseDebut = Date.now();
        afficherEcran(ECRANS.PAUSE);
    } else {
        if (etat.tempsPauseDebut) {
            etat.tempsPauseAccumule += Date.now() - etat.tempsPauseDebut;
            etat.tempsPauseDebut = null;
        }
        cacherEcrans();
        definirAccumulateur(0);
        definirDernierTimestamp(performance.now());
        definirDerniereSecondeTemps(-1);
    }

    document.getElementById('btn-pause').textContent = etat.estEnPause ? '▶ REPRENDRE' : '⏸ PAUSE';
}

export function terminerPartie(victoire = false) {
    etat.estEnCours = false;
    annulerMeteo();
    AudioMoteur.arreterMusique();
    changerHumeur(victoire ? 'excite' : 'triste');
    if (!victoire) AudioMoteur.son('game_over');
    annoncer(victoire ? 'Sprint terminé ! Victoire' : 'Partie terminée');

    const textes = BIOMES[biomeActif]?.textes ?? BIOMES.classique.textes;
    const titreGo = document.querySelector('.go-titre');
    if (titreGo) titreGo.textContent = victoire ? 'VICTOIRE !' : textes.gameOver;

    const nouveauRecord = sauvegarderRecord(etat.score);

    const points = calculerPointsProgression(etat.score, etat.lignes);
    if (points > 0) {
        ajouterNiveauGlobal(points);
        sauvegarderNiveauGlobal(niveauGlobal);
    }

    mettreAJourAffichageRecord();

    document.getElementById('score-final').textContent = etat.score.toLocaleString('fr-FR');
    document.getElementById('lignes-finales').textContent = etat.lignes;
    document.getElementById('niveau-final').textContent = etat.niveau;
    document.getElementById('record-final').textContent =
        obtenirRecordBiome(biomeActif).toLocaleString('fr-FR');
    document.getElementById('temps-final').textContent = formaterTemps(obtenirTempsEcoule());

    const badge = document.getElementById('badge-record');
    if (badge) badge.style.display = nouveauRecord ? 'block' : 'none';

    setTimeout(() => {
        afficherEcran(ECRANS.GAME_OVER);
        planifierBoucle();
    }, 350);
}
