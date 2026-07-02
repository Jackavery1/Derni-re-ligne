import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../js/store-core.js';
import {
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
    obtenirRecordCoopBiome,
    sauvegarderRecordCoopBiome,
} from '../js/progression.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { obtenirTypeFin, SCENE_DEFAUT_POST_MONDE } from '../js/histoire-narratif.js';
import { chargerDonneesCodex, codexDebloque, verifierCodex } from '../js/codex.js';
import { statsGlobales } from '../js/achievements.js';
import { meteo } from '../js/meteo.js';
import { CONFIG } from '../js/config.js';
import { vitesseChute } from '../js/logique-partie.js';
import { etat } from '../js/store-jeu.js';

function etatHistoireComplet() {
    const e = structuredClone(ETAT_HISTOIRE_VIDE);
    e.bossVaincus = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
    e.journauxTrouves = [
        'journal_1',
        'journal_2',
        'journal_3',
        'journal_4',
        'journal_5',
        'journal_6',
        'journal_7',
        'journal_8',
        'journal_9',
    ];
    e.mondesCompletes = ['monde_miroir'];
    e.conditionsTrame = {
        miroirComplete: true,
        tousJournauxTrouves: true,
        tousBossSansContinue: true,
        actionDistorsionFaite: true,
    };
    return e;
}

describe('corrections audit', () => {
    beforeEach(() => {
        store.histoire.etat = null;
    });

    describe('codex (chargement runtime)', () => {
        it('charge des entrées avec des conditions appelables', async () => {
            const CODEX = await chargerDonneesCodex();
            const entrees = Object.values(CODEX);
            expect(entrees.length).toBeGreaterThan(0);
            expect(entrees.every((e) => typeof e.condition === 'function')).toBe(true);
        });

        it('verifierCodex débloque réellement des entrées', async () => {
            codexDebloque.clear();
            statsGlobales.maxLignesUnCoup = 4;
            await verifierCodex();
            expect(codexDebloque.has('chronique_premier_tetris')).toBe(true);
        });
    });

    describe('scènes post-monde', () => {
        it('associe chaque monde narratif à une scène par défaut', () => {
            const mondes = [
                'monde_prologue',
                'monde_lave',
                'monde_rouille',
                'monde_ocean',
                'monde_foret',
                'monde_glace',
                'monde_desert',
                'monde_eclipse',
                'monde_cyber',
                'monde_fuochi',
                'monde_cosmos',
                'monde_vide',
                'monde_miroir',
                'monde_trame',
                'monde_paradoxe',
            ];
            for (const id of mondes) {
                expect(SCENE_DEFAUT_POST_MONDE[id], id).toBeTruthy();
            }
        });
    });

    describe('fin secrète', () => {
        it('exige la complétion de LA TRAME en plus des conditions Trame', () => {
            const e = etatHistoireComplet();
            store.histoire.etat = e;
            expect(obtenirTypeFin()).toBe('fin_vraie');

            e.mondesCompletes.push('monde_trame');
            expect(obtenirTypeFin()).toBe('fin_secrete');
        });
    });

    describe('réconciliation des flags histoire au chargement', () => {
        it('dérive les flags depuis les tableaux sources (sauvegarde legacy)', () => {
            sauvegarderEtatHistoire({
                ...structuredClone(ETAT_HISTOIRE_VIDE),
                bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'],
                journauxTrouves: [
                    'journal_1',
                    'journal_2',
                    'journal_3',
                    'journal_4',
                    'journal_5',
                    'journal_6',
                    'journal_7',
                    'journal_8',
                    'journal_9',
                ],
                mondesCompletes: ['monde_miroir'],
                conditionsMiroir: { bossArchivisteVaincu: false, tetrisTriplesCyber: 3 },
                conditionsTrame: {
                    miroirComplete: false,
                    tousJournauxTrouves: false,
                    tousBossSansContinue: false,
                    actionDistorsionFaite: false,
                },
            });

            const e = chargerEtatHistoire();
            expect(e.conditionsMiroir.bossArchivisteVaincu).toBe(true);
            expect(e.conditionsTrame.tousJournauxTrouves).toBe(true);
            expect(e.conditionsTrame.miroirComplete).toBe(true);
            expect(e.conditionsTrame.tousBossSansContinue).toBe(true);
            expect(e.mondesCachesDebloques).toContain('monde_miroir');
        });

        it('un continue utilisé invalide tousBossSansContinue', () => {
            const sauve = etatHistoireComplet();
            sauve.nbContinuesUtilises = 2;
            sauvegarderEtatHistoire(sauve);
            const e = chargerEtatHistoire();
            expect(e.conditionsTrame.tousBossSansContinue).toBe(false);
        });

        it('ne mute jamais la constante ETAT_HISTOIRE_VIDE', () => {
            chargerEtatHistoire();
            expect(ETAT_HISTOIRE_VIDE.mondesCompletes).toHaveLength(0);
            expect(ETAT_HISTOIRE_VIDE.journauxTrouves).toHaveLength(0);
            expect(ETAT_HISTOIRE_VIDE.mondesCachesDebloques).toHaveLength(0);
            expect(ETAT_HISTOIRE_VIDE.conditionsMiroir.bossArchivisteVaincu).toBe(false);
        });
    });

    describe('records solo / coop séparés', () => {
        it('un record coop ne touche pas le record solo du biome', () => {
            sauvegarderRecordBiome('classique', 1000, 1);
            sauvegarderRecordCoopBiome('classique', 99999);
            expect(obtenirRecordBiome('classique')).toBe(1000);
            expect(obtenirRecordCoopBiome('classique')).toBe(99999);
        });
    });

    describe('météo sans mutation de CONFIG', () => {
        it('le facteur météo modifie la gravité sans toucher CONFIG.vitesseBase', () => {
            const vitesseBaseAvant = CONFIG.vitesseBase;
            etat.niveau = 1;
            const vitesseNormale = vitesseChute();
            meteo.facteurVitesse = 0.52;
            const vitesseAcceleree = vitesseChute();
            meteo.facteurVitesse = 1;
            expect(vitesseAcceleree).toBeLessThan(vitesseNormale);
            expect(CONFIG.vitesseBase).toBe(vitesseBaseAvant);
        });
    });
});
