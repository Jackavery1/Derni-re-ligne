import { CONFIG, TETROMINOS } from './config.js';
import { remplirSac, detecterTSpin } from './logique-pure.js';
import { appliquerScoreLignes } from './score-partie.js';
import { reinitialiserDasCoop } from './coop-das.js';
import { extraireForme, estPositionValideAvecBornes } from './moteur-piece.js';
import { etat } from './store-jeu.js';
import { creerPlateau, obtenirCouleurPieceParType } from './piece-jeu.js';
import { creerParticulesLigne } from './particules-jeu.js';
import { statsGlobales, verifierAchievements, sauvegarderStats } from './achievements.js';
import { afficherNotificationNiveau } from './ui-notifications.js';
import { reagirRoboAuxLignes } from './ecrans-ui.js';
import { obtenirBouton, obtenirElement } from './dom-utils.js';
import {
    poserPieceSurPlateau,
    vitesseChuteDepuisNiveau,
    deplacerPieceSiValide,
    tenterRotationSrs,
    calculerSpawnXCoop,
    executerChuteRapide,
} from './actions-piece-communes.js';

export const DEMI_LARGEUR = 5;
export const COLONNES_J1 = [0, 1, 2, 3, 4];
export const COLONNES_J2 = [5, 6, 7, 8, 9];

/** Preference sur l'ecran selection (avant lancement). `coop.actif` = partie coop en cours. */
export let modeCoopActif = false;

export function basculerModeCoop() {
    modeCoopActif = !modeCoopActif;
    if (typeof document === 'undefined') return;

    const btn = obtenirBouton('toggle-coop');
    const label = obtenirElement('coop-toggle-label');
    const oracleBtn = obtenirBouton('toggle-oracle');

    if (modeCoopActif) {
        btn?.classList.add('actif');
        if (label) label.textContent = 'COOP : ON';
        if (oracleBtn) oracleBtn.disabled = true;
        import('./oracle-jeu.js').then(({ oracle, basculerOracle }) => {
            if (oracle.actif) basculerOracle();
        });
    } else {
        btn?.classList.remove('actif');
        if (label) label.textContent = 'COOP : OFF';
        if (oracleBtn) oracleBtn.disabled = false;
    }
}

export const coop = {
    actif: false,
    j1: {
        pieceActuelle: null,
        prochainePiece: null,
        pieceEnReserve: null,
        reserveUtilisee: false,
        passerelleDisponible: true,
    },
    j2: {
        pieceActuelle: null,
        prochainePiece: null,
        pieceEnReserve: null,
        reserveUtilisee: false,
        passerelleDisponible: true,
    },
    score: 0,
    lignes: 0,
    niveau: 1,
    estEnCours: false,
    estEnPause: false,
    accJ1: 0,
    accJ2: 0,
    lignesEnAttenteJ1: -1,
    lignesEnAttenteJ2: -1,
    flashSynchro: 0,
    combo: 0,
    dernierEtaitTetris: false,
};

function creerJoueurVide() {
    return {
        pieceActuelle: null,
        prochainePiece: null,
        pieceEnReserve: null,
        reserveUtilisee: false,
        passerelleDisponible: true,
        pieceAuSol: false,
        lockDelayRestant: 0,
        nbLockResets: 0,
        poseApresRotation: false,
    };
}

/** @param {'j1' | 'j2'} joueur */
export function coop_reinitialiserLockDelay(joueur) {
    const jData = coop[joueur];
    if (!jData.pieceAuSol) return;
    if (jData.nbLockResets < CONFIG.maxLockResets) {
        jData.lockDelayRestant = CONFIG.lockDelay;
        jData.nbLockResets++;
    }
}

/**
 * @param {'j1' | 'j2'} joueur
 * @param {number} dt
 */
export function coop_mettreAJourGravite(joueur, dt) {
    const jData = coop[joueur];
    const piece = jData.pieceActuelle;
    if (!piece) return;

    const accKey = joueur === 'j1' ? 'accJ1' : 'accJ2';
    const vitesse = coop_vitesseChute();

    if (coop_estPositionValide(piece, 0, 1)) {
        jData.pieceAuSol = false;
        jData.lockDelayRestant = 0;
        coop[accKey] += dt;
        if (coop[accKey] >= vitesse) {
            coop[accKey] = 0;
            piece.y++;
        }
        return;
    }

    if (!jData.pieceAuSol) {
        jData.pieceAuSol = true;
        jData.lockDelayRestant = CONFIG.lockDelay;
        jData.nbLockResets = 0;
        return;
    }

    jData.lockDelayRestant -= dt;
    if (jData.lockDelayRestant <= 0) {
        coop_verrouillerPiece(joueur);
    }
}

// Sac 7-bag par joueur : même distribution de pieces qu'en solo (evite les
// longues sequences sans piece I du tirage uniforme).
const sacsCoop = { j1: [], j2: [] };

export function coop_nouvellePiece(joueur) {
    if (sacsCoop[joueur].length === 0) sacsCoop[joueur] = remplirSac();
    const type = sacsCoop[joueur].pop();
    const forme = TETROMINOS[type].rotations[0];
    return {
        type,
        rotation: 0,
        x: calculerSpawnXCoop(joueur, forme[0].length, DEMI_LARGEUR),
        y: 0,
        joueur,
    };
}

export function coop_estPositionValide(piece, dx = 0, dy = 0, rotation = null) {
    const forme = extraireForme(piece, rotation);
    const xMin = piece.joueur === 'j1' ? 0 : DEMI_LARGEUR;
    const xMax = piece.joueur === 'j1' ? DEMI_LARGEUR : CONFIG.colonnes;
    return estPositionValideAvecBornes(etat.plateau, piece, forme, dx, dy, xMin, xMax);
}

export function coop_vitesseChute() {
    return vitesseChuteDepuisNiveau(coop.niveau);
}

export function coop_rafraichirStats() {
    if (typeof document === 'undefined') return;
    const elScore = document.getElementById('coop-score');
    const elLignes = document.getElementById('coop-lignes');
    const elNiveau = document.getElementById('coop-niveau');
    if (elScore) elScore.textContent = coop.score.toLocaleString('fr-FR');
    if (elLignes) elLignes.textContent = String(coop.lignes);
    if (elNiveau) elNiveau.textContent = String(coop.niveau);
}

export function afficherNotifSynchro(nbLignes) {
    if (typeof document === 'undefined') return;
    const messages = {
        1: 'SYNCHRO !',
        2: 'DOUBLE SYNCHRO !',
        3: 'TRIPLE !',
        4: '✦ TETRIS COOP ✦',
    };
    const msg = messages[nbLignes] || `×${nbLignes} SYNCHRO !`;
    const notif = document.getElementById('notif-niveau');
    if (!notif) return;
    notif.textContent = msg;
    notif.classList.remove('notif-synchro', 'notif-niveau-vert');
    notif.classList.add('notif-synchro');
    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
}

export function afficherNotifNiveauCoop() {
    afficherNotificationNiveau(`✦ NIVEAU ${coop.niveau} ✦`, {
        classesRetirer: ['notif-synchro'],
        classesAjouter: ['notif-niveau-vert'],
    });
}

export function coop_calculerScore(nbLignes, tSpin = null) {
    const etatScore = {
        score: coop.score,
        lignes: coop.lignes,
        niveau: coop.niveau,
        combo: coop.combo,
        dernierEtaitTetris: coop.dernierEtaitTetris,
    };
    const result = appliquerScoreLignes(etatScore, nbLignes, tSpin);
    coop.score = etatScore.score;
    coop.lignes = etatScore.lignes;
    coop.niveau = etatScore.niveau;
    coop.combo = etatScore.combo;
    coop.dernierEtaitTetris = etatScore.dernierEtaitTetris;

    statsGlobales.lignesCoopTotal = (statsGlobales.lignesCoopTotal || 0) + nbLignes;
    if (nbLignes > (statsGlobales.coopMaxLignesUnCoup || 0)) {
        statsGlobales.coopMaxLignesUnCoup = nbLignes;
    }

    if (result.levelUp) {
        coop.j1.passerelleDisponible = true;
        coop.j2.passerelleDisponible = true;
        for (const j of ['j1', 'j2']) {
            const btn = obtenirBouton(`btn-passerelle-${j}`);
            if (btn) btn.disabled = false;
        }
        afficherNotifNiveauCoop();
    }
    coop_rafraichirStats();
    return result;
}

function afficherNotifTSpinCoop(tSpin) {
    if (typeof document === 'undefined' || !tSpin) return;
    const label = tSpin === 'full' ? 'T-SPIN !' : 'T-SPIN MINI !';
    afficherNotificationNiveau(label, {
        classesRetirer: ['notif-synchro', 'notif-niveau-vert'],
    });
}

export function coop_verifierLignes() {
    const xMinJ1 = 0;
    const xMaxJ1 = DEMI_LARGEUR;
    const xMinJ2 = DEMI_LARGEUR;
    const xMaxJ2 = CONFIG.colonnes;

    let nbSupprimees = 0;
    coop.lignesEnAttenteJ1 = -1;
    coop.lignesEnAttenteJ2 = -1;

    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        const moitieGaucheComplete = etat.plateau[l].slice(xMinJ1, xMaxJ1).every((c) => c !== 0);
        const moitieDroiteComplete = etat.plateau[l].slice(xMinJ2, xMaxJ2).every((c) => c !== 0);

        if (moitieGaucheComplete && moitieDroiteComplete) {
            coop.flashSynchro = 300;
            creerParticulesLigne(l);
            etat.plateau.splice(l, 1);
            etat.plateau.unshift(Array(CONFIG.colonnes).fill(0));
            nbSupprimees++;
            l++;
        } else {
            if (moitieGaucheComplete && !moitieDroiteComplete) coop.lignesEnAttenteJ1 = l;
            if (moitieDroiteComplete && !moitieGaucheComplete) coop.lignesEnAttenteJ2 = l;
        }
    }

    return nbSupprimees;
}

let terminerCoopCallback = null;

export function configurerCoopLogique(callbacks) {
    terminerCoopCallback = callbacks.terminerCooperatif;
}

export function coop_verrouillerPiece(joueur) {
    const jData = coop[joueur];
    const piece = jData.pieceActuelle;
    if (!piece) return;

    const formeVerrou = extraireForme(piece);
    const tSpin =
        jData.poseApresRotation && piece.type === 'T' && piece.x != null && piece.y != null
            ? detecterTSpin(etat.plateau, piece, formeVerrou)
            : null;
    jData.poseApresRotation = false;

    const couleur = obtenirCouleurPieceParType(piece.type);
    const { gameOver } = poserPieceSurPlateau(etat.plateau, piece, couleur);

    if (gameOver) {
        terminerCoopCallback?.(joueur);
        return;
    }

    const nbLignes = coop_verifierLignes();
    const result = coop_calculerScore(nbLignes, tSpin);

    if (nbLignes > 0) {
        if (typeof document !== 'undefined') {
            reagirRoboAuxLignes(nbLignes, result.combo);
        }
        afficherNotifSynchro(nbLignes);
        verifierAchievements();
        sauvegarderStats();
    }
    if (result.tSpin) {
        afficherNotifTSpinCoop(result.tSpin);
    }

    jData.pieceActuelle = jData.prochainePiece;
    jData.prochainePiece = coop_nouvellePiece(joueur);
    jData.reserveUtilisee = false;
    jData.pieceAuSol = false;
    jData.lockDelayRestant = 0;
    jData.nbLockResets = 0;

    if (!coop_estPositionValide(jData.pieceActuelle)) {
        terminerCoopCallback?.(joueur);
    }
}

export function coop_deplacerGauche(joueur) {
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p || coop.estEnPause) return;
    jData.poseApresRotation = false;
    if (deplacerPieceSiValide(p, -1, 0, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy))) {
        coop_reinitialiserLockDelay(joueur);
    }
}

export function coop_deplacerDroite(joueur) {
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p || coop.estEnPause) return;
    jData.poseApresRotation = false;
    if (deplacerPieceSiValide(p, 1, 0, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy))) {
        coop_reinitialiserLockDelay(joueur);
    }
}

export function coop_deplacerBas(joueur) {
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p || coop.estEnPause) return;
    jData.poseApresRotation = false;
    if (deplacerPieceSiValide(p, 0, 1, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy))) {
        coop.score += 1;
        coop_rafraichirStats();
        jData.pieceAuSol = false;
        jData.lockDelayRestant = 0;
    }
}

export function coop_tourner(joueur, sens) {
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p || coop.estEnPause) return;
    if (
        tenterRotationSrs(p, sens, (piece, dx, dy, rotation) =>
            coop_estPositionValide(piece, dx, dy, rotation)
        )
    ) {
        jData.poseApresRotation = true;
        coop_reinitialiserLockDelay(joueur);
    }
}

export function coop_chuteRapide(joueur) {
    const jData = coop[joueur];
    const p = jData.pieceActuelle;
    if (!p || coop.estEnPause) return;
    jData.poseApresRotation = false;
    const dist = executerChuteRapide(p, (piece, dx, dy) => coop_estPositionValide(piece, dx, dy));
    coop.score += dist * 2;
    coop_rafraichirStats();
    coop_verrouillerPiece(joueur);
}

export function coop_utiliserReserve(joueur) {
    const jData = coop[joueur];
    if (!jData.pieceActuelle || jData.reserveUtilisee || coop.estEnPause) return;

    const typeActuel = jData.pieceActuelle.type;

    if (!jData.pieceEnReserve) {
        jData.pieceEnReserve = { type: typeActuel, rotation: 0 };
        jData.pieceActuelle = jData.prochainePiece;
        jData.prochainePiece = coop_nouvellePiece(joueur);
    } else {
        const typeRess = jData.pieceEnReserve.type;
        jData.pieceEnReserve = { type: typeActuel, rotation: 0 };
        jData.pieceActuelle = { type: typeRess, rotation: 0, x: 0, y: 0, joueur };
    }

    const forme = TETROMINOS[jData.pieceActuelle.type].rotations[0];
    jData.pieceActuelle.x = calculerSpawnXCoop(joueur, forme[0].length, DEMI_LARGEUR);
    jData.pieceActuelle.y = 0;
    jData.pieceActuelle.joueur = joueur;
    jData.reserveUtilisee = true;
    jData.poseApresRotation = false;
    jData.pieceAuSol = false;
    jData.lockDelayRestant = 0;
    jData.nbLockResets = 0;
}

export function utiliserPasserelle(joueur) {
    const jData = coop[joueur];
    const cible = joueur === 'j1' ? 'j2' : 'j1';
    const cibleD = coop[cible];

    if (!jData.passerelleDisponible || coop.estEnPause) return;

    const pieceAEnvoyer = jData.prochainePiece;
    pieceAEnvoyer.joueur = cible;
    const forme = TETROMINOS[pieceAEnvoyer.type].rotations[0];
    pieceAEnvoyer.x = calculerSpawnXCoop(cible, forme[0].length, DEMI_LARGEUR);
    pieceAEnvoyer.y = 0;

    const ancienneProchaine = cibleD.prochainePiece;
    cibleD.prochainePiece = pieceAEnvoyer;
    jData.prochainePiece = ancienneProchaine;
    jData.prochainePiece.joueur = joueur;
    const formeR = TETROMINOS[jData.prochainePiece.type].rotations[0];
    jData.prochainePiece.x = calculerSpawnXCoop(joueur, formeR[0].length, DEMI_LARGEUR);

    jData.passerelleDisponible = false;
    const btn = obtenirBouton(`btn-passerelle-${joueur}`);
    if (btn) btn.disabled = true;

    if (typeof document !== 'undefined') {
        const notif = document.getElementById('notif-niveau');
        if (notif) {
            notif.textContent = `⇒ PASSEUR ${joueur.toUpperCase()} !`;
            notif.classList.remove('notif-synchro');
            notif.classList.add('notif-niveau-vert');
            notif.classList.remove('visible');
            void notif.offsetWidth;
            notif.classList.add('visible');
        }
    }
}

export function reinitialiserEtatCoop() {
    coop.score = 0;
    coop.lignes = 0;
    coop.niveau = 1;
    coop.estEnCours = true;
    coop.estEnPause = false;
    coop.accJ1 = 0;
    coop.accJ2 = 0;
    coop.flashSynchro = 0;
    coop.lignesEnAttenteJ1 = -1;
    coop.lignesEnAttenteJ2 = -1;
    coop.combo = 0;
    coop.dernierEtaitTetris = false;
    reinitialiserDasCoop();

    etat.plateau = creerPlateau();

    sacsCoop.j1 = [];
    sacsCoop.j2 = [];
    coop.j1 = creerJoueurVide();
    coop.j2 = creerJoueurVide();

    coop.j1.pieceActuelle = coop_nouvellePiece('j1');
    coop.j1.prochainePiece = coop_nouvellePiece('j1');
    coop.j2.pieceActuelle = coop_nouvellePiece('j2');
    coop.j2.prochainePiece = coop_nouvellePiece('j2');
}

/** Préférence coop sur l'écran sélection (avant lancement). */
export function coopEstPrefere() {
    return modeCoopActif;
}

/** Partie coop en cours (runtime). */
export function coopPartieEnCours() {
    return coop.actif;
}

/** @param {boolean} actif */
export function definirCoopPartieEnCours(actif) {
    coop.actif = actif;
}
