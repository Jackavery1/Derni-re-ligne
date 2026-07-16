import { AudioMoteur } from '../audio/audio.js';
import { etat, particules } from '../etat/store-jeu.js';
import { annulerMeteo } from './meteo.js';
import { annulerTimersVivant } from './vivant.js';
import { arreterBoss } from './boss-jeu.js';
import { arreterMecaniquesHistoire } from '../histoire/mecaniques-histoire.js';
import { reinitialiserMascottePartie, retournerAuMenuTitre } from '../ui/ecrans-ui.js';
import { emettre } from '../etat/bus-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';

export function arreterPartieEnCours() {
    emettre('fond-biome:arreter');
    void import('../audio/melodie.js').then(({ arreterLectureMelodie }) => arreterLectureMelodie());
    annulerTimersVivant();
    etat.estEnCours = false;
    etat.estEnPause = false;
    particules.length = 0;
    annulerMeteo();
    arreterBoss();
    arreterMecaniquesHistoire();
    AudioMoteur.arreterMusique();
    reinitialiserMascottePartie();
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.textContent = '⏸ PAUSE';
}

export function quitterVersMenu() {
    arreterPartieEnCours();
    retournerAuMenuTitre();
}

export function quitterVersCarteHistoire() {
    if (!modeHistoireEnCours()) return;
    arreterPartieEnCours();
    void import('../histoire/histoire-session.js').then(({ retournerACarte }) => retournerACarte());
}
