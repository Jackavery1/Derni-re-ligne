import { obtenirHistoireTextesSync } from '../io/charger-histoire-textes.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from './histoire-etat.js';
import { creerFile } from './file-narrative.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { extraireLignesCutscene } from './histoire-cutscene-moteur.js';
import { logger } from '../io/logger.js';
import {
    SCENE_DEFAUT_POST_MONDE,
    SCENE_DEFAUT_TRANSITION_CHAPITRE,
} from './histoire-narratif-scenes.js';

export {
    SCENE_DEFAUT_POST_MONDE,
    SCENE_DEFAUT_TRANSITION_CHAPITRE,
} from './histoire-narratif-scenes.js';

function _obtenirEtatHistoireLocal() {
    return obtenirEtatHistoirePersiste();
}

/** @returns {typeof import('../histoire-textes.js')} */
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
        const entreeFinale = _textes().CUTSCENES_ENTREE[cleEntree];
        const lignesFinale = extraireLignesCutscene(entreeFinale);
        if (!lignesFinale.length) return null;
        return Array.isArray(entreeFinale) ? { lignes: entreeFinale } : entreeFinale;
    }
    if (!premiereVisite) return null;
    const entree = _textes().CUTSCENES_ENTREE[mondeId];
    const lignes = extraireLignesCutscene(entree);
    if (!lignes.length) return null;
    return Array.isArray(entree) ? { lignes: entree } : entree;
}

export const SCENE_DEFAUT_VICTOIRE_BOSS = {
    brasier: 'seuil_brasier',
    sentinelle: 'seuil_sentinelle',
    archiviste: 'labo',
    avantgarde: 'seuil_avantgarde',
    distorsion: 'antre_distorsion',
};

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
    const sceneDefaut = SCENE_DEFAUT_VICTOIRE_BOSS[bossId] ?? null;
    const entree =
        sceneDefaut && Array.isArray(lignesRaw)
            ? { scene: lignesRaw[0]?.scene ?? sceneDefaut, lignes: lignesRaw }
            : lignesRaw;
    void _importerUi()
        .then(({ afficherCutsceneHistoire }) => {
            afficherCutsceneHistoire(entree, null, onFin);
        })
        .catch(() => onFin?.());
}

export function afficherTransitionChapitre(cleChapitre, onFin) {
    const lignesRaw = _textes().TRANSITIONS_CHAPITRE[cleChapitre] ?? [];
    if (!lignesRaw.length) {
        onFin?.();
        return;
    }
    const sceneDefaut = SCENE_DEFAUT_TRANSITION_CHAPITRE[cleChapitre] ?? null;
    const entree = sceneDefaut ? { scene: sceneDefaut, lignes: lignesRaw } : lignesRaw;
    void _importerUi().then(({ afficherCutsceneHistoire }) => {
        afficherCutsceneHistoire(entree, null, onFin);
    });
}

export function afficherJournalVera(journalData, onFermer) {
    if (!journalData) {
        onFermer?.();
        return;
    }
    void (async () => {
        const { ILLUSTRATIONS_JOURNAUX } = await import('./histoire-illustrations.js');
        const dialogues = _textes().JOURNAUX_VERA_DIALOGUES?.[journalData.id];
        const journalEnrichi = {
            ...journalData,
            texte: dialogues ?? journalData.texte,
            _illustrerFn: ILLUSTRATIONS_JOURNAUX[journalData.id] ?? null,
        };
        const { afficherJournalHistoire } = await _importerUi();
        afficherJournalHistoire(journalEnrichi, onFermer);
    })();
}

export function declencherFin(finId) {
    if (!modeHistoireEnCours()) return;

    const file = creerFile(`fin:${finId}`);

    file.ajouter({
        id: 'epilogue',
        condition: () => extraireLignesCutscene(_textes().EPILOGUES[finId]).length > 0,
        executer: (suivant) => {
            const epilogue = _textes().EPILOGUES[finId];
            void _importerUi()
                .then(({ afficherCutsceneHistoire }) => {
                    afficherCutsceneHistoire(epilogue, null, suivant);
                })
                .catch((err) => {
                    logger.warn('[histoire] épilogue indisponible :', err);
                    suivant();
                });
        },
    });

    file.ajouter({
        id: 'outro',
        condition: () => extraireLignesCutscene(_textes().OUTRO_FINS?.[finId]).length > 0,
        executer: (suivant) => {
            const outro = _textes().OUTRO_FINS[finId];
            void _importerUi()
                .then(({ afficherCutsceneHistoire }) => {
                    afficherCutsceneHistoire(outro, null, () => {
                        const etatHist = _obtenirEtatHistoireLocal();
                        etatHist.outroVue = true;
                        persisterEtatHistoire(etatHist);
                        suivant();
                    });
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
        afficherCutsceneHistoire(_textes().DECOUVERTE_LABO, null, onFin);
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

/**
 * Retourne la cutscene post-monde pour un monde donne (ou null).
 * @param {string} mondeId
 * @param {boolean} premiereCompletion
 * @returns {{ scene?: string, lignes: Array<{ personnage?: string, texte: string, scene?: string, humeur?: string }> } | null}
 */
export function obtenirCutscenePostMonde(mondeId, premiereCompletion) {
    if (!premiereCompletion) return null;
    const entree = _textes().CUTSCENES_POST_MONDE[mondeId];
    const lignes = extraireLignesCutscene(entree);
    if (!lignes.length) return null;
    if (Array.isArray(entree)) {
        const scene = lignes[0]?.scene ?? SCENE_DEFAUT_POST_MONDE[mondeId] ?? null;
        return scene ? { scene, lignes: entree } : { lignes: entree };
    }
    if (entree?.scene) return entree;
    const scene = SCENE_DEFAUT_POST_MONDE[mondeId];
    return scene ? { scene, lignes } : { lignes };
}
