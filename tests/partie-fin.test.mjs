import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const { afficherEcran, planifierBoucle, modeHistoireEnCours } = vi.hoisted(() => ({
    afficherEcran: vi.fn(),
    planifierBoucle: vi.fn(),
    modeHistoireEnCours: vi.fn(() => false),
}));

vi.mock('../js/logique/meteo.js', () => ({
    annulerMeteo: vi.fn(),
}));

vi.mock('../js/audio/audio.js', () => ({
    AudioMoteur: { arreterMusique: vi.fn(), son: vi.fn() },
}));

vi.mock('../js/io/progression.js', () => ({
    calculerPointsProgression: vi.fn(() => 2),
    obtenirRecordBiome: vi.fn(() => 1000),
    sauvegarderNiveauGlobal: vi.fn(),
    sauvegarderRecordSprintBiome: vi.fn(() => false),
    sauvegarderRecordBiome: vi.fn(() => false),
}));

vi.mock('../js/etat/store-jeu.js', () => ({
    etat: { estEnCours: true, lignes: 12, niveau: 3, score: 4500 },
    store: { histoire: { actif: false } },
    obtenirBiomeActif: vi.fn(() => 'classique'),
    obtenirNiveauGlobal: vi.fn(() => 5),
    ajouterNiveauGlobal: vi.fn(),
    ECRANS: { GAME_OVER: 'ecran-game-over' },
}));

vi.mock('../js/ui/ecrans-ui.js', () => ({
    appliquerHumeurMascotte: vi.fn(),
    reagirRoboGameOver: vi.fn(),
    reagirRoboNouveauRecord: vi.fn(),
    annoncer: vi.fn(),
    afficherEcran,
    mettreAJourAffichageRecord: vi.fn(),
    formaterTemps: vi.fn(() => '01:23'),
}));

vi.mock('../js/logique/temps-partie.js', () => ({
    obtenirTempsEcoule: vi.fn(() => 83000),
}));

vi.mock('../js/logique/boucle-jeu.js', () => ({
    planifierBoucle,
}));

vi.mock('../js/audio/melodie.js', () => ({
    afficherMelodieGameOver: vi.fn(),
}));

vi.mock('../js/achievements.js', () => ({
    finaliserStatsPartie: vi.fn(),
    statsGlobales: {},
}));

vi.mock('../js/codex.js', () => ({
    planifierVerifierCodex: vi.fn(),
}));

vi.mock('../js/ui/profil-jeu.js', () => ({
    sauvegarderSnapshotProfil: vi.fn(),
}));

vi.mock('../js/logique/gestionnaire-difficulte.js', () => ({
    enregistrerTopOut: vi.fn(),
    arreterSuiviMonde: vi.fn(),
}));

vi.mock('../js/histoire/histoire-manager-completion.js', () => ({
    surFinDeMondeHistoire: vi.fn(),
}));

vi.mock('../js/histoire/histoire-boss-continue.js', () => ({
    peutContinuerBossGratuit: vi.fn(() => false),
}));

vi.mock('../js/histoire/histoire-mondes.js', () => ({
    obtenirEtatHistoire: vi.fn(() => ({ conditionsTrame: {}, nbContinuesUtilises: 0 })),
}));

vi.mock('../js/etat/mode-histoire.js', () => ({
    modeHistoireEnCours,
}));

vi.mock('../js/etat/registre-modes.js', () => ({
    modeCoopEnCours: vi.fn(() => false),
}));

vi.mock('../js/logique/mode-defi-jour.js', () => ({
    defiJourActif: false,
}));

vi.mock('../js/audio/haptique.js', () => ({
    vibrerFinPartie: vi.fn(),
}));

vi.mock('../js/io/leaderboard-cloud.js', () => ({
    planifierSoumissionLeaderboard: vi.fn(),
}));

vi.mock('../js/logique/partie-fin-commun.js', () => ({
    finaliserPartieCommune: vi.fn(),
}));

vi.mock('../js/logique/boss-jeu.js', () => ({
    bossEstActif: vi.fn(() => false),
    arreterBoss: vi.fn(),
    obtenirBossIdActif: vi.fn(() => null),
    appliquerRepliqueGameOverBoss: vi.fn(),
}));

vi.mock('../js/histoire/mecaniques-histoire.js', () => ({
    onGameOverHistoire: vi.fn(),
}));

vi.mock('../js/logique/oracle-jeu.js', () => ({
    oracle: { actif: false },
    obtenirScoreFinalOracle: vi.fn(() => 4500),
}));

vi.mock('../js/logique/coop-logique.js', () => ({
    coop: { actif: false },
}));

import { terminerPartie } from '../js/logique/partie-fin.js';
import {
    initialiserPartieFinEffets,
    _reinitialiserPartieFinEffetsPourTests,
} from '../js/ui/partie-fin-effets.js';
import { surFinDeMondeHistoire } from '../js/histoire/histoire-manager-completion.js';
import { etat } from '../js/etat/store-jeu.js';
import { sauvegarderRecordBiome } from '../js/io/progression.js';

describe('partie-fin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        _reinitialiserPartieFinEffetsPourTests();
        initialiserPartieFinEffets();
        const elements = {
            'go-titre': { textContent: '' },
            'score-final': { textContent: '' },
            'lignes-finales': { textContent: '' },
            'niveau-final': { textContent: '' },
            'record-final': { textContent: '' },
            'temps-final': { textContent: '' },
            'badge-record': {
                textContent: '',
                classList: {
                    contains: () => false,
                    add: vi.fn(),
                    remove: vi.fn(),
                    toggle: vi.fn(),
                },
            },
            'btn-histoire-carte': { classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() } },
        };
        document.getElementById = (id) => elements[id] ?? null;
        document.querySelector = (sel) =>
            sel === '#ecran-game-over .go-titre' || sel === '.go-titre'
                ? elements['go-titre']
                : null;
        etat.estEnCours = true;
        etat.lignes = 12;
        etat.niveau = 3;
        etat.tempsDebut = Date.now() - 83000;
        etat.tempsPauseAccumule = 0;
        etat.estEnPause = false;
        etat.tempsPauseDebut = null;
        modeHistoireEnCours.mockReturnValue(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('termine la partie et affiche le game over', () => {
        terminerPartie(false);
        expect(etat.estEnCours).toBe(false);
        const scoreEl = document.getElementById('score-final');
        expect(scoreEl?.textContent.replace(/\s/g, '')).toBe('4500');
        expect(document.getElementById('lignes-finales')?.textContent).toBe('12');
        vi.runAllTimers();
        expect(afficherEcran).toHaveBeenCalledWith('ecran-game-over');
        expect(planifierBoucle).toHaveBeenCalled();
    });

    it('affiche le game over sans délai en mode immediat', () => {
        terminerPartie(false, { immediat: true });
        expect(afficherEcran).toHaveBeenCalledWith('ecran-game-over');
        expect(planifierBoucle).toHaveBeenCalled();
    });

    it('masque le badge record si pas de nouveau record', () => {
        const badge = document.getElementById('badge-record');
        terminerPartie(false);
        expect(badge?.classList.toggle).toHaveBeenCalledWith('element-masque', true);
    });

    it('ne persiste pas le record biome en mode histoire', () => {
        modeHistoireEnCours.mockReturnValue(true);
        terminerPartie(false);
        expect(sauvegarderRecordBiome).not.toHaveBeenCalled();
    });

    it('victoire histoire affiche le game over puis retarde le narratif', async () => {
        modeHistoireEnCours.mockReturnValue(true);
        terminerPartie(true);
        expect(afficherEcran).not.toHaveBeenCalled();
        expect(surFinDeMondeHistoire).not.toHaveBeenCalled();
        vi.advanceTimersByTime(280);
        expect(afficherEcran).toHaveBeenCalledWith('ecran-game-over');
        vi.advanceTimersByTime(900);
        await vi.waitFor(() => {
            expect(surFinDeMondeHistoire).toHaveBeenCalledWith(12, 4500);
        });
    });
});
