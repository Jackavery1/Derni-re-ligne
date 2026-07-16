import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { store } from '../js/etat/store-jeu.js';
import {
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
    obtenirRecordCoopBiome,
    sauvegarderRecordCoopBiome,
} from '../js/io/progression.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import { obtenirTypeFin, SCENE_DEFAUT_POST_MONDE } from '../js/histoire/histoire-narratif.js';
import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';
import { CUTSCENES_VICTOIRE_BOSS } from '../js/histoire-textes/cutscenes-boss-victoire.js';
import { DIALOGUES_COMBAT_BOSS } from '../js/histoire-textes/dialogues-boss.js';
import { EPILOGUES, TRANSITIONS_CHAPITRE } from '../js/histoire-textes/chapitres.js';
import { OUTRO_FINS } from '../js/histoire-textes/intro-interludes.js';
import { extraireLignesCutscene } from '../js/histoire/histoire-cutscene-moteur.js';
import { CUTSCENES_ENTREE } from '../js/histoire-textes/cutscenes-entree.js';
import { FRAGMENTS_VERA_SIGNAL } from '../js/histoire-textes/journaux.js';
import {
    MARQUEURS_NARRATIFS_POST_MONDE,
    MARQUEURS_NARRATIFS_CAMPAGNE,
    HUMEURS_POST_MONDE_PIVOT,
    HUMEURS_ENTREE_PIVOT,
} from '../e2e/helpers-narratif.mjs';
import { chargerDonneesCodex, codexDebloque, verifierCodex } from '../js/codex.js';
import { statsGlobales } from '../js/achievements.js';
import { meteo } from '../js/logique/meteo.js';
import { CONFIG } from '../js/config/config-jeu.js';
import { METEO_BIOMES, chargerContenuJeu } from '../js/config/contenu-jeu.js';
import { vitesseChute } from '../js/logique/logique-partie.js';
import { etat } from '../js/etat/store-jeu.js';

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

        it('pivots humeur portrait E2E — couverture ROBO/VERA par monde', () => {
            const mondesAvecHumeur = Object.keys(CUTSCENES_POST_MONDE)
                .filter((id) =>
                    CUTSCENES_POST_MONDE[id].lignes?.some(
                        (l) => l.humeur && (l.personnage === 'robo' || l.personnage === 'vera')
                    )
                )
                .sort();
            expect(Object.keys(HUMEURS_POST_MONDE_PIVOT).sort()).toEqual(mondesAvecHumeur);
        });

        it('pivots humeur entree E2E — couverture ROBO/VERA/Distorsion', () => {
            const mondesAvecHumeur = Object.keys(CUTSCENES_ENTREE)
                .filter((id) => {
                    const entree = CUTSCENES_ENTREE[id];
                    const lignes = Array.isArray(entree) ? entree : (entree?.lignes ?? []);
                    return lignes.some(
                        (l) =>
                            l.humeur &&
                            (l.personnage === 'robo' ||
                                l.personnage === 'vera' ||
                                l.personnage === 'distorsion')
                    );
                })
                .sort();
            expect(Object.keys(HUMEURS_ENTREE_PIVOT).sort()).toEqual(mondesAvecHumeur);
            expect(Object.keys(HUMEURS_ENTREE_PIVOT).length).toBeGreaterThanOrEqual(16);
        });
    });

    describe('marqueurs narratifs post-monde', () => {
        function extraireCorpus(entree) {
            const lignes = Array.isArray(entree) ? entree : (entree?.lignes ?? []);
            return lignes.map((l) => l.texte).join('\n');
        }

        for (const [mondeId, marqueurs] of Object.entries(MARQUEURS_NARRATIFS_POST_MONDE)) {
            it(`${mondeId} — marqueurs présents dans CUTSCENES_POST_MONDE`, () => {
                const entree = CUTSCENES_POST_MONDE[mondeId];
                expect(entree, mondeId).toBeTruthy();
                const corpus = extraireCorpus(entree);
                for (const re of marqueurs) {
                    expect(corpus, `${mondeId} → ${re}`).toMatch(re);
                }
            });
        }

        const TRANSITION_PAR_MONDE = {
            monde_prologue: 'vers_chapitre_1',
            monde_boss_1: 'vers_chapitre_2',
            monde_boss_2: 'vers_chapitre_3',
            monde_boss_3: 'vers_chapitre_4',
            monde_boss_4: 'vers_finale',
        };

        const VICTOIRE_BOSS_PAR_MONDE = {
            monde_boss_1: 'brasier',
            monde_boss_2: 'sentinelle',
            monde_boss_3: 'archiviste',
            monde_boss_4: 'avantgarde',
        };

        for (const [mondeId, marqueurs] of Object.entries(MARQUEURS_NARRATIFS_CAMPAGNE)) {
            it(`${mondeId} — marqueurs campagne dans le corpus narratif`, () => {
                const parties = [];
                if (CUTSCENES_POST_MONDE[mondeId]) {
                    parties.push(extraireCorpus(CUTSCENES_POST_MONDE[mondeId]));
                }
                const cleTransition = TRANSITION_PAR_MONDE[mondeId];
                if (cleTransition && TRANSITIONS_CHAPITRE[cleTransition]) {
                    parties.push(extraireCorpus(TRANSITIONS_CHAPITRE[cleTransition]));
                }
                const bossId = VICTOIRE_BOSS_PAR_MONDE[mondeId];
                if (bossId && CUTSCENES_VICTOIRE_BOSS[bossId]) {
                    parties.push(extraireCorpus(CUTSCENES_VICTOIRE_BOSS[bossId]));
                }
                if (mondeId === 'monde_finale') {
                    for (const suffixe of ['normal', 'vrai', 'secret']) {
                        const cle = `distorsion_${suffixe}`;
                        if (CUTSCENES_VICTOIRE_BOSS[cle]) {
                            parties.push(extraireCorpus(CUTSCENES_VICTOIRE_BOSS[cle]));
                        }
                    }
                }
                const corpus = parties.join('\n');
                expect(corpus.length, mondeId).toBeGreaterThan(0);
                for (const re of marqueurs) {
                    expect(corpus, `${mondeId} → ${re}`).toMatch(re);
                }
            });
        }
    });

    describe('corpus post-monde', () => {
        it('monde_finale absent de CUTSCENES_POST_MONDE', () => {
            expect(CUTSCENES_POST_MONDE.monde_finale).toBeUndefined();
        });

        it('monde_paradoxe ellipse volontaire et humeur VERA douce', () => {
            const lignes = extraireLignesCutscene(CUTSCENES_POST_MONDE.monde_paradoxe);
            const corpus = lignes.map((l) => l.texte ?? '').join('\n');
            expect(corpus).toMatch(/ligne incomplète\. Volontairement/i);
            for (const re of MARQUEURS_NARRATIFS_POST_MONDE.monde_paradoxe) {
                expect(corpus).toMatch(re);
            }
            expect(lignes.some((l) => l.personnage === 'vera' && l.humeur === 'douce')).toBe(true);
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

        it('sauvegarderRecordBiome ignore un score inférieur en défaite', () => {
            sauvegarderRecordBiome('classique', 5000, 3);
            expect(sauvegarderRecordBiome('classique', 2000, 2)).toBe(false);
            expect(obtenirRecordBiome('classique')).toBe(5000);
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

        it('le courant océan télégraphie la dérive au verrouillage', async () => {
            await chargerContenuJeu();
            const ocean = METEO_BIOMES.ocean;
            expect(ocean.alerte).toContain('VERROUILLAGE');
            expect(ocean.actif).toContain('VERROUILLAGE');
        });
    });

    describe('polish narratif éditorial', () => {
        it('vers_chapitre_1 sans révélation prématurée', () => {
            const textes = TRANSITIONS_CHAPITRE.vers_chapitre_1.map((l) => l.texte).join(' ');
            expect(textes).toContain("Elle n'a jamais fini sa phrase");
            expect(textes).not.toContain('comprendre que ce n');
        });

        it('fin_normale avec battement avant mille ans', () => {
            const vera = extraireLignesCutscene(EPILOGUES.fin_normale).filter(
                (l) => l.personnage === 'vera'
            );
            expect(vera[0].texte).toContain('silence a changé');
        });

        it('fin_vraie accents complétion / incomplétude', () => {
            const narrateur = extraireLignesCutscene(EPILOGUES.fin_vraie).find(
                (l) => l.personnage === 'narrateur' && l.texte.includes('complétion')
            );
            expect(narrateur.texte).toContain('incomplétude');
        });

        it('Sentinelle vouvoie en phase 1 et game over', () => {
            expect(DIALOGUES_COMBAT_BOSS.sentinelle.phases[0]).toContain('Vos pièces');
            expect(DIALOGUES_COMBAT_BOSS.sentinelle.gameOver).toContain('vous a eu');
        });

        it('Avant-Garde — attaques combinaison diversifiees (audit B G2)', () => {
            const { BOSS } = JSON.parse(readFileSync('data/histoire-donnees.json', 'utf8'));
            expect([...new Set(BOSS.avantgarde.attaquesDisponibles)]).toEqual([
                'permutation_colonnes',
                'colonne_gelee',
                'inverser_controles',
            ]);
        });

        it('Distorsion — combinaison glace/glitch sans braise (audit B G2)', () => {
            const { BOSS } = JSON.parse(readFileSync('data/histoire-donnees.json', 'utf8'));
            expect([...new Set(BOSS.distorsion.attaquesDisponibles)]).toEqual([
                'colonne_gelee',
                'inverser_controles',
                'permutation_colonnes',
            ]);
            expect(BOSS.distorsion.attaquesDisponibles).not.toContain('rangee_braise');
        });

        it('distorsion_secret sans métaphore binaire explicite', () => {
            const ligne = CUTSCENES_VICTOIRE_BOSS.distorsion_secret.find(
                (l) => l.personnage === 'distorsion' && l.texte.includes('binaire')
            );
            expect(ligne.texte).toBe('Je pleure. En binaire.');
        });

        it('fin_vraie outro boucle le motif joie', () => {
            const robo = extraireLignesCutscene(OUTRO_FINS.fin_vraie).find(
                (l) => l.personnage === 'robo' && l.texte.includes('ressemble')
            );
            expect(robo.texte).toContain('Je le garde');
        });

        it('vers_chapitre_4 sans meta narrateur intrusif', () => {
            const corpus = TRANSITIONS_CHAPITRE.vers_chapitre_4.map((l) => l.texte).join(' ');
            expect(corpus).not.toMatch(/première fois que Robo/i);
        });

        it('apres_fuochi — feux sans formulation corrigée', () => {
            const texte = FRAGMENTS_VERA_SIGNAL.apres_fuochi.map((l) => l.texte).join(' ');
            expect(texte).toContain('regarde-les bien');
            expect(texte).not.toContain('je les ai allumés');
        });

        it('humeurs boss entrée — Brasier, ROBO, Sentinelle', () => {
            const brasier = CUTSCENES_ENTREE.monde_boss_1.find(
                (l) => l.personnage === 'brasier' && l.texte.includes('QUI APPROCHE')
            );
            expect(brasier.humeur).toBe('agressif');

            const roboEteindre = CUTSCENES_ENTREE.monde_boss_1.find((l) =>
                l.texte.includes("t'éteindre")
            );
            expect(roboEteindre.humeur).toBe('neutre');

            const sentinelleEntree = CUTSCENES_ENTREE.monde_boss_2[0];
            expect(sentinelleEntree.personnage).toBe('sentinelle');
            expect(sentinelleEntree.humeur).toBe('agressif');
        });

        it('journaux — accents éditoriaux verrouillés', () => {
            const corpus = Object.values(FRAGMENTS_VERA_SIGNAL)
                .flat()
                .map((l) => l.texte)
                .join('\n');
            expect(corpus).toContain('INTERFÉRENCE MÉTALLIQUE');
            expect(corpus).toContain('FERMÉE');
            expect(corpus).toContain('INVERSÉE');
            expect(corpus).toContain('DÉPÔT');
            expect(corpus).toContain('DEMANDÉ');
        });

        it('Brasier — battement Mais approche avant réplique ROBO', () => {
            const lignes = CUTSCENES_ENTREE.monde_boss_1;
            const idxApproche = lignes.findIndex((l) => l.texte.includes('Mais approche'));
            const idxEteindre = lignes.findIndex((l) => l.texte.includes("t'éteindre"));
            expect(idxApproche).toBeGreaterThan(-1);
            expect(idxEteindre).toBeGreaterThan(idxApproche);
        });
    });
});
