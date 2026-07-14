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
import { reinitialiserHistoriquePositions } from '../rendu/decorations-jeu.js';
import { donneesPartie, reinitialiserDonneesPartie } from '../ui/profil-jeu.js';
import { obtenirBiomeActif } from '../etat/store-jeu.js';
import { initStatsPartie } from '../achievements.js';
import { initParticulesAmbiance, dessinerFileNext, rendreFrameJeu } from '../rendu/rendu-jeu.js';
import { reinitialiserMascottePartie, rafraichirStats, cacherEcrans } from '../ui/ecrans-ui.js';
import { mettreAJourIndicateurRelique } from './piece-jeu.js';
import { reinitialiserTimerNiveau } from './timer-niveau.js';
import {
    initialiserMecaniquesHistoire,
    arreterMecaniquesHistoire,
} from '../histoire/mecaniques-histoire.js';
import { rafraichirHudObjectifsHistoire } from '../ui/ui-objectifs-hud.js';
import { initialiserAudioBiome } from '../audio/audio-partie.js';

export function initialiserFeaturesPartie() {
    reinitialiserOraclePartie();
    if (modeHistoireEnCours()) {
        reinitialiserConditionsRuntime();
    }
    afficherSectionOracle(oracle.actif);
    mettreAJourStatsOracleUI();
    document.getElementById('oracle-bonus-go-wrap')?.classList.add('element-masque');

    void import('../audio/melodie.js').then(({ reinitialiserMelodie }) => reinitialiserMelodie());
    reinitialiserHistoriquePositions();
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
    void import('../rendu/layout-jeu.js').then(({ adapterInterface }) => adapterInterface());
    const ctxReserve = obtenirCtxReserve();
    const canvasReserve = obtenirCanvasReserve();
    if (!ctxReserve || !canvasReserve) {
        throw new Error('Canvas reserve indisponible');
    }
    ctxReserve.clearRect(0, 0, canvasReserve.width, canvasReserve.height);
    dessinerFileNext();
    mettreAJourIndicateurRelique();

    rafraichirStats();
    reinitialiserTimerNiveau();
    const elTemps = document.getElementById('affichage-temps');
    if (elTemps) elTemps.textContent = '00:00';
    cacherEcrans();
    initParticulesAmbiance();
    arreterMecaniquesHistoire();
    initialiserMecaniquesHistoire();
    document.body.classList.add('partie-active');
    reinitialiserMascottePartie();

    document.getElementById('btn-pause').textContent = '⏸ PAUSE';

    if (modeHistoireEnCours()) {
        rafraichirHudObjectifsHistoire();
    }

    definirAccumulateur(0);
    rendreFrameJeu();
    declencherCalculOracle();
}
