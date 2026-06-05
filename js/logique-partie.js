import { CONFIG, TETROMINOS, RELIQUES } from './config.js';
import {
    calculerPointsLignes,
    calculerNiveauDepuisLignes,
    obtenirEssaisKick,
    supprimerLignesDuPlateau,
} from './logique-pure.js';
import { meteo, ETATS_METEO } from './meteo.js';
import { appliquerEffetRelique } from './reliques.js';
import { AudioMoteur } from './audio.js';
import { obtenirActions } from './actions-jeu.js';
import { emettre } from './bus-jeu.js';
import {
    etat,
    flashVerrou,
    flashLignes,
    obtenirBiomeActif,
    obtenirReliqueEnAttente,
    obtenirReliqueActive,
    obtenirCompteurPieces,
    obtenirSeuilProchRelique,
    incrementerCompteurPieces,
    definirReliqueEnAttente,
    definirReliqueActive,
    definirCompteurPieces,
    definirSeuilProchRelique,
    definirLockDelayRestant,
    definirNbLockResets,
    definirPieceAuSol,
} from './store-jeu.js';
import {
    obtenirForme,
    obtenirCouleurPiece,
    estPositionValide,
    calculerDistanceChute,
    creerPieceRelique,
    genererProchainePiece,
    activerReliqueSurPiece,
    reinitialiserLockDelay,
} from './piece-jeu.js';
import { enregistrerNotesLignesCompletes } from './melodie.js';
import { majStatsLignesEffacees, majStatsScorePartie } from './achievements.js';
import {
    enregistrerDonneesVerrouillage,
    signalerApparitionPiece,
    compterRotation,
    compterMouvementLateral,
    compterHardDrop,
    compterHold,
    enregistrerLignesParNiveau,
} from './profil-jeu.js';
import { sauvegarderPlacementOracle, declencherCalculOracle } from './oracle-jeu.js';
import { annoncer } from './annonces.js';

export function verrouillerPiece() {
    if (meteo.decalageForce !== 0) {
        if (estPositionValide(etat.pieceActuelle, meteo.decalageForce, 0)) {
            etat.pieceActuelle.x += meteo.decalageForce;
        }
    }

    sauvegarderPlacementOracle();

    const forme = obtenirForme(etat.pieceActuelle);
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    const cellulesPosees = [];

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const y = etat.pieceActuelle.y + l;
            const x = etat.pieceActuelle.x + c;
            if (y < 0) {
                obtenirActions().terminerPartie?.();
                return;
            }
            etat.plateau[y][x] = couleur;
            cellulesPosees.push({ x, y });
        }
    }

    flashVerrou.cellules = cellulesPosees;
    flashVerrou.timer = flashVerrou.duree;

    enregistrerDonneesVerrouillage();

    incrementerCompteurPieces();
    if (obtenirCompteurPieces() >= obtenirSeuilProchRelique() && !obtenirReliqueEnAttente()) {
        definirReliqueEnAttente(true);
        definirCompteurPieces(0);
        definirSeuilProchRelique(Math.floor(Math.random() * 6) + 15);
    }
    const reliqueActive = obtenirReliqueActive();
    if (reliqueActive) {
        appliquerEffetRelique(reliqueActive, etat.pieceActuelle);
        definirReliqueActive(null);
    }

    enregistrerNotesLignesCompletes();
    const nbLignesEffacees = supprimerLignesCompletes();
    majStatsLignesEffacees(nbLignesEffacees);
    calculerScore(nbLignesEffacees);
    AudioMoteur.son('verrou');

    etat.pieceActuelle = etat.filePieces.shift();
    activerReliqueSurPiece(etat.pieceActuelle);
    if (obtenirReliqueEnAttente()) {
        definirReliqueEnAttente(false);
        const relique = RELIQUES[obtenirBiomeActif()] ?? RELIQUES.classique;
        etat.filePieces.unshift(creerPieceRelique(relique));
    } else {
        etat.filePieces.push(genererProchainePiece());
    }
    etat.reserveUtilisee = false;
    definirPieceAuSol(false);
    definirLockDelayRestant(0);
    definirNbLockResets(0);

    emettre('partie:nouvelle-piece');
    signalerApparitionPiece();
    declencherCalculOracle();

    if (!estPositionValide(etat.pieceActuelle)) obtenirActions().terminerPartie?.();
}

function supprimerLignesCompletes() {
    const { plateau, nbSupprimees, lignesEffacees } = supprimerLignesDuPlateau(etat.plateau);
    if (nbSupprimees === 0) return 0;

    etat.plateau = plateau;
    flashLignes.lignes = [...lignesEffacees];
    flashLignes.timer = flashLignes.duree;
    emettre('lignes:effacees', { nbSupprimees, lignesEffacees });
    return nbSupprimees;
}

/**
 * Met à jour score, combo et niveau sans effets DOM (testable).
 * @param {{ score: number, lignes: number, niveau: number, combo: number, dernierEtaitTetris: boolean }} etatPartie
 * @param {number} nbLignes
 */
export function appliquerScoreLignes(etatPartie, nbLignes) {
    const points = calculerPointsLignes(nbLignes, etatPartie.niveau);
    let levelUp = false;
    let tetris = false;
    let backToBack = false;

    if (nbLignes === 0) {
        etatPartie.combo = 0;
    } else {
        etatPartie.combo++;
        if (nbLignes === 4) {
            tetris = true;
            backToBack = etatPartie.dernierEtaitTetris;
            etatPartie.dernierEtaitTetris = true;
        } else {
            etatPartie.dernierEtaitTetris = false;
        }
    }

    etatPartie.score += points;
    etatPartie.lignes += nbLignes;

    const nouveauNiveau = calculerNiveauDepuisLignes(etatPartie.lignes);
    if (nouveauNiveau > etatPartie.niveau) {
        etatPartie.niveau = nouveauNiveau;
        levelUp = true;
    }

    return { points, combo: etatPartie.combo, tetris, backToBack, levelUp };
}

export function calculerScore(nbLignes) {
    const result = appliquerScoreLignes(etat, nbLignes);

    if (nbLignes > 0) {
        majStatsScorePartie(nbLignes, etat.combo);
        enregistrerLignesParNiveau(nbLignes);
    }

    emettre('score:maj', { nbLignes, result });
}

export function jouable() {
    return etat.estEnCours && !etat.estEnPause && etat.pieceActuelle !== null;
}

function deplacerGaucheReel() {
    if (!jouable()) return;
    if (estPositionValide(etat.pieceActuelle, -1, 0)) {
        etat.pieceActuelle.x--;
        AudioMoteur.son('deplacement');
        reinitialiserLockDelay();
        compterMouvementLateral();
    }
}

function deplacerDroiteReel() {
    if (!jouable()) return;
    if (estPositionValide(etat.pieceActuelle, 1, 0)) {
        etat.pieceActuelle.x++;
        AudioMoteur.son('deplacement');
        reinitialiserLockDelay();
        compterMouvementLateral();
    }
}

export function deplacerGauche() {
    if (meteo.controleInverse) {
        deplacerDroiteReel();
        return;
    }
    deplacerGaucheReel();
}

export function deplacerDroite() {
    if (meteo.controleInverse) {
        deplacerGaucheReel();
        return;
    }
    deplacerDroiteReel();
}

export function deplacerBas() {
    if (!jouable()) return;
    if (estPositionValide(etat.pieceActuelle, 0, 1)) {
        etat.pieceActuelle.y++;
        etat.score++;
        definirPieceAuSol(false);
        definirLockDelayRestant(0);
        emettre('partie:stats');
    }
}

export function chuteRapide() {
    if (!jouable()) return;
    if (meteo.etat === ETATS_METEO.ACTIF && meteo.evenementActuel?.effet === 'microgravite') return;
    compterHardDrop();
    const dist = calculerDistanceChute(etat.pieceActuelle);
    etat.pieceActuelle.y += dist;
    etat.score += dist * 2;
    AudioMoteur.son('chute');
    emettre('partie:stats');
    verrouillerPiece();
}

export function tourner(sens) {
    if (!jouable()) return;
    const piece = etat.pieceActuelle;
    const nbRots = TETROMINOS[piece.type].rotations.length;
    const rotationCible = (((piece.rotation + sens) % nbRots) + nbRots) % nbRots;
    const essais = obtenirEssaisKick(piece.type, piece.rotation, rotationCible);

    for (const [dx, dy] of essais) {
        if (estPositionValide(piece, dx, dy, rotationCible)) {
            piece.rotation = rotationCible;
            piece.x += dx;
            piece.y += dy;
            AudioMoteur.son('rotation');
            reinitialiserLockDelay();
            compterRotation();
            annoncer('Pièce tournée');
            return;
        }
    }
}

export function utiliserReserve() {
    if (!jouable()) return;
    if (etat.reserveUtilisee) return;

    const typeActuel = etat.pieceActuelle.type;

    if (!etat.pieceEnReserve) {
        etat.pieceEnReserve = {
            type: typeActuel,
            rotation: 0,
            reliqueForme: etat.pieceActuelle.reliqueForme,
            reliqueData: etat.pieceActuelle.reliqueData,
        };
        etat.pieceActuelle = etat.filePieces.shift();
        activerReliqueSurPiece(etat.pieceActuelle);
        if (obtenirReliqueEnAttente()) {
            definirReliqueEnAttente(false);
            const relique = RELIQUES[obtenirBiomeActif()] ?? RELIQUES.classique;
            etat.filePieces.unshift(creerPieceRelique(relique));
        } else {
            etat.filePieces.push(genererProchainePiece());
        }
        definirReliqueActive(null);
        emettre('partie:nouvelle-piece');
    } else {
        const reserve = etat.pieceEnReserve;
        etat.pieceEnReserve = {
            type: typeActuel,
            rotation: 0,
            reliqueForme: etat.pieceActuelle.reliqueForme,
            reliqueData: etat.pieceActuelle.reliqueData,
        };
        etat.pieceActuelle = {
            type: reserve.type,
            rotation: 0,
            reliqueForme: reserve.reliqueForme,
            reliqueData: reserve.reliqueData,
            x: 0,
            y: 0,
        };
        activerReliqueSurPiece(etat.pieceActuelle);
    }

    const forme = obtenirForme(etat.pieceActuelle);
    etat.pieceActuelle.x = Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2);
    etat.pieceActuelle.y = 0;
    etat.reserveUtilisee = true;
    compterHold();
    AudioMoteur.son('hold');
    annoncer('Réserve utilisée');
    reinitialiserLockDelay();
    signalerApparitionPiece();
    declencherCalculOracle();
    emettre('partie:reserve-preview', { reserve: etat.pieceEnReserve });
}

export function vitesseChute() {
    return Math.max(
        CONFIG.vitesseBase - (etat.niveau - 1) * CONFIG.reductionParNiveau,
        CONFIG.vitesseMin
    );
}
