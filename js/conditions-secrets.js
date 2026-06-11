import { store } from './store-core.js';
import { etat } from './store-jeu.js';
import { CONFIG } from './config.js';
import { ETAT_HISTOIRE_VIDE } from './histoire-donnees.js';
import { sansAccentsE } from './texte-jeu.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from './histoire-etat.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { logger } from './logger.js';

const SEUIL_PLATEAU_TRAME = 0.5;
export const DUREE_ATTENTE_TRAME_MS = 30000;
const NB_TOPS_REQUIS_C3 = 3;

export const conditionsRuntime = {
    timerAttenteTrameMs: 0,
    trameAttenteActive: false,
    notificationsMontrées: new Set(),
};

function _obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

function _sauvegarderEtat(etatHist) {
    persisterEtatHistoire(etatHist);
}

/** @param {string} mondeId @param {typeof import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist */
function _ajouterMondeCacheDebloque(mondeId, etatHist) {
    if (!Array.isArray(etatHist.mondesCachesDebloques)) {
        etatHist.mondesCachesDebloques = [];
    }
    if (etatHist.mondesCachesDebloques.includes(mondeId)) return;
    etatHist.mondesCachesDebloques.push(mondeId);
    _sauvegarderEtat(etatHist);
}

export function verifierConditionMiroir(nbLignes, etatHist) {
    if (!modeHistoireEnCours()) return;
    if (store.histoire.mondeActuel !== 'monde_cyber') return;
    if (etatHist.mondesCompletes.includes('monde_miroir')) return;

    if (nbLignes === 4) {
        store.histoire.mecaniques.cyberTetrisConsecutifs =
            (store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0) + 1;
        logger.info(
            '[secrets] tetris CYBER cumules :',
            store.histoire.mecaniques.cyberTetrisConsecutifs
        );
    }

    if (
        store.histoire.mecaniques.cyberTetrisConsecutifs >= 3 &&
        etatHist.conditionsMiroir.bossArchivisteVaincu
    ) {
        _debloquerMiroir(etatHist);
    }
}

function _debloquerMiroir(etatHist) {
    if (conditionsRuntime.notificationsMontrées.has('miroir')) return;

    etatHist.conditionsMiroir.tetrisTriplesCyber = Math.max(
        etatHist.conditionsMiroir.tetrisTriplesCyber ?? 0,
        store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0
    );
    _ajouterMondeCacheDebloque('monde_miroir', etatHist);
    conditionsRuntime.notificationsMontrées.add('miroir');

    logger.info('[secrets] LE MIROIR debloque');
    _afficherNotifDeblocageMonde('monde_miroir');
}

/**
 * Cas differe : les 3 Tetris CYBER ont ete realises AVANT la victoire sur
 * l'Archiviste. Verifie les conditions persistees et debloque avec notification.
 * @param {typeof import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist
 */
export function verifierDeblocageMiroirDiffere(etatHist) {
    if (etatHist.mondesCachesDebloques?.includes('monde_miroir')) return;
    if (!etatHist.conditionsMiroir.bossArchivisteVaincu) return;
    if ((etatHist.conditionsMiroir.tetrisTriplesCyber ?? 0) < 3) return;
    _debloquerMiroir(etatHist);
}

export function tickConditionTrame(dt) {
    if (!modeHistoireEnCours()) return;
    if (store.histoire.mondeActuel !== 'monde_finale') return;
    if (!store.histoire.boss.actif || store.histoire.boss.actif.id !== 'distorsion') return;

    const etatHist = _obtenirEtatHistoire();
    const ct = etatHist?.conditionsTrame;
    if (!ct) return;
    if (ct.actionDistorsionFaite) return;
    if (ct.tousBossSansContinue === false) return;
    if (!ct.miroirComplete) return;

    const total = CONFIG.lignes * CONFIG.colonnes;
    let occupees = 0;
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] !== 0) occupees++;
        }
    }
    const tauxRemplissage = occupees / total;

    if (tauxRemplissage >= SEUIL_PLATEAU_TRAME) {
        if (!conditionsRuntime.trameAttenteActive) {
            conditionsRuntime.trameAttenteActive = true;
            conditionsRuntime.timerAttenteTrameMs = 0;
            logger.info(
                '[secrets] Trame : attente demarree (plateau',
                Math.round(tauxRemplissage * 100) + '%)'
            );
        }
        conditionsRuntime.timerAttenteTrameMs += dt;

        if (conditionsRuntime.timerAttenteTrameMs >= DUREE_ATTENTE_TRAME_MS) {
            _validerActionDistorsion(etatHist);
        }
    } else if (conditionsRuntime.trameAttenteActive) {
        conditionsRuntime.trameAttenteActive = false;
        conditionsRuntime.timerAttenteTrameMs = 0;
        logger.info('[secrets] Trame : attente annulee (joueur a efface)');
    }
}

function _validerActionDistorsion(etatHist) {
    if (!etatHist.conditionsTrame) return;
    if (etatHist.conditionsTrame.actionDistorsionFaite) return;
    etatHist.conditionsTrame.actionDistorsionFaite = true;
    conditionsRuntime.trameAttenteActive = false;
    conditionsRuntime.timerAttenteTrameMs = 0;
    _sauvegarderEtat(etatHist);
    logger.info('[secrets] Condition Trame validee — action distorsion');
    verifierDeblocageTrame(etatHist);
}

export function onMiroirComplete(etatHist) {
    etatHist.conditionsTrame.miroirComplete = true;
    _sauvegarderEtat(etatHist);
    logger.info('[secrets] Trame : miroirComplete = true');
    verifierDeblocageTrame(etatHist);
}

export function verifierDeblocageTrame(etatHist) {
    if (etatHist.mondesCompletes.includes('monde_trame')) return;
    if (conditionsRuntime.notificationsMontrées.has('trame')) return;

    const ok =
        etatHist.conditionsTrame.miroirComplete &&
        etatHist.conditionsTrame.tousJournauxTrouves &&
        etatHist.conditionsTrame.tousBossSansContinue &&
        etatHist.conditionsTrame.actionDistorsionFaite;

    if (ok) {
        _ajouterMondeCacheDebloque('monde_trame', etatHist);
        conditionsRuntime.notificationsMontrées.add('trame');
        logger.info('[secrets] LA TRAME PRIMORDIALE debloquee');
        _afficherNotifDeblocageMonde('monde_trame');
    }
}

export function verifierConditionC3(topsCompteur, etatHist) {
    if (!etatHist.conditionsParadoxe.finSecreteObtenue) return;
    if (conditionsRuntime.notificationsMontrées.has('c3')) return;
    if (topsCompteur < NB_TOPS_REQUIS_C3) return;

    _ajouterMondeCacheDebloque('monde_paradoxe', etatHist);
    conditionsRuntime.notificationsMontrées.add('c3');
    logger.info('[secrets] monde_c3 conditions reunies');
}

function _afficherNotifDeblocageMonde(mondeId) {
    if (typeof document === 'undefined') return;

    const MESSAGES = {
        monde_miroir: "✦ UN NOUVEAU CHEMIN S'EST OUVERT",
        monde_trame: '✦ LA TRAME PRIMORDIALE REVELEE',
        monde_paradoxe: '✦ AU-DELÀ DE TOUTE LOGIQUE',
    };
    const msg = MESSAGES[mondeId];
    if (!msg) return;

    const notif = document.createElement('div');
    notif.className = 'notif-deblocage-monde';
    notif.textContent = sansAccentsE(msg);
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4200);
}

export function obtenirProgressionAttenteTrameMs() {
    if (!conditionsRuntime.trameAttenteActive) return 0;
    return Math.min(1, conditionsRuntime.timerAttenteTrameMs / DUREE_ATTENTE_TRAME_MS);
}

export function obtenirSecondesRestantesAttenteTrame() {
    if (!conditionsRuntime.trameAttenteActive) return -1;
    const restantes = DUREE_ATTENTE_TRAME_MS - conditionsRuntime.timerAttenteTrameMs;
    return Math.max(0, Math.ceil(restantes / 1000));
}

/**
 * Resume des 4 conditions pour debloquer la Trame Primordiale.
 * @param {typeof import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE} etatHist
 */
/** @param {string} mondeId @returns {string | null} */
export function obtenirGuideMondeSecret(mondeId) {
    const guides = {
        monde_miroir:
            'Apres le boss Archiviste : enchaîner 3 Tetris d’affilee dans le biome Cyber.',
        monde_trame:
            'Completez le Miroir, trouvez les 9 transmissions, battez tous les boss sans continue, puis l’action secrete dans Distorsion.',
        monde_paradoxe:
            'Obtenez la fin secrete de la campagne et realisez 3 tops volontaires au Prologue.',
    };
    return guides[mondeId] ?? null;
}

export function obtenirResumeConditionsTrame(etatHist) {
    const ct = etatHist?.conditionsTrame ?? ETAT_HISTOIRE_VIDE.conditionsTrame;
    const details = [
        { cle: 'miroirComplete', libelle: 'Monde Miroir complete', ok: !!ct.miroirComplete },
        {
            cle: 'tousJournauxTrouves',
            libelle: '9 transmissions trouvees',
            ok: !!ct.tousJournauxTrouves,
        },
        {
            cle: 'tousBossSansContinue',
            libelle: 'Tous les boss sans continue',
            ok: !!ct.tousBossSansContinue,
        },
        {
            cle: 'actionDistorsionFaite',
            libelle: 'Action secrete Distorsion',
            ok: !!ct.actionDistorsionFaite,
        },
    ];
    const validees = details.filter((d) => d.ok).length;
    return { validees, total: 4, details };
}

export function reinitialiserConditionsRuntime() {
    conditionsRuntime.timerAttenteTrameMs = 0;
    conditionsRuntime.trameAttenteActive = false;
}
