import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { ILLUSTRATIONS_JOURNAUX } from './histoire-illustrations.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from './histoire-etat.js';
import { creerFile } from './file-narrative.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { logger } from './logger.js';

function _obtenirEtatHistoireLocal() {
    return obtenirEtatHistoirePersiste();
}

/** @returns {typeof import('./histoire-textes.js')} */
function _textes() {
    return obtenirHistoireTextesSync();
}

function _importerUi() {
    return import('./histoire-manager-ui.js');
}

export function obtenirCutsceneEntree(mondeId, premiereVisite) {
    if (mondeId === 'monde_finale') {
        const etatHist = _obtenirEtatHistoireLocal();
        const cleEntree = etatHist.mondesCompletes.includes('monde_miroir')
            ? 'monde_finale_miroir'
            : 'monde_finale';
        const lignesFinale = _textes().CUTSCENES_ENTREE[cleEntree];
        if (!lignesFinale?.length) return null;
        return {
            lignes: _formaterLignes(lignesFinale),
            personnages: _extrairePersonnages(lignesFinale),
        };
    }
    if (!premiereVisite) return null;
    const lignesRaw = _textes().CUTSCENES_ENTREE[mondeId];
    if (!lignesRaw?.length) return null;
    return {
        lignes: _formaterLignes(lignesRaw),
        personnages: _extrairePersonnages(lignesRaw),
    };
}

export function afficherVictoireBoss(bossId, typeFin = 'normal', onFin) {
    let cle = bossId;
    if (bossId === 'distorsion') {
        cle = `distorsion_${typeFin}`;
    }
    const { CUTSCENES_VICTOIRE_BOSS } = _textes();
    const lignesRaw = CUTSCENES_VICTOIRE_BOSS[cle] ?? CUTSCENES_VICTOIRE_BOSS[bossId] ?? [];
    if (!lignesRaw.length) {
        onFin?.();
        return;
    }
    void _importerUi()
        .then(({ afficherCutsceneHistoire }) => {
            afficherCutsceneHistoire(
                _formaterLignes(lignesRaw),
                _extrairePersonnages(lignesRaw),
                onFin
            );
        })
        .catch(() => onFin?.());
}

export function afficherTransitionChapitre(cleChapitre, onFin) {
    const lignesRaw = _textes().TRANSITIONS_CHAPITRE[cleChapitre] ?? [];
    if (!lignesRaw.length) {
        onFin?.();
        return;
    }
    void _importerUi().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(
            _formaterLignes(lignesRaw),
            _extrairePersonnages(lignesRaw),
            onFin
        );
    });
}

export function afficherJournalVera(journalData, onFermer) {
    if (!journalData) {
        onFermer?.();
        return;
    }
    const dialogues = _textes().JOURNAUX_VERA_DIALOGUES?.[journalData.id];
    const journalEnrichi = {
        ...journalData,
        texte: dialogues ?? journalData.texte,
        _illustrerFn: ILLUSTRATIONS_JOURNAUX[journalData.id] ?? null,
    };
    void _importerUi().then(({ afficherJournalHistoire }) => {
        afficherJournalHistoire(journalEnrichi, onFermer);
    });
}

export function declencherFin(finId) {
    if (!modeHistoireEnCours()) return;

    const file = creerFile(`fin:${finId}`);

    file.ajouter({
        id: 'epilogue',
        condition: () => (_textes().EPILOGUES[finId] ?? []).length > 0,
        executer: (suivant) => {
            const epilogue = _textes().EPILOGUES[finId];
            void _importerUi()
                .then(({ afficherCutsceneHistoire }) => {
                    afficherCutsceneHistoire(
                        _formaterLignes(epilogue),
                        _extrairePersonnages(epilogue),
                        suivant
                    );
                })
                .catch((err) => {
                    logger.warn('[histoire] épilogue indisponible :', err);
                    suivant();
                });
        },
    });

    file.ajouter({
        id: 'outro',
        condition: () => (_textes().OUTRO_FINS?.[finId] ?? []).length > 0,
        executer: (suivant) => {
            const outro = _textes().OUTRO_FINS[finId];
            void _importerUi()
                .then(({ afficherCutsceneHistoire }) => {
                    afficherCutsceneHistoire(
                        _formaterLignes(outro),
                        _extrairePersonnages(outro),
                        () => {
                            const etatHist = _obtenirEtatHistoireLocal();
                            etatHist.outroVue = true;
                            persisterEtatHistoire(etatHist);
                            suivant();
                        }
                    );
                })
                .catch(() => suivant());
        },
    });

    file.ajouter({
        id: 'executerFin',
        executer: (suivant) => {
            void import('./fins-histoire.js').then(({ executerFin }) => {
                executerFin(finId);
                suivant();
            });
        },
    });

    file.demarrer();
}

export function afficherDecouverteLabo(onFin) {
    void _importerUi().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(
            _formaterLignes(_textes().DECOUVERTE_LABO),
            _extrairePersonnages(_textes().DECOUVERTE_LABO),
            onFin
        );
    });
}

export function obtenirTransitionApresVictoire(mondeId) {
    switch (mondeId) {
        case 'monde_prologue':
            return 'vers_chapitre_1';
        case 'monde_boss_1':
            return 'vers_chapitre_2';
        case 'monde_boss_2':
            return 'vers_chapitre_3';
        case 'monde_boss_3':
            return 'vers_chapitre_4';
        case 'monde_boss_4':
            return 'vers_finale';
        default:
            return null;
    }
}

export function obtenirTypeFin() {
    const etatHist = _obtenirEtatHistoireLocal();

    // Aligne avec FINS.fin_secrete (condition mondeCache: 'trame') :
    // la fin secrete exige d'avoir reellement complete LA TRAME PRIMORDIALE.
    if (
        etatHist.mondesCompletes.includes('monde_trame') &&
        etatHist.conditionsTrame.miroirComplete &&
        etatHist.conditionsTrame.tousJournauxTrouves &&
        etatHist.conditionsTrame.tousBossSansContinue &&
        etatHist.conditionsTrame.actionDistorsionFaite
    ) {
        return 'fin_secrete';
    }

    if (etatHist.mondesCompletes.includes('monde_miroir')) {
        return 'fin_vraie';
    }

    return 'fin_normale';
}

export function typeFinVersCleBoss(finId) {
    switch (finId) {
        case 'fin_vraie':
            return 'vrai';
        case 'fin_secrete':
            return 'secret';
        default:
            return 'normal';
    }
}

function _formaterLignes(lignesRaw) {
    return lignesRaw.map((l) => l.texte ?? l);
}

function _extrairePersonnages(lignesRaw) {
    return lignesRaw.map((l) => l.personnage ?? 'narrateur');
}

/**
 * Retourne la cutscene post-monde pour un monde donne (ou null).
 * Utilise apres un monde normal complete (pas boss).
 * @param {string} mondeId
 * @param {boolean} premiereCompletion
 * @returns {{ lignes: string[], personnages: string[] } | null}
 */
export function obtenirCutscenePostMonde(mondeId, premiereCompletion) {
    if (!premiereCompletion) return null;
    const lignesRaw = _textes().CUTSCENES_POST_MONDE[mondeId];
    if (!lignesRaw?.length) return null;
    return {
        lignes: _formaterLignes(lignesRaw),
        personnages: _extrairePersonnages(lignesRaw),
    };
}
