import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
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
import { store } from './store-jeu.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { sauvegarderEtatHistoire } from './progression.js';
import { definirExpressionVera } from './portraits-vera.js';
import { logger } from './logger.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { afficherRecapAvantNarratif } from './ui-panneau-objectifs.js';
import { creerFile } from './file-narrative.js';
import { extraireLignesCutscene } from './histoire-cutscene-moteur.js';
import { JOURNAUX_VERA } from './histoire-donnees.js';

const INTERLUDES_PAR_MONDE = {
    monde_rouille: 'interlude_gardiens',
    monde_eclipse: 'interlude_elle',
    monde_vide: 'interlude_veille',
};

export const CLE_FRAGMENT_PAR_MONDE = {
    monde_prologue: 'apres_prologue',
    monde_ocean: 'apres_ocean',
    monde_foret: 'apres_foret',
    monde_glace: 'apres_glace',
    monde_desert: 'apres_desert',
    monde_eclipse: 'apres_eclipse',
    monde_lave: 'apres_lave',
    monde_rouille: 'apres_rouille',
    monde_cyber: 'apres_cyber',
    monde_fuochi: 'apres_fuochi',
    monde_cosmos: 'apres_cosmos',
    monde_vide: 'apres_vide',
    monde_miroir: 'apres_miroir',
    monde_trame: 'apres_trame',
    monde_paradoxe: 'apres_paradoxe',
};

function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

function trouverJournal(id) {
    return JOURNAUX_VERA.find((j) => j.id === id) ?? null;
}

function _conditionLaboCyber(monde, etatHist) {
    const triplesPersistes = etatHist.conditionsMiroir?.tetrisTriplesCyber ?? 0;
    const triplesSession = store.histoire.mecaniques?.cyberTetrisConsecutifs ?? 0;
    return (
        monde.biomeId === 'cyber' &&
        (triplesPersistes >= 3 || triplesSession >= 3) &&
        !etatHist.laboDecouvert
    );
}

function _preparerDecouverteLabo(etatHist) {
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
}

function _conditionFragment(mondeId) {
    const cleFragment = CLE_FRAGMENT_PAR_MONDE[mondeId];
    if (!cleFragment) return false;
    try {
        const { FRAGMENTS_VERA_SIGNAL } = obtenirHistoireTextesSync();
        if (!FRAGMENTS_VERA_SIGNAL[cleFragment]) return false;
    } catch {
        return false;
    }
    const etatHist = obtenirEtatHistoire();
    return !etatHist.fragmentsVusIds?.includes(cleFragment);
}

function _executerFragmentVera(mondeId, suivant) {
    const cleFragment = CLE_FRAGMENT_PAR_MONDE[mondeId];
    const { FRAGMENTS_VERA_SIGNAL } = obtenirHistoireTextesSync();
    const etatHist = obtenirEtatHistoire();
    if (!etatHist.fragmentsVusIds) etatHist.fragmentsVusIds = [];
    etatHist.fragmentsVusIds.push(cleFragment);
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;

    const fragment = FRAGMENTS_VERA_SIGNAL[cleFragment];
    try {
        void import('./histoire-manager-ui.js')
            .then(({ afficherCutsceneHistoire }) => {
                afficherCutsceneHistoire(fragment, null, suivant);
            })
            .catch((err) => {
                logger.warn('[histoire] fragment VERA indisponible :', err);
                suivant();
            });
    } catch (err) {
        logger.warn('[histoire] erreur fragment VERA :', err);
        suivant();
    }
}

function _conditionInterlude(mondeId, premiereCompletion) {
    if (!modeHistoireEnCours() || !premiereCompletion) return false;
    const cleInterlude = INTERLUDES_PAR_MONDE[mondeId];
    if (!cleInterlude) return false;
    const etatHist = obtenirEtatHistoire();
    if (etatHist.interludesVusIds?.includes(cleInterlude)) return false;
    try {
        const interlude = obtenirHistoireTextesSync().INTERLUDES?.[cleInterlude];
        return extraireLignesCutscene(interlude).length > 0;
    } catch {
        return false;
    }
}

function _executerInterlude(mondeId, suivant) {
    const cleInterlude = INTERLUDES_PAR_MONDE[mondeId];
    const interlude = obtenirHistoireTextesSync().INTERLUDES?.[cleInterlude];
    const etatHist = obtenirEtatHistoire();
    if (!etatHist.interludesVusIds) etatHist.interludesVusIds = [];
    etatHist.interludesVusIds.push(cleInterlude);
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;

    try {
        void import('./histoire-manager-ui.js')
            .then(({ afficherCutsceneHistoire }) => {
                afficherCutsceneHistoire(interlude, null, suivant);
            })
            .catch((err) => {
                logger.warn('[histoire] interlude indisponible :', err);
                suivant();
            });
    } catch (err) {
        logger.warn('[histoire] erreur interlude :', err);
        suivant();
    }
}

export function declencherNarratifPostMonde(monde, etatHist, premiereCompletion, etoilesFin) {
    if (!modeHistoireEnCours()) return;

    const file = creerFile(`post-monde:${monde.id}`);

    file.ajouter({
        id: 'recap_etoiles',
        executer: (suivant) => {
            afficherRecapAvantNarratif(monde, etoilesFin, suivant);
        },
    });

    file.ajouter({
        id: 'labo_cyber',
        condition: () => _conditionLaboCyber(monde, obtenirEtatHistoire()),
        executer: (suivant) => {
            const etat = obtenirEtatHistoire();
            _preparerDecouverteLabo(etat);
            afficherDecouverteLabo(suivant);
        },
    });

    file.ajouter({
        id: 'victoire_boss',
        condition: () => Boolean(monde.estBoss && monde.bossId),
        executer: (suivant) => {
            if (monde.bossId === 'distorsion') {
                const typeFin = obtenirTypeFin();
                definirExpressionVera(
                    typeFin === 'fin_secrete'
                        ? 'fin_secrete'
                        : typeFin === 'fin_vraie'
                          ? 'fin_vraie'
                          : 'fin_normale'
                );
                afficherVictoireBoss(monde.bossId, typeFinVersCleBoss(typeFin), () => {
                    declencherFin(typeFin);
                });
                return;
            }
            definirExpressionVera('boss_vaincu');
            afficherVictoireBoss(monde.bossId, 'normal', suivant);
        },
    });

    file.ajouter({
        id: 'journal',
        condition: () => Boolean(store.histoire.dernierJournal),
        executer: (suivant) => {
            const journal = store.histoire.dernierJournal;
            store.histoire.dernierJournal = null;
            definirExpressionVera('journal_decouvert');
            afficherJournalVera(journal, suivant);
        },
    });

    file.ajouter({
        id: 'transition_chapitre',
        condition: () => Boolean(obtenirTransitionApresVictoire(monde.id)),
        executer: (suivant) => {
            const cleTrans = obtenirTransitionApresVictoire(monde.id);
            definirExpressionVera('chapitre_complete');
            afficherTransitionChapitre(cleTrans, suivant);
        },
    });

    file.ajouter({
        id: 'cutscene_post_monde',
        condition: () => {
            if (obtenirTransitionApresVictoire(monde.id)) return false;
            return Boolean(obtenirCutscenePostMonde(monde.id, premiereCompletion));
        },
        executer: (suivant) => {
            const postMonde = obtenirCutscenePostMonde(monde.id, premiereCompletion);
            void import('./histoire-manager-ui.js')
                .then(({ afficherCutsceneHistoire }) => {
                    afficherCutsceneHistoire(postMonde, null, suivant);
                })
                .catch((err) => {
                    logger.warn('[histoire] cutscene post-monde indisponible :', err);
                    suivant();
                });
        },
    });

    file.ajouter({
        id: 'fragment',
        condition: () => _conditionFragment(monde.id),
        executer: (suivant) => _executerFragmentVera(monde.id, suivant),
    });

    file.ajouter({
        id: 'interlude',
        condition: () => _conditionInterlude(monde.id, premiereCompletion),
        executer: (suivant) => _executerInterlude(monde.id, suivant),
    });

    file.ajouter({
        id: 'suite_campagne',
        executer: (suivant) => {
            void import('./histoire-session.js')
                .then(({ enchainerCampagneApresMonde }) => enchainerCampagneApresMonde(monde.id))
                .then(() => suivant())
                .catch((err) => {
                    logger.warn('[histoire] suite campagne indisponible :', err);
                    suivant();
                });
        },
    });

    file.demarrer();
}
