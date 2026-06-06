import {
    CUTSCENES_ENTREE,
    CUTSCENES_VICTOIRE_BOSS,
    TRANSITIONS_CHAPITRE,
    EPILOGUES,
    DECOUVERTE_LABO,
} from './histoire-textes.js';
import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { ILLUSTRATIONS_JOURNAUX } from './histoire-illustrations.js';
import { store } from './store-core.js';
import { chargerEtatHistoire } from './progression.js';
import { executerFin } from './fins-histoire.js';

function _obtenirEtatHistoireLocal() {
    if (!store.etatHistoire) {
        store.etatHistoire = chargerEtatHistoire();
    }
    return store.etatHistoire;
}

function _importerManager() {
    return import('./histoire-manager.js');
}

export function obtenirCutsceneEntree(mondeId, premiereVisite) {
    if (!premiereVisite) return null;
    const lignesRaw = CUTSCENES_ENTREE[mondeId];
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
    const lignesRaw = CUTSCENES_VICTOIRE_BOSS[cle] ?? CUTSCENES_VICTOIRE_BOSS[bossId] ?? [];
    if (!lignesRaw.length) {
        onFin?.();
        return;
    }
    void _importerManager().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(
            _formaterLignes(lignesRaw),
            _extrairePersonnages(lignesRaw),
            onFin
        );
    });
}

export function afficherTransitionChapitre(cleChapitre, onFin) {
    const lignesRaw = TRANSITIONS_CHAPITRE[cleChapitre] ?? [];
    if (!lignesRaw.length) {
        onFin?.();
        return;
    }
    void _importerManager().then(({ afficherCutsceneHistoire }) => {
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
    void _importerManager().then(({ afficherJournalHistoire }) => {
        afficherJournalHistoire(journalEnrichi, onFermer);
    });
}

export function declencherFin(finId) {
    const epilogue = EPILOGUES[finId] ?? [];
    if (!epilogue.length) {
        executerFin(finId);
        return;
    }
    void _importerManager().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(_formaterLignes(epilogue), _extrairePersonnages(epilogue), () =>
            executerFin(finId)
        );
    });
}

export function afficherDecouverteLabo(onFin) {
    void _importerManager().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(
            _formaterLignes(DECOUVERTE_LABO),
            _extrairePersonnages(DECOUVERTE_LABO),
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
