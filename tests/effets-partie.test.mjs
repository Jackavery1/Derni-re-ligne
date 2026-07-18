import { describe, it, expect, beforeEach, vi } from 'vitest';

const son = vi.fn();
const relancerIntervalleMusique = vi.fn();

vi.mock('../js/audio/audio.js', () => ({
    AudioMoteur: { son, relancerIntervalleMusique },
}));

vi.mock('../js/rendu/rendu-jeu.js', () => ({
    dessinerFileNext: vi.fn(),
    dessinerPreview: vi.fn(),
    afficherTexteFlottant: vi.fn(),
    obtenirYHautTas: vi.fn(() => 100),
    declencherSecousse: vi.fn(),
    declencherFlashTopout: vi.fn(),
}));

vi.mock('../js/ui/ecrans-ui.js', () => ({
    reagirRoboAuxLignes: vi.fn(),
    flashGrimaceRobo: vi.fn(),
    reagirRoboLevelUp: vi.fn(),
    verifierPlateauCritiqueRobo: vi.fn(),
    annoncer: vi.fn(),
    rafraichirStats: vi.fn(),
    afficherNotifNiveau: vi.fn(),
}));

vi.mock('../js/ui/mascotte-robo.js', () => ({
    brancherBusReactionsMascotte: vi.fn(),
}));

vi.mock('../js/rendu/rendu-robo.js', () => ({
    notifierTetrisRobo: vi.fn(),
}));

vi.mock('../js/logique/oracle-jeu.js', () => ({
    evaluerDecisionOracle: vi.fn(),
}));

vi.mock('../js/logique/boss-jeu.js', () => ({
    endommagerBoss: vi.fn(),
    bossEstActif: vi.fn(() => false),
    bossEstVaincu: vi.fn(() => false),
    notifierTetrisBoss: vi.fn(),
}));

vi.mock('../js/logique/piece-jeu.js', () => ({
    mettreAJourIndicateurRelique: vi.fn(),
}));

vi.mock('../js/logique/gestionnaire-difficulte.js', () => ({
    enregistrerProgression: vi.fn(),
    suiviDifficulteActif: vi.fn(() => false),
}));

vi.mock('../js/logique/timer-niveau.js', () => ({
    reinitialiserTimerNiveau: vi.fn(),
}));

vi.mock('../js/etat/particules-spawn.js', () => ({
    creerParticulesLigne: vi.fn(),
}));

vi.mock('../js/achievements/achievements-histoire.js', () => ({
    ajouterLignesEclipseBasse: vi.fn(),
    ajouterLignesVide: vi.fn(),
}));

vi.mock('../js/histoire/mecaniques-histoire.js', () => ({
    biomeActuelMecanique: vi.fn(() => null),
    obtenirLigneEclipse: vi.fn(() => 10),
}));

vi.mock('../js/etat/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => false),
}));

vi.mock('../js/logique/actions-jeu.js', () => ({
    obtenirActions: vi.fn(() => ({ terminerPartie: vi.fn() })),
}));

describe('effets-partie', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        const { reinitialiserBusJeu } = await import('../js/etat/bus-jeu.js');
        reinitialiserBusJeu();
    });

    async function chargerEffets() {
        const mod = await import('../js/logique/effets-partie.js');
        return mod;
    }

    it('initialise les ecouteurs bus une seule fois', async () => {
        const { initialiserEffetsPartie } = await chargerEffets();
        const { emettre } = await import('../js/etat/bus-jeu.js');
        initialiserEffetsPartie();
        initialiserEffetsPartie();
        emettre('piece:son', { type: 'ligne_1' });
        expect(son).toHaveBeenCalledTimes(1);
    });

    it('joue le son tetris pour 4 lignes', async () => {
        const { initialiserEffetsPartie } = await chargerEffets();
        const { emettre } = await import('../js/etat/bus-jeu.js');
        initialiserEffetsPartie();
        emettre('lignes:effacees', { nbSupprimees: 4, lignesEffacees: [17, 18, 19, 20] });
        expect(son).toHaveBeenCalledWith('tetris');
    });

    it('declenche flash topout et sfx mort', async () => {
        const { initialiserEffetsPartie } = await chargerEffets();
        const { initialiserEffetsVisuelsPartie } =
            await import('../js/rendu/effets-visuels-partie.js');
        const { declencherFlashTopout } = await import('../js/rendu/rendu-jeu.js');
        const { emettre } = await import('../js/etat/bus-jeu.js');
        const { reinitialiserSfxMortPartie } = await import('../js/audio/sfx-mort-partie.js');
        reinitialiserSfxMortPartie();
        initialiserEffetsVisuelsPartie();
        initialiserEffetsPartie();
        emettre('partie:topout');
        expect(declencherFlashTopout).toHaveBeenCalled();
        expect(son).toHaveBeenCalledWith('game_over');
    });

    it('joue sfx niveau sur montee et accalmie sur descente (audit B G5)', async () => {
        const { initialiserEffetsPartie } = await chargerEffets();
        const { emettre } = await import('../js/etat/bus-jeu.js');
        initialiserEffetsPartie();
        emettre('difficulte:vague', { montee: true, palierApres: 4 });
        expect(son).toHaveBeenCalledWith('niveau');
        son.mockClear();
        emettre('difficulte:vague', { montee: false, palierApres: 6 });
        expect(son).toHaveBeenCalledWith('accalmie');
        expect(relancerIntervalleMusique).toHaveBeenCalled();
    });

    it('joue sfx tspin combo et b2b sur score:maj (audit B G5)', async () => {
        const { initialiserEffetsPartie } = await chargerEffets();
        const { emettre } = await import('../js/etat/bus-jeu.js');
        initialiserEffetsPartie();
        emettre('score:maj', {
            nbLignes: 2,
            result: {
                points: 400,
                combo: 3,
                tetris: false,
                tSpin: 'full',
                backToBack: false,
                levelUp: false,
            },
        });
        expect(son).toHaveBeenCalledWith('tspin');
        expect(son).toHaveBeenCalledWith('combo');
        son.mockClear();
        emettre('score:maj', {
            nbLignes: 4,
            result: {
                points: 1200,
                combo: 1,
                tetris: true,
                tSpin: null,
                backToBack: true,
                levelUp: false,
            },
        });
        expect(son).toHaveBeenCalledWith('b2b');
    });

    it('termine sprint a 40 lignes', async () => {
        const { initialiserEffetsPartie } = await chargerEffets();
        const { etat } = await import('../js/etat/store-jeu.js');
        const { obtenirActions } = await import('../js/logique/actions-jeu.js');
        const terminer = vi.fn();
        obtenirActions.mockReturnValue({ terminerPartie: terminer });
        etat.modeJeu = 'sprint';
        etat.lignes = 40;
        const { emettre } = await import('../js/etat/bus-jeu.js');
        initialiserEffetsPartie();
        emettre('score:maj', {
            nbLignes: 1,
            result: { points: 100, combo: 1, tetris: false, levelUp: false },
        });
        await new Promise((r) => setTimeout(r, 450));
        expect(terminer).toHaveBeenCalledWith(true);
    });
});
