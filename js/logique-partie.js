import { CONFIG, TETROMINOS, RELIQUES } from './config.js';
import {
    calculerPointsLignes,
    calculerNiveauDepuisLignes,
    obtenirEssaisKick,
} from './logique-pure.js';
import { meteo, ETATS_METEO } from './meteo.js';
import { appliquerEffetRelique } from './reliques.js';
import { AudioMoteur } from './audio.js';
import { obtenirActions } from './actions-jeu.js';
import {
    etat,
    flashVerrou,
    flashLignes,
    obtenirBiomeActif,
    obtenirReliqueEnAttente,
    obtenirReliqueActive,
    obtenirCompteurPieces,
    obtenirSeuilProchRelique,
    obtenirCtxReserve,
    obtenirCanvasReserve,
    definirReliqueEnAttente,
    definirReliqueActive,
    incrementerCompteurPieces,
    definirCompteurPieces,
    definirSeuilProchRelique,
    definirLockDelayRestant,
    definirNbLockResets,
    definirPieceAuSol,
} from './contexte-jeu.js';
import {
    obtenirForme,
    obtenirCouleurPiece,
    estPositionValide,
    calculerDistanceChute,
    creerPieceRelique,
    genererProchainePiece,
    activerReliqueSurPiece,
    reinitialiserLockDelay,
    mettreAJourIndicateurRelique,
} from './piece-jeu.js';
import { creerParticulesLigne } from './particules-jeu.js';
import {
    dessinerFileNext,
    dessinerPreview,
    afficherTexteFlottant,
    obtenirYHautTas,
    declencherSecousse,
} from './rendu-jeu.js';
import { changerHumeur, annoncer, rafraichirStats, afficherNotifNiveau } from './ecrans-ui.js';
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
import {
    sauvegarderPlacementOracle,
    evaluerDecisionOracle,
    declencherCalculOracle,
} from './oracle-jeu.js';

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

    dessinerFileNext();
    mettreAJourIndicateurRelique();

    signalerApparitionPiece();
    declencherCalculOracle();

    if (!estPositionValide(etat.pieceActuelle)) obtenirActions().terminerPartie?.();
}

function supprimerLignesCompletes() {
    const lignesCompletes = [];
    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        if (etat.plateau[l].every((c) => c !== 0)) lignesCompletes.push(l);
    }

    if (lignesCompletes.length === 0) return 0;

    flashLignes.lignes = [...lignesCompletes];
    flashLignes.timer = flashLignes.duree;

    for (const l of lignesCompletes) creerParticulesLigne(l);

    for (const l of lignesCompletes.sort((a, b) => b - a)) {
        etat.plateau.splice(l, 1);
        etat.plateau.unshift(Array(CONFIG.colonnes).fill(0));
    }

    const nbSupprimees = lignesCompletes.length;
    const intensitesSecousse = { 1: 2, 2: 3.5, 3: 5, 4: 8 };
    declencherSecousse(intensitesSecousse[nbSupprimees] ?? 8);
    changerHumeur(nbSupprimees >= 4 ? 'excite' : 'content');
    if (nbSupprimees >= 4) AudioMoteur.son('tetris');
    else if (nbSupprimees === 3) AudioMoteur.son('ligne_3');
    else if (nbSupprimees === 2) AudioMoteur.son('ligne_2');
    else if (nbSupprimees === 1) AudioMoteur.son('ligne_1');
    return nbSupprimees;
}

export function calculerScore(nbLignes) {
    const points = calculerPointsLignes(nbLignes, etat.niveau);

    if (nbLignes === 0) {
        etat.combo = 0;
    } else {
        etat.combo++;
        majStatsScorePartie(nbLignes, etat.combo);
        enregistrerLignesParNiveau(nbLignes);

        if (nbLignes === 4) {
            afficherTexteFlottant('TETRIS !', '#ffe600', 16);
            annoncer('Tetris ! Quatre lignes effacées');
            if (etat.dernierEtaitTetris) {
                afficherTexteFlottant('BACK-TO-BACK !', '#ff006e', 13);
                annoncer('Back-to-back Tetris');
            }
            etat.dernierEtaitTetris = true;
        } else {
            if (nbLignes === 3) afficherTexteFlottant('TRIPLE !', '#b400ff', 14);
            if (nbLignes === 2) afficherTexteFlottant('DOUBLE !', '#00f5ff', 12);
            etat.dernierEtaitTetris = false;
        }

        if (etat.combo >= 2) {
            afficherTexteFlottant(`COMBO x${etat.combo}`, '#00ff88', 11);
            annoncer(`Combo ${etat.combo}`);
        }

        if (points > 0) {
            const estGros = nbLignes >= 4 || points >= 500;
            afficherTexteFlottant(`+${points}`, estGros ? null : '#ffe600', estGros ? 12 : 10, {
                y: obtenirYHautTas() - 10,
                arcEnCiel: estGros,
            });
            annoncer(
                `${nbLignes} ligne${nbLignes > 1 ? 's' : ''} effacée${nbLignes > 1 ? 's' : ''}, plus ${points} points`
            );
        }
    }

    etat.score += points;
    etat.lignes += nbLignes;
    evaluerDecisionOracle(nbLignes);
    const nouveauNiveau = calculerNiveauDepuisLignes(etat.lignes);
    if (nouveauNiveau > etat.niveau) {
        etat.niveau = nouveauNiveau;
        afficherNotifNiveau();
        AudioMoteur.son('niveau');
        AudioMoteur.relancerIntervalleMusique();
        annoncer(`Niveau ${etat.niveau} atteint`);
    }
    rafraichirStats();

    if (etat.modeJeu === 'sprint' && etat.lignes >= CONFIG.sprintLignes) {
        etat.victoireSprint = true;
        setTimeout(() => obtenirActions().terminerPartie?.(true), 400);
    }
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
        rafraichirStats();
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
    rafraichirStats();
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
        dessinerFileNext();
        mettreAJourIndicateurRelique();
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
    reinitialiserLockDelay();
    signalerApparitionPiece();
    declencherCalculOracle();

    dessinerPreview(obtenirCtxReserve(), obtenirCanvasReserve(), etat.pieceEnReserve);
}

export function vitesseChute() {
    return Math.max(
        CONFIG.vitesseMin,
        CONFIG.vitesseBase - (etat.niveau - 1) * CONFIG.reductionParNiveau
    );
}
