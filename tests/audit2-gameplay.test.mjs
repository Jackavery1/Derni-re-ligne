import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { obtenirResumeConditionsTrame } from '../js/conditions-secrets.js';
import {
    peutContinuerBossGratuit,
    utiliserContinueGratuitDistorsion,
    surFinDeMondeHistoire,
} from '../js/histoire-manager-completion.js';
import {
    obtenirTouches,
    sauvegarderTouches,
    reinitialiserTouches,
    formaterCodeTouche,
} from '../js/touches-config.js';
import { store } from '../js/store-core.js';
import { ecrireStockage } from '../js/progression.js';
import { _reinitialiserInfobullesContexte } from '../js/infobulles-contexte.js';
import { CODEX_HISTOIRE } from '../js/codex-histoire.js';
import { obtenirEtatDeblocage } from '../js/progression-histoire.js';
import { biomeEstDebloqueParHistoire } from '../js/progression-records.js';
import { ACHIEVEMENTS } from '../js/achievements-donnees.js';
import { ORDRE_BIOMES_LIBRE } from '../js/config.js';

vi.mock('../js/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => true),
}));

vi.mock('../js/mode-dev-etat.js', () => ({
    modeDevActif: vi.fn(() => false),
}));

vi.mock('../js/progression.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        chargerEtatHistoire: vi.fn(() => structuredClone(ETAT_HISTOIRE_VIDE)),
    };
});

vi.mock('../js/gestionnaire-difficulte.js', () => ({
    victoireObjectifDeclenchee: vi.fn(() => false),
    estMondeZenActif: vi.fn(() => false),
    calculerEtoiles: vi.fn(() => [false, false, false]),
    fusionnerEtoilesPersistees: vi.fn(),
    flushProuessesHistoire: vi.fn(),
}));

vi.mock('../js/achievements-histoire.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        flushProuessesHistoire: vi.fn(),
        enregistrerPrecisionMiroir: vi.fn(),
    };
});

vi.mock('../js/mascotte-robo.js', () => ({
    reagirRoboContinueBoss: vi.fn(),
}));

vi.mock('../js/achievements.js', () => ({
    statsGlobales: {},
    sauvegarderStats: vi.fn(),
    verifierAchievements: vi.fn(),
}));

vi.mock('../js/histoire-etat.js', () => ({
    obtenirEtatHistoirePersiste: vi.fn(),
    persisterEtatHistoire: vi.fn(),
}));

import { modeHistoireEnCours } from '../js/mode-histoire.js';
import { obtenirEtatHistoirePersiste } from '../js/histoire-etat.js';
import { ecrireStockageJson } from '../js/progression-stockage.js';

describe('audit 2 — gameplay UX', () => {
    beforeEach(() => {
        store.histoire.mondeActuel = 'monde_finale';
        store.histoire.boss = { vaincu: false, actif: { id: 'distorsion' } };
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
        reinitialiserTouches();
        _reinitialiserInfobullesContexte();
        vi.mocked(modeHistoireEnCours).mockReturnValue(true);
        vi.mocked(obtenirEtatHistoirePersiste).mockReturnValue(store.histoire.etat);
    });

    describe('conditions Trame', () => {
        it('resume 4 conditions avec compteur', () => {
            const etat = structuredClone(ETAT_HISTOIRE_VIDE);
            etat.conditionsTrame.miroirComplete = true;
            etat.conditionsTrame.tousJournauxTrouves = true;
            etat.conditionsTrame.tousBossSansContinue = false;
            const resume = obtenirResumeConditionsTrame(etat);
            expect(resume.validees).toBe(2);
            expect(resume.total).toBe(4);
            expect(resume.details).toHaveLength(4);
        });
    });

    describe('continue gratuit Distorsion', () => {
        it('premiere mort sans penalite trame', () => {
            const etat = structuredClone(ETAT_HISTOIRE_VIDE);
            vi.mocked(obtenirEtatHistoirePersiste).mockReturnValue(etat);
            store.histoire.etat = etat;

            surFinDeMondeHistoire(5, 1000);

            expect(etat.continuesParBoss.monde_finale).toBeUndefined();
            expect(etat.conditionsTrame.tousBossSansContinue).toBe(true);
            expect(peutContinuerBossGratuit()).toBe(true);
        });

        it('deuxieme mort apres continue gratuit penalise', () => {
            const etat = structuredClone(ETAT_HISTOIRE_VIDE);
            etat.continueGratuitDistorsionUtilise = true;
            vi.mocked(obtenirEtatHistoirePersiste).mockReturnValue(etat);
            store.histoire.etat = etat;

            surFinDeMondeHistoire(5, 1000);

            expect(etat.continuesParBoss.monde_finale).toBe(1);
            expect(etat.conditionsTrame.tousBossSansContinue).toBe(false);
            expect(peutContinuerBossGratuit()).toBe(false);
        });

        it('utiliser continue marque le flag', () => {
            const etat = structuredClone(ETAT_HISTOIRE_VIDE);
            vi.mocked(obtenirEtatHistoirePersiste).mockReturnValue(etat);
            store.histoire.etat = etat;

            utiliserContinueGratuitDistorsion();
            expect(etat.continueGratuitDistorsionUtilise).toBe(true);
        });
    });

    describe('rebinding touches', () => {
        it('persiste et fusionne avec defauts', () => {
            sauvegarderTouches({ gauche: 'KeyA' });
            expect(obtenirTouches().gauche).toBe('KeyA');
            expect(obtenirTouches().droite).toBe('ArrowRight');
        });

        it('formate les codes clavier', () => {
            expect(formaterCodeTouche('ArrowLeft')).toBe('←');
            expect(formaterCodeTouche('KeyQ')).toBe('Q');
        });
    });

    describe('narration et progression (audit 2 dims 4-5)', () => {
        it('debloque le codex Chemins caches apres archiviste', () => {
            const stats = { bossHistoireVaincus: ['archiviste'] };
            expect(CODEX_HISTOIRE.chemins_caches.condition(stats)).toBe(true);
            expect(CODEX_HISTOIRE.chemins_caches.texte.length).toBeGreaterThanOrEqual(4);
        });

        it('debloque achievements apres le prologue', () => {
            const etat = structuredClone(ETAT_HISTOIRE_VIDE);
            etat.mondesCompletes = ['monde_prologue'];
            ecrireStockageJson('derniereLigne_histoire', etat);
            expect(obtenirEtatDeblocage().achievements).toBe(true);
        });

        it('expose le trophée premiere ligne', () => {
            expect(ACHIEVEMENTS.premiere_ligne.condition({ lignesTotal: 1 })).toBe(true);
        });

        it('debloque un biome histoire en mode libre apres completion', () => {
            const etat = structuredClone(ETAT_HISTOIRE_VIDE);
            etat.mondesCompletes = ['monde_rouille'];
            ecrireStockageJson('derniereLigne_histoire', etat);
            expect(biomeEstDebloqueParHistoire('rouille')).toBe(true);
            expect(biomeEstDebloqueParHistoire('eclipse')).toBe(false);
        });

        it('inclut les biomes histoire dans la constellation libre', () => {
            expect(ORDRE_BIOMES_LIBRE).toContain('rouille');
            expect(ORDRE_BIOMES_LIBRE.length).toBe(15);
        });
    });

    describe('polish et contenu (audit 2 dims 9-10)', () => {
        it('expose l option accents UI', async () => {
            const { obtenirAccentsUi, persisterAccentsUi, sansAccentsE } =
                await import('../js/texte-jeu.js');
            persisterAccentsUi(true);
            expect(obtenirAccentsUi()).toBe(true);
            expect(sansAccentsE('RÉSERVE')).toBe('RÉSERVE');
            persisterAccentsUi(false);
            expect(sansAccentsE('RÉSERVE')).toBe('RESERVE');
        });

        it('persiste les records sprint par biome', async () => {
            const { sauvegarderRecordSprintBiome, obtenirRecordSprintBiome } =
                await import('../js/progression-records.js');
            expect(sauvegarderRecordSprintBiome('classique', 95000)).toBe(true);
            expect(obtenirRecordSprintBiome('classique')).toBe(95000);
            expect(sauvegarderRecordSprintBiome('classique', 90000)).toBe(true);
            expect(obtenirRecordSprintBiome('classique')).toBe(90000);
        });

        it('ajoute des niveaux architecte proceduraux', async () => {
            const { NIVEAUX_ARCHI } = await import('../js/archi-donnees.js');
            const { obtenirNiveauxArchiProceduraux, obtenirTousNiveauxArchi } =
                await import('../js/archi-generateur.js');
            expect(obtenirNiveauxArchiProceduraux().length).toBeGreaterThanOrEqual(10);
            expect(obtenirTousNiveauxArchi().length).toBe(
                NIVEAUX_ARCHI.length + obtenirNiveauxArchiProceduraux().length
            );
        });

        it('resume les records locaux debloques', async () => {
            const { obtenirResumeRecordsLocaux } = await import('../js/progression-records.js');
            const resume = obtenirResumeRecordsLocaux();
            expect(resume.length).toBeGreaterThan(0);
            expect(resume[0]).toHaveProperty('record');
            expect(resume[0]).toHaveProperty('sprintMs');
        });
    });
});
