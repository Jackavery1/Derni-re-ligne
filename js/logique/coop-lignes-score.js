import { CONFIG } from '../config/config.js';
import { appliquerScoreLignes } from './score-partie.js';
import { statsGlobales } from '../achievements.js';
import { afficherNotificationNiveau } from '../ui/ui-notifications.js';
import { obtenirBouton } from '../dom-utils.js';
import { emettre } from '../etat/bus-jeu.js';
import { etat, flashLignes } from '../etat/store-jeu.js';
import { coop, DEMI_LARGEUR, coop_rafraichirStats } from '../coop-etat.js';

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

export function afficherNotifTSpinCoop(tSpin) {
    if (typeof document === 'undefined' || !tSpin) return;
    const label = tSpin === 'full' ? 'T-SPIN !' : 'T-SPIN MINI !';
    afficherNotificationNiveau(label, {
        classesRetirer: ['notif-synchro', 'notif-niveau-vert'],
    });
}

function afficherNotifLigneEnAttenteCoop(cote) {
    if (typeof document === 'undefined') return;
    const notif = document.getElementById('notif-niveau');
    if (!notif) return;
    notif.textContent = cote === 'j1' ? 'J1 PRET — ATTENTE J2' : 'J2 PRET — ATTENTE J1';
    notif.classList.remove('notif-niveau-vert');
    notif.classList.add('notif-synchro');
    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
}

export function coop_verifierLignes() {
    const xMinJ1 = 0;
    const xMaxJ1 = DEMI_LARGEUR;
    const xMinJ2 = DEMI_LARGEUR;
    const xMaxJ2 = CONFIG.colonnes;

    let nbSupprimees = 0;
    const lignesEffacees = [];
    coop.lignesEnAttenteJ1 = -1;
    coop.lignesEnAttenteJ2 = -1;

    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        const moitieGaucheComplete = etat.plateau[l].slice(xMinJ1, xMaxJ1).every((c) => c !== 0);
        const moitieDroiteComplete = etat.plateau[l].slice(xMinJ2, xMaxJ2).every((c) => c !== 0);

        if (moitieGaucheComplete && moitieDroiteComplete) {
            coop.flashSynchro = 300;
            lignesEffacees.push(l);
            etat.plateau.splice(l, 1);
            etat.plateau.unshift(Array(CONFIG.colonnes).fill(0));
            nbSupprimees++;
            l++;
        } else {
            if (moitieGaucheComplete && !moitieDroiteComplete) {
                coop.lignesEnAttenteJ1 = l;
                afficherNotifLigneEnAttenteCoop('j1');
            }
            if (moitieDroiteComplete && !moitieGaucheComplete) {
                coop.lignesEnAttenteJ2 = l;
                afficherNotifLigneEnAttenteCoop('j2');
            }
        }
    }

    if (nbSupprimees > 0) {
        flashLignes.lignes = [...lignesEffacees];
        flashLignes.timer = flashLignes.duree;
        emettre('lignes:effacees', { nbSupprimees, lignesEffacees });
    }

    coop_rafraichirStats();
    return nbSupprimees;
}
