import { JOURNAUX_VERA, ETAT_HISTOIRE_VIDE, SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import {
    afficherVictoireBoss,
    afficherTransitionChapitre,
    afficherJournalVera,
    declencherFin,
    obtenirTransitionApresVictoire,
    obtenirTypeFin,
    typeFinVersCleBoss,
    afficherDecouverteLabo,
    obtenirCutscenePostMonde,
} from './histoire-narratif.js';
import { store } from './store-core.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { sauvegarderEtatHistoire } from './progression.js';
import { statsGlobales, sauvegarderStats, verifierAchievements } from './achievements.js';
import { onMiroirComplete, verifierDeblocageTrame } from './conditions-secrets.js';
import { enregistrerPrecisionMiroir } from './achievements-histoire.js';
import { afficherBoutonCarteGameOver } from './histoire-manager-ui.js';
import { definirExpressionVera } from './portraits-vera.js';

export const SEUILS_COMPLETION = {
    classique: 8,
    lave: 10,
    rouille: 9,
    ocean: 10,
    foret: 10,
    glace: 10,
    desert: 11,
    eclipse: 10,
    cyber: 12,
    fuochi: 12,
    cosmos: 12,
    vide: 9,
    miroir: 12,
    trame: 14,
};

function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

export function surFinDeMondeHistoire(lignes, score) {
    void score;
    if (!store.histoire.actif) return;

    const mondeId = store.histoire.mondeActuel;
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) return;

    const etatHist = obtenirEtatHistoire();
    const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
    const estComplete = lignes >= seuil || (monde.estBoss && store.histoire.boss.vaincu);

    let journalDebloque = null;
    let premiereCompletionCeMonde = false;

    if (estComplete && !etatHist.mondesCompletes.includes(mondeId)) {
        premiereCompletionCeMonde = true;
        etatHist.mondesCompletes.push(mondeId);

        if (monde.biomeId === 'cyber') {
            verifierTetrisTriplesCyber(etatHist);
        }

        journalDebloque = verifierJournalBiome(monde.biomeId, lignes, etatHist);
        if (journalDebloque) {
            etatHist.journauxTrouves.push(journalDebloque.id);
        }

        if (mondeId === 'monde_miroir') {
            onMiroirComplete(etatHist);
            const precision = Math.min(1, seuil / Math.max(lignes, 1));
            enregistrerPrecisionMiroir(precision);
        }
        if (mondeId === 'monde_trame') {
            verifierDeblocageTrame(etatHist);
        }
    }

    if (estComplete) {
        if (monde.estBoss && monde.bossId) {
            if (!etatHist.bossVaincus.includes(monde.bossId)) {
                etatHist.bossVaincus.push(monde.bossId);
            }
            if (monde.bossId === 'archiviste') {
                etatHist.conditionsMiroir.bossArchivisteVaincu = true;
            }
            const tousBoss = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
            const tousVaincus = tousBoss.every((id) => etatHist.bossVaincus.includes(id));
            if (tousVaincus && etatHist.nbContinuesUtilises === 0) {
                etatHist.conditionsTrame.tousBossSansContinue = true;
            }
            if (monde.bossId === 'sentinelle') {
                const j5 = JOURNAUX_VERA.find((j) => j.id === 'journal_5');
                if (j5 && !etatHist.journauxTrouves.includes(j5.id)) {
                    etatHist.journauxTrouves.push(j5.id);
                    store.histoire.dernierJournal = j5;
                }
            }
        }

        if (etatHist.journauxTrouves.length >= JOURNAUX_VERA.length) {
            etatHist.conditionsTrame.tousJournauxTrouves = true;
            verifierDeblocageTrame(etatHist);
        }

        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;

        if (monde.biomeId === 'cyber') {
            etatHist.conditionsMiroir.tetrisTriplesCyber = Math.max(
                etatHist.conditionsMiroir.tetrisTriplesCyber ?? 0,
                store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0
            );
            sauvegarderEtatHistoire(etatHist);
            store.histoire.etat = etatHist;
        }

        if (journalDebloque) {
            store.histoire.dernierJournal = journalDebloque;
        }
    }

    if (!estComplete && store.histoire.actif) {
        etatHist.nbContinuesUtilises = (etatHist.nbContinuesUtilises ?? 0) + 1;
        etatHist.conditionsTrame.tousBossSansContinue = false;
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;
    }

    if (estComplete && monde) {
        mettreAJourStatsCodexHistoire(monde);
    }
    verifierAchievements();

    if (estComplete) {
        declencherNarratifPostMonde(monde, etatHist, premiereCompletionCeMonde);
    } else {
        afficherBoutonCarteGameOver(true);
    }
}

function verifierJournalBiome(biomeId, lignes, etatHist) {
    const journal = JOURNAUX_VERA.find((j) => {
        if (j.biomeId !== biomeId) return false;
        if (etatHist.journauxTrouves.includes(j.id)) return false;
        if (j.condition === 'effacer_10_lignes_biome' && lignes < 10) return false;
        if (j.condition === 'effacer_8_lignes_biome' && lignes < 8) return false;
        if (j.condition === 'effacer_12_lignes_biome' && lignes < 12) return false;
        if (j.condition === 'debloquer_apres_boss_sentinelle') return false;
        if (j.condition === 'trouver_laboratoire_vera') return false;
        return true;
    });
    return journal ?? null;
}

function mettreAJourStatsCodexHistoire(monde) {
    if (monde.biomeId && !statsGlobales.biomesJoues.has(monde.biomeId)) {
        statsGlobales.biomesJoues.add(monde.biomeId);
    }
    if (monde.estBoss && monde.bossId) {
        if (!statsGlobales.bossHistoireVaincus) {
            statsGlobales.bossHistoireVaincus = [];
        }
        if (!statsGlobales.bossHistoireVaincus.includes(monde.bossId)) {
            statsGlobales.bossHistoireVaincus.push(monde.bossId);
        }
    }
    const etatHist = obtenirEtatHistoire();
    statsGlobales.journauxHistoire = etatHist.journauxTrouves ?? [];
    statsGlobales.toutesFinHistoire = etatHist.toutesFinObtenues ?? [];
    statsGlobales.mondesHistoireCompletes = [...(etatHist.mondesCompletes ?? [])];
    statsGlobales.mondesCachesDebloques = [...(etatHist.mondesCachesDebloques ?? [])];
    sauvegarderStats();
}

function verifierTetrisTriplesCyber(etatHist) {
    const tetrisTriples = store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0;
    if (tetrisTriples >= 3) {
        etatHist.conditionsMiroir.tetrisTriplesCyber = tetrisTriples;
    }
}

function declencherNarratifPostMonde(monde, etatHist, premiereCompletion) {
    if (
        monde.biomeId === 'cyber' &&
        etatHist.conditionsMiroir.tetrisTriplesCyber >= 3 &&
        !etatHist.laboDecouvert
    ) {
        etatHist.laboDecouvert = true;
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;

        const j7 = trouverJournal('journal_7');
        if (j7 && !etatHist.journauxTrouves.includes('journal_7')) {
            etatHist.journauxTrouves.push('journal_7');
            sauvegarderEtatHistoire(etatHist);
            store.histoire.etat = etatHist;
            store.histoire.dernierJournal = j7;
        }

        afficherDecouverteLabo(() => suiteNarratifPostMonde(monde, etatHist, premiereCompletion));
        return;
    }

    if (monde.estBoss && monde.bossId) {
        if (monde.bossId === 'distorsion') {
            const typeFin = obtenirTypeFin();
            definirExpressionVera(
                typeFin === 'fin_secrete'
                    ? 'fin_secrete'
                    : typeFin === 'fin_vraie'
                      ? 'fin_vraie'
                      : 'fin_normale'
            );
            afficherVictoireBoss(monde.bossId, typeFinVersCleBoss(typeFin), () =>
                declencherFin(typeFin)
            );
            return;
        }
        definirExpressionVera('boss_vaincu');
        afficherVictoireBoss(monde.bossId, 'normal', () =>
            suiteNarratifPostMonde(monde, etatHist, premiereCompletion)
        );
        return;
    }

    suiteNarratifPostMonde(monde, etatHist, premiereCompletion);
}

function suiteNarratifPostMonde(monde, etatHist, premiereCompletion) {
    void etatHist;
    const journal = store.histoire.dernierJournal;
    if (journal) {
        store.histoire.dernierJournal = null;
        definirExpressionVera('journal_decouvert');
        afficherJournalVera(journal, () => suiteTransitionChapitre(monde, premiereCompletion));
        return;
    }
    suiteTransitionChapitre(monde, premiereCompletion);
}

function suiteTransitionChapitre(monde, premiereCompletion) {
    const cleTrans = obtenirTransitionApresVictoire(monde.id);
    if (cleTrans) {
        definirExpressionVera('chapitre_complete');
        afficherTransitionChapitre(cleTrans, () => afficherBoutonCarteGameOver(true));
        return;
    }

    const postMonde = obtenirCutscenePostMonde(monde.id, premiereCompletion);
    if (postMonde) {
        void import('./histoire-manager.js').then(({ afficherCutsceneHistoire }) => {
            afficherCutsceneHistoire(postMonde.lignes, postMonde.personnages, () =>
                afficherBoutonCarteGameOver(true)
            );
        });
        return;
    }

    afficherBoutonCarteGameOver(true);
}

function trouverJournal(id) {
    return JOURNAUX_VERA.find((j) => j.id === id) ?? null;
}
