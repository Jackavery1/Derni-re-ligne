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
import { store } from '../js/store-jeu.js';
import { _reinitialiserInfobullesContexte } from '../js/infobulles-contexte.js';
import { readFileSync } from 'fs';
import { CONDITIONS_CODEX } from '../js/codex-conditions.js';
import { obtenirEtatDeblocage } from '../js/progression-histoire.js';
import { biomeEstDebloqueParHistoire } from '../js/progression-records.js';
import { ACHIEVEMENTS } from '../js/achievements-donnees.js';
import { ORDRE_BIOMES_LIBRE } from '../js/config.js';
import { NOMS_MONDES_REQUIS } from '../js/constellation-rendu.js';
import {
    obtenirTexteVerrouillePanneau,
    obtenirTexteVerrouille,
} from '../js/achievements-icones-map.js';

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
        it('expose chemins caches avec condition de debloquage', () => {
            const textes = JSON.parse(readFileSync('data/codex-textes.json', 'utf8'));
            expect(textes.chemins_caches.conditionTexte).toContain('Archiviste');
            expect(textes.chemins_caches.texte.join(' ')).toContain('TRAME');
        });

        it('debloque le codex Chemins caches apres archiviste', () => {
            const textes = JSON.parse(readFileSync('data/codex-textes.json', 'utf8'));
            const cheminsCaches = {
                ...textes.chemins_caches,
                condition: CONDITIONS_CODEX.chemins_caches,
            };
            const stats = { bossHistoireVaincus: ['archiviste'] };
            expect(cheminsCaches.condition(stats)).toBe(true);
            expect(cheminsCaches.texte.length).toBeGreaterThanOrEqual(4);
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

    describe('UX constellation et modes (audit gameplay)', () => {
        it('teaser les biomes histoire verrouilles', () => {
            expect(NOMS_MONDES_REQUIS.rouille).toContain('ROUILLE');
            expect(NOMS_MONDES_REQUIS.eclipse).toContain('CLIPSE');
            expect(NOMS_MONDES_REQUIS.miroir).toContain('MIROIR');
        });

        it('oriente vers le mode histoire pour exploits verrouilles', () => {
            expect(obtenirTexteVerrouillePanneau('histoire_boss', 'Spoiler')).toContain(
                'MODE HISTOIRE'
            );
            expect(obtenirTexteVerrouille('histoire_boss', 'Spoiler')).toContain('Histoire');
        });
    });

    describe('polish et contenu (audit 2 dims 9-10)', () => {
        it('charge les infobulles modes depuis contenu-jeu.json', async () => {
            const { chargerContenuJeu, INFOBULLES_MODES_JEU } =
                await import('../js/contenu-jeu.js');
            await chargerContenuJeu();
            expect(INFOBULLES_MODES_JEU.sansFin?.titre).toBe('SANS FIN');
            expect(INFOBULLES_MODES_JEU.sprint?.desc).toContain('chrono');
            expect(INFOBULLES_MODES_JEU.oracle?.texte).toContain('Coop');
            expect(INFOBULLES_MODES_JEU.coop?.titre).toBe('COOP');
            expect(INFOBULLES_MODES_JEU.defiJour?.titre).toBe('DEFI DU JOUR');
        });

        it('ne consomme pas une infobulle mode si overlay absent', async () => {
            await import('../js/contenu-jeu.js').then(({ chargerContenuJeu }) =>
                chargerContenuJeu()
            );
            const overlay = document.getElementById('overlay-infobulle-contexte');
            overlay?.remove();
            const { proposerInfobulleModeJeu } = await import('../js/infobulles-contexte.js');
            proposerInfobulleModeJeu('sprint');
            const raw = localStorage.getItem('derniereLigne_infobullesModesJeu') ?? '{}';
            expect(JSON.parse(raw).sprint).toBeUndefined();
        });

        it('ne consomme pas une infobulle attaque boss si overlay absent', async () => {
            const overlay = document.getElementById('overlay-infobulle-contexte');
            overlay?.remove();
            const { proposerInfobulleAttaqueBoss } = await import('../js/infobulles-contexte.js');
            proposerInfobulleAttaqueBoss('faux_fantome');
            const raw = localStorage.getItem('derniereLigne_infobullesBoss') ?? '{}';
            expect(JSON.parse(raw).faux_fantome).toBeUndefined();
        });

        it('sansAccentsE retire les accents des libelles UI', async () => {
            const { sansAccentsE } = await import('../js/texte-jeu.js');
            expect(sansAccentsE('RÉSERVE')).toBe('RESERVE');
            expect(sansAccentsE('Prêt')).toBe('Pret');
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
            const niveaux = await obtenirTousNiveauxArchi();
            expect(niveaux.length).toBe(
                NIVEAUX_ARCHI.length + obtenirNiveauxArchiProceduraux().length
            );
        }, 15000);

        it('resume les records locaux debloques', async () => {
            const { obtenirResumeRecordsLocaux } = await import('../js/progression-records.js');
            const resume = obtenirResumeRecordsLocaux();
            expect(resume.length).toBeGreaterThan(0);
            expect(resume[0]).toHaveProperty('record');
            expect(resume[0]).toHaveProperty('sprintMs');
        });
    });
});
