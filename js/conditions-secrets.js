import { store } from './store-core.js';
import { etat } from './store-jeu.js';
import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './progression.js';

const SEUIL_PLATEAU_TRAME = 0.5;
export const DUREE_ATTENTE_TRAME_MS = 30000;
const NB_TOPS_REQUIS_C3 = 3;

export const conditionsRuntime = {
    timerAttenteTrameMs: 0,
    trameAttenteActive: false,
    notificationsMontrées: new Set(),
};

function _obtenirEtatHistoire() {
    if (!store.etatHistoire) {
        store.etatHistoire = chargerEtatHistoire();
    }
    return store.etatHistoire;
}

function _sauvegarderEtat(etatHist) {
    sauvegarderEtatHistoire(etatHist);
    store.etatHistoire = etatHist;
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
    if (!store.modeHistoireActif) return;
    if (store.mondeHistoireActuel !== 'monde_cyber') return;
    if (etatHist.mondesCompletes.includes('monde_miroir')) return;

    if (nbLignes === 4) {
        store.cyberTetrisConsecutifs = (store.cyberTetrisConsecutifs ?? 0) + 1;
        logger.info('[secrets] tetris CYBER consécutifs :', store.cyberTetrisConsecutifs);
    } else if (nbLignes > 0) {
        store.cyberTetrisConsecutifs = 0;
    }

    if (store.cyberTetrisConsecutifs >= 3 && etatHist.conditionsMiroir.bossArchivisteVaincu) {
        _debloquerMiroir(etatHist);
    }
}

function _debloquerMiroir(etatHist) {
    if (conditionsRuntime.notificationsMontrées.has('miroir')) return;

    etatHist.conditionsMiroir.tetrisTriplesCyber = store.cyberTetrisConsecutifs;
    _ajouterMondeCacheDebloque('monde_miroir', etatHist);
    conditionsRuntime.notificationsMontrées.add('miroir');

    logger.info('[secrets] LE MIROIR débloqué');
    _afficherNotifDeblocageMonde('monde_miroir');
}

export function tickConditionTrame(dt) {
    if (!store.modeHistoireActif) return;
    if (store.mondeHistoireActuel !== 'monde_finale') return;
    if (!store.bossActif || store.bossActif.id !== 'distorsion') return;

    const etatHist = _obtenirEtatHistoire();
    if (etatHist.conditionsTrame.actionDistorsionFaite) return;
    if (etatHist.conditionsTrame.tousBossSansContinue === false) return;
    if (!etatHist.conditionsTrame.miroirComplete) return;

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
                '[secrets] Trame : attente démarrée (plateau',
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
        logger.info('[secrets] Trame : attente annulée (joueur a effacé)');
    }
}

function _validerActionDistorsion(etatHist) {
    if (etatHist.conditionsTrame.actionDistorsionFaite) return;
    etatHist.conditionsTrame.actionDistorsionFaite = true;
    conditionsRuntime.trameAttenteActive = false;
    conditionsRuntime.timerAttenteTrameMs = 0;
    _sauvegarderEtat(etatHist);
    logger.info('[secrets] Condition Trame validée — action distorsion');
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
        logger.info('[secrets] LA TRAME PRIMORDIALE débloquée');
        _afficherNotifDeblocageMonde('monde_trame');
    }
}

export function verifierConditionC3(topsCompteur, etatHist) {
    if (!etatHist.conditionsParadoxe.finSecreteObtenue) return;
    if (conditionsRuntime.notificationsMontrées.has('c3')) return;
    if (topsCompteur < NB_TOPS_REQUIS_C3) return;

    _ajouterMondeCacheDebloque('monde_paradoxe', etatHist);
    conditionsRuntime.notificationsMontrées.add('c3');
    logger.info('[secrets] monde_c3 conditions réunies');
}

function _afficherNotifDeblocageMonde(mondeId) {
    if (typeof document === 'undefined') return;

    const MESSAGES = {
        monde_miroir: "✦ UN NOUVEAU CHEMIN S'EST OUVERT",
        monde_trame: '✦ LA TRAME PRIMORDIALE RÉVÉLÉE',
    };
    const msg = MESSAGES[mondeId];
    if (!msg) return;

    const notif = document.createElement('div');
    notif.className = 'notif-deblocage-monde';
    notif.textContent = msg;
    notif.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        z-index: 400;
        font-family: var(--police);
        font-size: clamp(0.4rem, 1.5vw, 0.55rem);
        letter-spacing: 3px;
        color: #ffe600;
        background: rgba(8,8,26,0.96);
        border: 2px solid #ffe600;
        padding: 14px 28px;
        text-align: center;
        box-shadow: 0 0 30px rgba(255,230,0,0.4);
        text-shadow: 0 0 10px #ffe600;
        pointer-events: none;
        animation: apparitionSecret 4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    `;
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

export function reinitialiserConditionsRuntime() {
    conditionsRuntime.timerAttenteTrameMs = 0;
    conditionsRuntime.trameAttenteActive = false;
}
