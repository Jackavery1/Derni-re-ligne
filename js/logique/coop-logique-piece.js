import { CONFIG, TETROMINOS } from '../config/config-jeu.js';
import { emettre } from '../etat/bus-jeu.js';
import { remplirSac, detecterTSpin } from './logique-pure.js';
import { extraireForme, estPositionValideAvecBornes } from './moteur-piece.js';
import { etat, flashVerrou } from '../etat/store-jeu.js';
import { obtenirCouleurPieceParType } from './piece-jeu.js';
import { verifierAchievements, sauvegarderStats } from '../achievements.js';
import { reagirRoboAuxLignes } from '../ui/mascotte-robo.js';
import {
    afficherNotifSynchro,
    afficherNotifTSpinCoop,
    coop_calculerScore,
    coop_verifierLignes,
} from './coop-lignes-score.js';
import { coop, DEMI_LARGEUR } from './coop-etat.js';
import {
    poserPieceSurPlateau,
    vitesseChuteDepuisNiveau,
    calculerSpawnXCoop,
} from './actions-piece-communes.js';
import { coopDemarrerAre, coopDemarrerGraceSpawn, coopGraceSpawnActive } from './coop-game-feel.js';

const sacsCoop = { j1: [], j2: [] };

/** @type {((joueur: 'j1' | 'j2') => void) | null} */
let terminerCoopCallback = null;

export function creerJoueurVide() {
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
        areRestant: 0,
        spawnGraceRestant: 0,
        coyoteRestant: 0,
        inputBuffer: [],
    };
}

export function configurerCoopLogiquePiece(callbacks) {
    terminerCoopCallback = callbacks.terminerCooperatif;
}

export function reinitialiserSacsCoop() {
    sacsCoop.j1 = [];
    sacsCoop.j2 = [];
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

/** @param {'j1' | 'j2'} joueur */
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

/** @param {'j1' | 'j2'} joueur */
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
    const { gameOver, cellulesPosees } = poserPieceSurPlateau(etat.plateau, piece, couleur);

    if (gameOver) {
        emettre('partie:topout');
        terminerCoopCallback?.(joueur);
        return;
    }

    flashVerrou.cellules = cellulesPosees;
    flashVerrou.timer = flashVerrou.duree;

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

    emettre('piece:son', { type: 'verrou' });

    jData.pieceActuelle = jData.prochainePiece;
    jData.prochainePiece = coop_nouvellePiece(joueur);
    jData.reserveUtilisee = false;
    jData.pieceAuSol = false;
    jData.lockDelayRestant = 0;
    jData.nbLockResets = 0;

    coopDemarrerAre(joueur);
    coopDemarrerGraceSpawn(joueur);

    if (!coop_estPositionValide(jData.pieceActuelle)) {
        if (!coopGraceSpawnActive(joueur)) {
            emettre('partie:topout');
            terminerCoopCallback?.(joueur);
        }
    }
}
