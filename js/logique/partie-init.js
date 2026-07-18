import { obtenirCtxReserve, obtenirCanvasReserve, definirAccumulateur } from '../etat/store-jeu.js';
import {
    oracle,
    reinitialiserOraclePartie,
    afficherSectionOracle,
    mettreAJourStatsOracleUI,
    declencherCalculOracle,
} from './oracle-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { reinitialiserConditionsRuntime } from '../histoire/conditions-secrets.js';
import { donneesPartie, reinitialiserDonneesPartie } from '../ui/profil-jeu.js';
import { obtenirBiomeActif } from '../etat/store-jeu.js';
import { initStatsPartie } from '../achievements.js';
import { reinitialiserMascottePartie, rafraichirStats, cacherEcrans } from '../ui/ecrans-ui.js';
import { mettreAJourIndicateurRelique } from './piece-jeu.js';
import { reinitialiserTimerNiveau } from './timer-niveau.js';
import {
    initialiserMecaniquesHistoire,
    arreterMecaniquesHistoire,
} from '../histoire/mecaniques-histoire.js';
import { rafraichirHudObjectifsHistoire } from '../ui/ui-objectifs-hud.js';
import { initialiserAudioBiome } from '../audio/audio-partie.js';
import { emettre } from '../etat/bus-jeu.js';

export function initialiserFeaturesPartie() {
    reinitialiserOraclePartie();
    if (modeHistoireEnCours()) {
        reinitialiserConditionsRuntime();
    }
    afficherSectionOracle(oracle.actif);
    mettreAJourStatsOracleUI();
    document.getElementById('oracle-bonus-go-wrap')?.classList.add('element-masque');

    void import('../audio/melodie.js').then(({ reinitialiserMelodie }) => reinitialiserMelodie());
    emettre('partie:rendu-features');
    reinitialiserDonneesPartie();
    donneesPartie.biomeId = obtenirBiomeActif();
    initStatsPartie();
    void import('../codex.js').then((m) => m.planifierVerifierCodex());
    void import('./constellation.js').then(({ arreterConstellation }) => arreterConstellation());
}

export function initialiserAudioPartie() {
    initialiserAudioBiome(obtenirBiomeActif());
}

export function initialiserUIPartie() {
    const ctxReserve = obtenirCtxReserve();
    const canvasReserve = obtenirCanvasReserve();
    if (!ctxReserve || !canvasReserve) {
        throw new Error('Canvas reserve indisponible');
    }
    ctxReserve.clearRect(0, 0, canvasReserve.width, canvasReserve.height);
    mettreAJourIndicateurRelique();

    rafraichirStats();
    reinitialiserTimerNiveau();
    const elTemps = document.getElementById('affichage-temps');
    if (elTemps) elTemps.textContent = '00:00';
    cacherEcrans();
    arreterMecaniquesHistoire();
    initialiserMecaniquesHistoire();
    document.body.classList.add('partie-active');
    reinitialiserMascottePartie();

    document.getElementById('btn-pause').textContent = '⏸ PAUSE';

    if (modeHistoireEnCours()) {
        rafraichirHudObjectifsHistoire();
    }

    definirAccumulateur(0);
    emettre('partie:rendu-ui');
    declencherCalculOracle();
}
