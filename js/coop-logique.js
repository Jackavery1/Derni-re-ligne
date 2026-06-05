import { CONFIG, TETROMINOS } from './config.js';
import { calculerPointsLignes } from './logique-pure.js';
import { extraireForme, estPositionValideAvecBornes } from './moteur-piece.js';
import { etat } from './contexte-jeu.js';
import { creerPlateau, getCouleurPiece } from './piece-jeu.js';
import { creerParticulesLigne } from './particules-jeu.js';
import { statsGlobales, verifierAchievements, sauvegarderStats } from './achievements.js';
import { changerHumeur } from './ecrans-ui.js';

export const DEMI_LARGEUR = 5;
export const COLONNES_J1 = [0, 1, 2, 3, 4];
export const COLONNES_J2 = [5, 6, 7, 8, 9];

export let modeCoopActif = false;

export function basculerModeCoop() {
    modeCoopActif = !modeCoopActif;
    if (typeof document === 'undefined') return;

    const btn = document.getElementById('toggle-coop');
    const label = document.getElementById('coop-toggle-label');
    const oracleBtn = document.getElementById('toggle-oracle');

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
};

function creerJoueurVide() {
    return {
        pieceActuelle: null,
        prochainePiece: null,
        pieceEnReserve: null,
        reserveUtilisee: false,
        passerelleDisponible: true,
    };
}

export function coop_nouvellePiece(joueur) {
    const types = Object.keys(TETROMINOS);
    const type = types[Math.floor(Math.random() * types.length)];
    const forme = TETROMINOS[type].rotations[0];
    const offset = joueur === 'j1' ? 0 : DEMI_LARGEUR;
    return {
        type,
        rotation: 0,
        x: offset + Math.floor(DEMI_LARGEUR / 2) - Math.floor(forme[0].length / 2),
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
    return Math.max(
        CONFIG.vitesseMin,
        CONFIG.vitesseBase - (coop.niveau - 1) * CONFIG.reductionParNiveau
    );
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
    if (typeof document === 'undefined') return;
    const notif = document.getElementById('notif-niveau');
    if (!notif) return;
    notif.textContent = `✦ NIVEAU ${coop.niveau} ✦`;
    notif.classList.remove('notif-synchro');
    notif.classList.add('notif-niveau-vert');
    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
}

export function coop_calculerScore(nbLignes) {
    coop.score += calculerPointsLignes(nbLignes, coop.niveau);

    statsGlobales.lignesCoopTotal = (statsGlobales.lignesCoopTotal || 0) + nbLignes;
    if (nbLignes > (statsGlobales.coopMaxLignesUnCoup || 0)) {
        statsGlobales.coopMaxLignesUnCoup = nbLignes;
    }

    const nouveauNiveau = Math.floor(coop.lignes / 10) + 1;
    if (nouveauNiveau > coop.niveau) {
        coop.niveau = nouveauNiveau;
        coop.j1.passerelleDisponible = true;
        coop.j2.passerelleDisponible = true;
        for (const j of ['j1', 'j2']) {
            const btn = document.getElementById(`btn-passerelle-${j}`);
            if (btn) btn.disabled = false;
        }
        afficherNotifNiveauCoop();
    }
    coop_rafraichirStats();
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

    if (nbSupprimees > 0) {
        coop.lignes += nbSupprimees;
        coop_calculerScore(nbSupprimees);
        if (typeof document !== 'undefined') {
            changerHumeur(nbSupprimees >= 4 ? 'excite' : 'content');
        }
        afficherNotifSynchro(nbSupprimees);
        verifierAchievements();
        sauvegarderStats();
    }
}

let terminerCoopCallback = null;

export function configurerCoopLogique(callbacks) {
    terminerCoopCallback = callbacks.terminerCooperatif;
}

export function coop_verrouillerPiece(joueur) {
    const jData = coop[joueur];
    const piece = jData.pieceActuelle;
    if (!piece) return;

    const rotations = TETROMINOS[piece.type].rotations;
    const forme = rotations[piece.rotation % rotations.length];
    const couleur = getCouleurPiece(piece.type);

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const y = piece.y + l;
            const x = piece.x + c;
            if (y < 0) {
                terminerCoopCallback?.(joueur);
                return;
            }
            etat.plateau[y][x] = couleur;
        }
    }

    coop_verifierLignes();

    jData.pieceActuelle = jData.prochainePiece;
    jData.prochainePiece = coop_nouvellePiece(joueur);
    jData.reserveUtilisee = false;

    if (!coop_estPositionValide(jData.pieceActuelle)) {
        terminerCoopCallback?.(joueur);
    }
}

export function coop_deplacerGauche(joueur) {
    const p = coop[joueur].pieceActuelle;
    if (!p || coop.estEnPause) return;
    if (coop_estPositionValide(p, -1, 0)) p.x--;
}

export function coop_deplacerDroite(joueur) {
    const p = coop[joueur].pieceActuelle;
    if (!p || coop.estEnPause) return;
    if (coop_estPositionValide(p, 1, 0)) p.x++;
}

export function coop_deplacerBas(joueur) {
    const p = coop[joueur].pieceActuelle;
    if (!p || coop.estEnPause) return;
    if (coop_estPositionValide(p, 0, 1)) p.y++;
}

export function coop_tourner(joueur, sens) {
    const p = coop[joueur].pieceActuelle;
    if (!p || coop.estEnPause) return;
    const nbRots = TETROMINOS[p.type].rotations.length;
    const newRot = (((p.rotation + sens) % nbRots) + nbRots) % nbRots;
    for (const off of [0, 1, -1, 2, -2]) {
        if (coop_estPositionValide(p, off, 0, newRot)) {
            p.rotation = newRot;
            p.x += off;
            return;
        }
    }
}

export function coop_chuteRapide(joueur) {
    const p = coop[joueur].pieceActuelle;
    if (!p || coop.estEnPause) return;
    let dist = 0;
    while (coop_estPositionValide(p, 0, dist + 1)) dist++;
    p.y += dist;
    coop.score += dist * 2;
    coop_rafraichirStats();
    coop_verrouillerPiece(joueur);
}

export function coop_utiliserReserve(joueur) {
    const jData = coop[joueur];
    if (jData.reserveUtilisee || coop.estEnPause) return;

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
    const offset = joueur === 'j1' ? 0 : DEMI_LARGEUR;
    jData.pieceActuelle.x = offset + Math.floor(DEMI_LARGEUR / 2) - Math.floor(forme[0].length / 2);
    jData.pieceActuelle.y = 0;
    jData.pieceActuelle.joueur = joueur;
    jData.reserveUtilisee = true;
}

export function utiliserPasserelle(joueur) {
    const jData = coop[joueur];
    const cible = joueur === 'j1' ? 'j2' : 'j1';
    const cibleD = coop[cible];

    if (!jData.passerelleDisponible || coop.estEnPause) return;

    const pieceAEnvoyer = jData.prochainePiece;
    pieceAEnvoyer.joueur = cible;
    const forme = TETROMINOS[pieceAEnvoyer.type].rotations[0];
    const offset = cible === 'j1' ? 0 : DEMI_LARGEUR;
    pieceAEnvoyer.x = offset + Math.floor(DEMI_LARGEUR / 2) - Math.floor(forme[0].length / 2);
    pieceAEnvoyer.y = 0;

    const ancienneProchaine = cibleD.prochainePiece;
    cibleD.prochainePiece = pieceAEnvoyer;
    jData.prochainePiece = ancienneProchaine;
    jData.prochainePiece.joueur = joueur;
    const formeR = TETROMINOS[jData.prochainePiece.type].rotations[0];
    const offsetJ = joueur === 'j1' ? 0 : DEMI_LARGEUR;
    jData.prochainePiece.x =
        offsetJ + Math.floor(DEMI_LARGEUR / 2) - Math.floor(formeR[0].length / 2);

    jData.passerelleDisponible = false;
    const btn = document.getElementById(`btn-passerelle-${joueur}`);
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

    etat.plateau = creerPlateau();

    coop.j1 = creerJoueurVide();
    coop.j2 = creerJoueurVide();

    coop.j1.pieceActuelle = coop_nouvellePiece('j1');
    coop.j1.prochainePiece = coop_nouvellePiece('j1');
    coop.j2.pieceActuelle = coop_nouvellePiece('j2');
    coop.j2.prochainePiece = coop_nouvellePiece('j2');
}
