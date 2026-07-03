import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const { afficherEcran, planifierBoucle, modeHistoireEnCours } = vi.hoisted(() => ({
    afficherEcran: vi.fn(),
    planifierBoucle: vi.fn(),
    modeHistoireEnCours: vi.fn(() => false),
}));

vi.mock('../js/meteo.js', () => ({
    annulerMeteo: vi.fn(),
}));

vi.mock('../js/audio.js', () => ({
    AudioMoteur: { arreterMusique: vi.fn(), son: vi.fn() },
}));

vi.mock('../js/progression.js', () => ({
    calculerPointsProgression: vi.fn(() => 2),
    obtenirRecordBiome: vi.fn(() => 1000),
    sauvegarderNiveauGlobal: vi.fn(),
}));

vi.mock('../js/store-jeu.js', () => ({
    etat: { estEnCours: true, lignes: 12, niveau: 3, score: 4500 },
    store: { histoire: { actif: false } },
    obtenirBiomeActif: vi.fn(() => 'classique'),
    obtenirNiveauGlobal: vi.fn(() => 5),
    ajouterNiveauGlobal: vi.fn(),
    ECRANS: { GAME_OVER: 'ecran-game-over' },
}));

vi.mock('../js/ecrans-ui.js', () => ({
    appliquerHumeurMascotte: vi.fn(),
    reagirRoboGameOver: vi.fn(),
    reagirRoboNouveauRecord: vi.fn(),
    annoncer: vi.fn(),
    afficherEcran,
    sauvegarderRecord: vi.fn(() => false),
    mettreAJourAffichageRecord: vi.fn(),
    formaterTemps: vi.fn(() => '01:23'),
    obtenirTempsEcoule: vi.fn(() => 83000),
}));

vi.mock('../js/boucle-jeu.js', () => ({
    planifierBoucle,
}));

vi.mock('../js/melodie.js', () => ({
    afficherMelodieGameOver: vi.fn(),
}));

vi.mock('../js/achievements.js', () => ({
    finaliserStatsPartie: vi.fn(),
    statsGlobales: {},
}));

vi.mock('../js/codex.js', () => ({
    planifierVerifierCodex: vi.fn(),
}));

vi.mock('../js/profil-jeu.js', () => ({
    sauvegarderSnapshotProfil: vi.fn(),
}));

vi.mock('../js/gestionnaire-difficulte.js', () => ({
    enregistrerTopOut: vi.fn(),
    arreterSuiviMonde: vi.fn(),
}));

vi.mock('../js/histoire-manager.js', () => ({
    surFinDeMondeHistoire: vi.fn(),
    peutContinuerBossGratuit: vi.fn(() => false),
    obtenirEtatHistoire: vi.fn(() => ({ conditionsTrame: {}, nbContinuesUtilises: 0 })),
}));

vi.mock('../js/mode-histoire.js', () => ({
    modeHistoireEnCours,
}));

vi.mock('../js/registre-modes.js', () => ({
    modeCoopEnCours: vi.fn(() => false),
}));

vi.mock('../js/mode-defi-jour.js', () => ({
    defiJourActif: false,
}));

vi.mock('../js/haptique.js', () => ({
    vibrerFinPartie: vi.fn(),
}));

vi.mock('../js/leaderboard-cloud.js', () => ({
    planifierSoumissionLeaderboard: vi.fn(),
}));

vi.mock('../js/partie-fin-commun.js', () => ({
    finaliserPartieCommune: vi.fn(),
}));

vi.mock('../js/boss-jeu.js', () => ({
    bossEstActif: vi.fn(() => false),
    arreterBoss: vi.fn(),
    obtenirBossIdActif: vi.fn(() => null),
    appliquerRepliqueGameOverBoss: vi.fn(),
}));

vi.mock('../js/mecaniques-histoire.js', () => ({
    onGameOverHistoire: vi.fn(),
}));

vi.mock('../js/oracle-jeu.js', () => ({
    oracle: { actif: false },
    obtenirScoreFinalOracle: vi.fn(() => 4500),
}));

vi.mock('../js/rendu-fond-biome.js', () => ({
    arreterFondBiome: vi.fn(),
}));

vi.mock('../js/coop-logique.js', () => ({
    coop: { actif: false },
}));

import { terminerPartie } from '../js/partie-fin.js';
import { surFinDeMondeHistoire } from '../js/histoire-manager.js';
import { etat } from '../js/store-jeu.js';
import { sauvegarderRecord } from '../js/ecrans-ui.js';

describe('partie-fin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
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
        document.querySelector = (sel) => (sel === '.go-titre' ? elements['go-titre'] : null);
        etat.estEnCours = true;
        etat.lignes = 12;
        etat.niveau = 3;
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
        expect(sauvegarderRecord).not.toHaveBeenCalled();
    });

    it('victoire histoire affiche le game over puis retarde le narratif', () => {
        modeHistoireEnCours.mockReturnValue(true);
        terminerPartie(true);
        expect(afficherEcran).not.toHaveBeenCalled();
        expect(surFinDeMondeHistoire).not.toHaveBeenCalled();
        vi.advanceTimersByTime(350);
        expect(afficherEcran).toHaveBeenCalledWith('ecran-game-over');
        vi.advanceTimersByTime(900);
        expect(surFinDeMondeHistoire).toHaveBeenCalledWith(12, 4500);
    });
});
