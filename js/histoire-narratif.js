import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { ILLUSTRATIONS_JOURNAUX } from './histoire-illustrations.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';

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
    void _importerUi().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(
            _formaterLignes(lignesRaw),
            _extrairePersonnages(lignesRaw),
            onFin
        );
    });
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
    const journalEnrichi = {
        ...journalData,
        _illustrerFn: ILLUSTRATIONS_JOURNAUX[journalData.id] ?? null,
    };
    void _importerUi().then(({ afficherJournalHistoire }) => {
        afficherJournalHistoire(journalEnrichi, onFermer);
    });
}

export function declencherFin(finId) {
    const epilogue = _textes().EPILOGUES[finId] ?? [];
    if (!epilogue.length) {
        void import('./fins-histoire.js').then(({ executerFin }) => executerFin(finId));
        return;
    }
    void _importerUi().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(_formaterLignes(epilogue), _extrairePersonnages(epilogue), () =>
            import('./fins-histoire.js').then(({ executerFin }) => executerFin(finId))
        );
    });
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

    if (
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
 * Retourne la cutscene post-monde pour un monde donné (ou null).
 * Utilisé après un monde normal complété (pas boss).
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
