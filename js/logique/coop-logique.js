import { reinitialiserDasCoop } from './coop-das.js';
import { etat } from '../etat/store-jeu.js';
import { creerPlateau } from './piece-jeu.js';
import { modeCoopActif, basculerPreferenceCoop } from './coop-preference.js';
import {
    afficherNotifSynchro,
    afficherNotifTSpinCoop,
    coop_calculerScore,
    coop_verifierLignes,
} from './coop-lignes-score.js';
import { coop, DEMI_LARGEUR, COLONNES_J1, COLONNES_J2, coop_rafraichirStats } from './coop-etat.js';
import {
    coopAreActive,
    coopActiverPieceAuSol,
    coopQuitterSolPiece,
    coopMettreAJourGameFeel,
    coopReinitialiserGameFeelJoueur,
    coopDemarrerGraceSpawn,
} from './coop-game-feel.js';
import {
    creerJoueurVide,
    configurerCoopLogiquePiece,
    reinitialiserSacsCoop,
    coop_reinitialiserLockDelay,
    coop_nouvellePiece,
    coop_estPositionValide,
    coop_vitesseChute,
    coop_verrouillerPiece,
} from './coop-logique-piece.js';
import {
    coop_deplacerGauche,
    coop_deplacerDroite,
    coop_deplacerBas,
    coop_tourner,
    coop_chuteRapide,
    coop_utiliserReserve,
    utiliserPasserelle,
} from './coop-logique-mouvement.js';

export { afficherNotifSynchro, afficherNotifTSpinCoop, coop_calculerScore, coop_verifierLignes };
export { coop, DEMI_LARGEUR, COLONNES_J1, COLONNES_J2, coop_rafraichirStats };
export { modeCoopActif } from './coop-preference.js';
export {
    coop_reinitialiserLockDelay,
    coop_nouvellePiece,
    coop_estPositionValide,
    coop_vitesseChute,
    coop_verrouillerPiece,
    coop_deplacerGauche,
    coop_deplacerDroite,
    coop_deplacerBas,
    coop_tourner,
    coop_chuteRapide,
    coop_utiliserReserve,
    utiliserPasserelle,
};

/** `coop.actif` = partie coop en cours. */
export function basculerModeCoop() {
    basculerPreferenceCoop();
    if (typeof document === 'undefined') return;

    if (modeCoopActif) {
        void import('../ui/infobulles-contexte.js').then(({ proposerInfobulleModeJeu }) =>
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

/**
 * @param {'j1' | 'j2'} joueur
 * @param {number} dt
 */
export function coop_mettreAJourGravite(joueur, dt) {
    const jData = coop[joueur];
    const piece = jData.pieceActuelle;

    coopMettreAJourGameFeel(joueur, dt, {
        pieceValide: () => !piece || coop_estPositionValide(piece),
        surCollision: () => terminerCoopCallback?.(joueur),
        actions: {
            tourner: (sens) => coop_tourner(joueur, sens),
            reserve: () => coop_utiliserReserve(joueur),
            gauche: () => coop_deplacerGauche(joueur),
            droite: () => coop_deplacerDroite(joueur),
            bas: () => coop_deplacerBas(joueur),
            chute: () => coop_chuteRapide(joueur),
        },
    });

    if (!piece || coopAreActive(joueur)) return;

    const accKey = joueur === 'j1' ? 'accJ1' : 'accJ2';
    const vitesse = coop_vitesseChute();

    if (coop_estPositionValide(piece, 0, 1)) {
        if (jData.pieceAuSol) coopQuitterSolPiece(joueur);
        coop[accKey] += dt;
        if (coop[accKey] >= vitesse) {
            coop[accKey] = 0;
            piece.y++;
        }
        return;
    }

    if (!jData.pieceAuSol) {
        coopActiverPieceAuSol(joueur);
        return;
    }

    jData.lockDelayRestant -= dt;
    if (jData.lockDelayRestant <= 0) {
        coop_verrouillerPiece(joueur);
    }
}

/** @type {((joueur: 'j1' | 'j2') => void) | null} */
let terminerCoopCallback = null;

export function configurerCoopLogique(callbacks) {
    terminerCoopCallback = callbacks.terminerCooperatif;
    configurerCoopLogiquePiece(callbacks);
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

    reinitialiserSacsCoop();
    coop.j1 = creerJoueurVide();
    coop.j2 = creerJoueurVide();
    coopReinitialiserGameFeelJoueur('j1');
    coopReinitialiserGameFeelJoueur('j2');

    coop.j1.pieceActuelle = coop_nouvellePiece('j1');
    coop.j1.prochainePiece = coop_nouvellePiece('j1');
    coop.j2.pieceActuelle = coop_nouvellePiece('j2');
    coop.j2.prochainePiece = coop_nouvellePiece('j2');
    coopDemarrerGraceSpawn('j1');
    coopDemarrerGraceSpawn('j2');
}

export { coopEstPrefere } from './coop-preference.js';

export function coopPartieEnCours() {
    return coop.actif;
}

/** @param {boolean} actif */
export function definirCoopPartieEnCours(actif) {
    coop.actif = actif;
}
