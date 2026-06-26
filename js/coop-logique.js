import { CONFIG, TETROMINOS } from './config.js';
import { remplirSac, detecterTSpin } from './logique-pure.js';
import { reinitialiserDasCoop } from './coop-das.js';
import { extraireForme, estPositionValideAvecBornes } from './moteur-piece.js';
import { etat } from './store-jeu.js';
import { creerPlateau, obtenirCouleurPieceParType } from './piece-jeu.js';
import { verifierAchievements, sauvegarderStats } from './achievements.js';
import { reagirRoboAuxLignes } from './mascotte-robo.js';
import { obtenirBouton } from './dom-utils.js';
import { modeCoopActif, basculerPreferenceCoop } from './coop-preference.js';
import {
    afficherNotifSynchro,
    afficherNotifTSpinCoop,
    coop_calculerScore,
    coop_verifierLignes,
} from './coop-lignes-score.js';
import { coop, DEMI_LARGEUR, COLONNES_J1, COLONNES_J2, coop_rafraichirStats } from './coop-etat.js';

export { afficherNotifSynchro, afficherNotifTSpinCoop, coop_calculerScore, coop_verifierLignes };
export { coop, DEMI_LARGEUR, COLONNES_J1, COLONNES_J2, coop_rafraichirStats };

export { modeCoopActif } from './coop-preference.js';
import {
    poserPieceSurPlateau,
    vitesseChuteDepuisNiveau,
    deplacerPieceSiValide,
    tenterRotationSrs,
    calculerSpawnXCoop,
    executerChuteRapide,
} from './actions-piece-communes.js';

/** `coop.actif` = partie coop en cours. */
export function basculerModeCoop() {
    basculerPreferenceCoop();
    if (typeof document === 'undefined') return;

    if (modeCoopActif) {
        void import('./infobulles-contexte.js').then(({ proposerInfobulleModeJeu }) =>
            proposerInfobulleModeJeu('coop')
        );
        import('./mode-sprint.js').then(({ desactiverModeSprint, mettreAJourToggleSprint }) => {
            desactiverModeSprint();
            mettreAJourToggleSprint();
        });
        import('./oracle-jeu.js').then(({ oracle, basculerOracle }) => {
            if (oracle.actif) basculerOracle();
        });
    }
}

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
export { coopEstPrefere } from './coop-preference.js';

/** Partie coop en cours (runtime). */
export function coopPartieEnCours() {
    return coop.actif;
}

/** @param {boolean} actif */
export function definirCoopPartieEnCours(actif) {
    coop.actif = actif;
}
