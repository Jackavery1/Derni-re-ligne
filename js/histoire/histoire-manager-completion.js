import { JOURNAUX_VERA, SEQUENCE_HISTOIRE } from '../histoire/histoire-donnees-exports.js';
import { SEUILS_COMPLETION } from './histoire-mondes.js';
import { store } from '../etat/store-jeu.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { sauvegarderEtatHistoire } from '../io/progression.js';
import { statsGlobales, sauvegarderStats, verifierAchievements } from '../achievements.js';
import {
    onMiroirComplete,
    verifierDeblocageTrame,
    verifierDeblocageMiroirDiffere,
} from './conditions-secrets.js';
import {
    enregistrerPrecisionMiroir,
    flushProuessesHistoire,
} from '../achievements/achievements-histoire.js';
import { reagirRoboContinueBoss } from '../ui/mascotte-robo.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import {
    victoireObjectifDeclenchee,
    calculerEtoiles,
    fusionnerEtoilesPersistees,
    estMondeZenActif,
} from '../logique/gestionnaire-difficulte.js';

export { SEUILS_COMPLETION } from './histoire-mondes.js';

function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde @param {string} mondeId @param {number} lignes @param {import('../histoire/histoire-donnees-exports.js').ETAT_HISTOIRE_VIDE} etatHist @param {number} seuil */
function _enregistrerPremiereCompletion(monde, mondeId, lignes, etatHist, seuil) {
    if (etatHist.mondesCompletes.includes(mondeId)) {
        return { journalDebloque: null, premiereCompletionCeMonde: false };
    }
    etatHist.mondesCompletes.push(mondeId);
    if (monde.biomeId === 'cyber') {
        verifierTetrisTriplesCyber(etatHist);
    }
    const journalDebloque = verifierJournalBiome(monde.biomeId, lignes, etatHist);
    if (journalDebloque) {
        etatHist.journauxTrouves.push(journalDebloque.id);
    }
    if (mondeId === 'monde_miroir') {
        onMiroirComplete(etatHist);
        enregistrerPrecisionMiroir(Math.min(1, seuil / Math.max(lignes, 1)));
    }
    if (mondeId === 'monde_trame') {
        verifierDeblocageTrame(etatHist);
    }
    return { journalDebloque, premiereCompletionCeMonde: true };
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde @param {import('../histoire/histoire-donnees-exports.js').ETAT_HISTOIRE_VIDE} etatHist */
function _enregistrerProgressionBoss(monde, etatHist) {
    if (!monde.estBoss || !monde.bossId) return;
    if (!etatHist.bossVaincus.includes(monde.bossId)) {
        etatHist.bossVaincus.push(monde.bossId);
    }
    if (monde.bossId === 'archiviste') {
        etatHist.conditionsMiroir.bossArchivisteVaincu = true;
        verifierDeblocageMiroirDiffere(etatHist);
    }
    const tousBoss = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
    const bossMondes = [
        'monde_boss_1',
        'monde_boss_2',
        'monde_boss_3',
        'monde_boss_4',
        'monde_finale',
    ];
    const sansContinueBoss = bossMondes.every((id) => (etatHist.continuesParBoss?.[id] ?? 0) === 0);
    if (
        tousBoss.every((id) => etatHist.bossVaincus.includes(id)) &&
        (etatHist.nbContinuesUtilises ?? 0) === 0 &&
        sansContinueBoss
    ) {
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

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde @param {import('../histoire/histoire-donnees-exports.js').ETAT_HISTOIRE_VIDE} etatHist @param {ReturnType<typeof verifierJournalBiome>} journalDebloque */
function _persisterCompletionMonde(monde, etatHist, journalDebloque) {
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

function _obtenirMondeSuivant(mondeId) {
    const triee = [...SEQUENCE_HISTOIRE].sort((a, b) => a.ordreGlobal - b.ordreGlobal);
    const idx = triee.findIndex((m) => m.id === mondeId);
    if (idx < 0 || idx >= triee.length - 1) return null;
    return triee[idx + 1].id;
}

function _appliquerEffetsCyberDev(monde, etatHist) {
    if (monde.biomeId !== 'cyber' || etatHist.laboDecouvert) return;
    if ((etatHist.conditionsMiroir.tetrisTriplesCyber ?? 0) < 3) return;
    etatHist.laboDecouvert = true;
    const j7 = JOURNAUX_VERA.find((j) => j.id === 'journal_7');
    if (j7 && !etatHist.journauxTrouves.includes('journal_7')) {
        etatHist.journauxTrouves.push('journal_7');
    }
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}

/**
 * Complete un monde sans narratif (mode developpeur).
 * @param {string} mondeId
 * @returns {{ suivant: string | null, dejaComplete: boolean }}
 */
export function devCompleterMondeHistoire(mondeId) {
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) return { suivant: null, dejaComplete: false };

    const etatHist = obtenirEtatHistoire();
    const dejaComplete = etatHist.mondesCompletes.includes(mondeId);
    const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;

    if (monde.biomeId === 'cyber') {
        store.histoire.mecaniques.cyberTetrisConsecutifs = 3;
    }
    if (monde.estBoss) {
        store.histoire.boss.vaincu = true;
    }

    const { journalDebloque } = _enregistrerPremiereCompletion(
        monde,
        mondeId,
        seuil,
        etatHist,
        seuil
    );
    _enregistrerProgressionBoss(monde, etatHist);
    _persisterCompletionMonde(monde, etatHist, journalDebloque);
    _appliquerEffetsCyberDev(monde, etatHist);

    if (!dejaComplete) {
        mettreAJourStatsCodexHistoire(monde);
        verifierAchievements();
    }

    return { suivant: _obtenirMondeSuivant(mondeId), dejaComplete };
}

export function surFinDeMondeHistoire(lignes, score, options = {}) {
    void score;
    if (!modeHistoireEnCours()) return;
    flushProuessesHistoire();

    const mondeId = store.histoire.mondeActuel;
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) return;

    const etatHist = obtenirEtatHistoire();
    const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
    const estComplete = monde.estBoss
        ? store.histoire.boss.vaincu === true
        : victoireObjectifDeclenchee() ||
          lignes >= seuil ||
          (estMondeZenActif() && lignes >= seuil);

    let journalDebloque = null;
    let premiereCompletionCeMonde = false;

    if (estComplete) {
        const etoiles = calculerEtoiles(mondeId, etatHist);
        fusionnerEtoilesPersistees(etatHist, mondeId, etoiles);
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;

        ({ journalDebloque, premiereCompletionCeMonde } = _enregistrerPremiereCompletion(
            monde,
            mondeId,
            lignes,
            etatHist,
            seuil
        ));
        _enregistrerProgressionBoss(monde, etatHist);
        _persisterCompletionMonde(monde, etatHist, journalDebloque);
    } else if (modeHistoireEnCours() && monde.estBoss) {
        const estDistorsion = mondeId === 'monde_finale';
        const gratuitDejaUtilise = etatHist.continueGratuitDistorsionUtilise === true;

        if (!(estDistorsion && !gratuitDejaUtilise)) {
            if (!etatHist.continuesParBoss) etatHist.continuesParBoss = {};
            etatHist.continuesParBoss[mondeId] = (etatHist.continuesParBoss[mondeId] ?? 0) + 1;
            etatHist.nbContinuesUtilises = (etatHist.nbContinuesUtilises ?? 0) + 1;
            etatHist.conditionsTrame.tousBossSansContinue = false;
        }
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;
        reagirRoboContinueBoss();
    }

    if (estComplete) {
        mettreAJourStatsCodexHistoire(monde);
    }
    verifierAchievements();

    if (estComplete) {
        const etoilesFin = calculerEtoiles(mondeId, etatHist);
        if (!options.sansNarratif) {
            void import('./histoire-manager-post-monde.js').then(
                ({ declencherNarratifPostMonde }) =>
                    declencherNarratifPostMonde(
                        monde,
                        etatHist,
                        premiereCompletionCeMonde,
                        etoilesFin
                    )
            );
        }
    } else {
        void import('./histoire-manager-ui.js').then(({ afficherBoutonCarteGameOver }) =>
            afficherBoutonCarteGameOver(true)
        );
    }
}

export {
    peutContinuerBossGratuit,
    utiliserContinueGratuitDistorsion,
} from './histoire-boss-continue.js';

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
