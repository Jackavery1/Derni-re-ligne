import { CONFIG } from './config.js';
import { store } from './store-core.js';
import { etat } from './store-jeu.js';
import { BOSS } from './histoire-donnees.js';
import { logger } from './logger.js';
import { AudioMoteur } from './audio.js';
import { creerParticulesExplosion } from './particules-jeu.js';
import {
    tickConditionTrame,
    reinitialiserConditionsRuntime,
    obtenirSecondesRestantesAttenteTrame,
    conditionsRuntime,
} from './conditions-secrets.js';
import { obtenirEtatHistoire } from './histoire-mondes.js';
import { enregistrerVictoireBossTimer } from './achievements-histoire.js';
import {
    notifierPhaseBoss,
    notifierPhaseBossParPv,
    victoireObjectifDeclenchee,
} from './gestionnaire-difficulte.js';
import {
    reagirRoboBossAttaque,
    reagirRoboBossDegats,
    reagirRoboBossVaincu,
} from './mascotte-robo.js';
import {
    COULEUR_BRAISE,
    COULEUR_GLACE_B,
    degelColonnes,
    executerAttaqueBoss,
} from './boss-attaques.js';

export { COULEUR_BRAISE, COULEUR_GLACE_B };
export const DUREE_VICTOIRE_BOSS_MS = 2200;

const TEXTES_MI_COMBAT = {
    brasier: {
        50: '🔥 IMPOSSIBLE. TU RÉSISTES ENCORE.',
        25: '🔥 TOUT BRÛLE... MÊME LA DOUTE...',
    },
    sentinelle: {
        50: '❄ CALCUL EN COURS. ADAPTATION NÉCESSAIRE.',
        25: "❄ PROTOCOLE D'URGENCE... ACTIVÉ.",
    },
    archiviste: {
        50: '⚠ MÉMOIRE_CORROMPUE : [37%] — REDÉMARRAGE PARTIEL',
        25: '⚠ INTÉGRITÉ_SYSTÈME : CRITIQUE — 12% RESTANT',
    },
    avantgarde: {
        50: '✦ TU AS SURVÉCU À TOUS LES AUTRES. BIEN.',
        25: '✦ ELLE TE TESTAIT. JE TE TESTAIS. NOUS AVONS NOTRE RÉPONSE.',
    },
    distorsion: {
        66: '∞ TU NE COMPRENDS PAS ENCORE.',
        33: '∞ PEUT-ÊTRE QUE SI.',
    },
};

/** @returns {import('./boss-attaques.js').ContexteAttaqueBoss} */
function _ctxAttaque() {
    return {
        plateau: etat.plateau,
        effets: store.histoire.boss.effets,
        bossActif: store.histoire.boss.actif,
    };
}

/** @param {{ id?: string, attaqueIntervalleMs?: number }} boss */
function _obtenirIntervalleAttaque(boss) {
    const base = boss.attaqueIntervalleMs ?? 15000;
    if (boss.id === 'distorsion' && store.histoire.boss.pv <= 12) {
        return 9000;
    }
    return base;
}

/** @param {string} bossId */
export function demarrerBoss(bossId) {
    const boss = BOSS[bossId];
    if (!boss) {
        logger.warn('[boss] bossId inconnu :', bossId);
        return;
    }
    store.histoire.boss.actif = boss;
    store.histoire.boss.pv = boss.pvMax;
    store.histoire.boss.phase = 0;
    store.histoire.boss.timerAttaque = _obtenirIntervalleAttaque(boss);
    store.histoire.boss.timerAttaqueActive = 0;
    store.histoire.boss.vaincu = false;
    store.histoire.boss.timerVaincu = 0;
    store.histoire.boss.timerDebut = performance.now();
    store.histoire.boss.timerPortrait = 0;
    store.histoire.boss._textesMiAffiches = new Set();
    store.histoire.boss._flashAttaque = false;
    _reinitialiserMecaniques();

    _afficherSectionBoss(true);
    _mettreAJourHPBar();
    _afficherTexteBoss(boss.texteApparition ?? '');
    logger.info('[boss] demarre :', bossId, 'PV:', boss.pvMax);
    reinitialiserConditionsRuntime();
}

export function arreterBoss() {
    if (!store.histoire.boss.actif) return;
    _reinitialiserMecaniques();
    store.histoire.boss._textesMiAffiches = null;
    store.histoire.boss._flashAttaque = false;
    store.histoire.boss.actif = null;
    store.histoire.boss.pv = 0;
    store.histoire.boss.phase = 0;
    store.histoire.boss.timerAttaque = 0;
    store.histoire.boss.timerAttaqueActive = 0;
    store.histoire.boss.vaincu = false;
    store.histoire.boss.timerVaincu = 0;
    store.histoire.boss.timerPortrait = 0;
    _afficherSectionBoss(false);
}

function _reinitialiserMecaniques() {
    const m = store.histoire.boss.effets;
    m.colonnesGelees = [];
    m.timerDegelMs = 0;
    m.bossControlesInverses = false;
    m.timerControlesInverses = 0;
    m.bossFauxFantome = false;
    m.timerFauxFantome = 0;
    m.decalageDistorsion = 0;
    m.timerDistorsion = 0;
}

/** @param {number} dt */
export function mettreAJourBoss(dt) {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu || etat.estEnPause) return;

    const boss = store.histoire.boss.actif;
    const m = store.histoire.boss.effets;

    if (m.timerControlesInverses > 0) {
        m.timerControlesInverses -= dt;
        if (m.timerControlesInverses <= 0) {
            m.bossControlesInverses = false;
            m.timerControlesInverses = 0;
            _afficherTexteBoss('');
        }
    }
    if (m.timerFauxFantome > 0) {
        m.timerFauxFantome -= dt;
        if (m.timerFauxFantome <= 0) {
            m.bossFauxFantome = false;
            m.timerFauxFantome = 0;
            _afficherTexteBoss('');
        }
    }
    if (m.timerDegelMs > 0) {
        m.timerDegelMs -= dt;
        if (m.timerDegelMs <= 0) _degelColonnes();
    }
    if (m.timerDistorsion > 0) {
        m.timerDistorsion -= dt;
        if (m.timerDistorsion <= 0) {
            m.decalageDistorsion = 0;
            m.timerDistorsion = 0;
            _afficherTexteBoss('');
        }
    }

    store.histoire.boss.timerAttaque -= dt;
    if (store.histoire.boss.timerAttaque <= 0) {
        _exectuterAttaque();
        store.histoire.boss.timerAttaque = _obtenirIntervalleAttaque(boss);
    }

    _verifierPhase();
    store.histoire.boss.timerPortrait += dt;

    if (store.histoire.boss.vaincu) {
        store.histoire.boss.timerVaincu -= dt;
    }

    _mettreAJourTimerUI();

    if (store.histoire.boss.actif.id === 'distorsion') {
        tickConditionTrame(dt);
    }
}

/** @param {number} nbLignes */
export function endommagerBoss(nbLignes) {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    store.histoire.boss.pv = Math.max(0, store.histoire.boss.pv - nbLignes);
    _mettreAJourHPBar();
    reagirRoboBossDegats();

    if (store.histoire.boss.pv <= 0) {
        _declencherVictoireBoss();
    }
}

function _declencherVictoireBoss() {
    if (store.histoire.boss.vaincu) return;
    store.histoire.boss.vaincu = true;
    store.histoire.boss.timerVaincu = DUREE_VICTOIRE_BOSS_MS;
    if (store.histoire.boss.timerDebut) {
        enregistrerVictoireBossTimer(store.histoire.boss.timerDebut);
    }

    const boss = store.histoire.boss.actif;
    const texte = boss?.texteDefaite ?? boss?.texteDefaite_normal ?? 'Defaite...';
    _afficherTexteBoss(texte);
    reagirRoboBossVaincu();

    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * CONFIG.colonnes);
        const y = Math.floor(Math.random() * 6);
        creerParticulesExplosion(x, y, boss?.couleur ?? '#ffe600');
    }
    if (!AudioMoteur.muet) AudioMoteur.son('tetris');

    setTimeout(() => {
        if (victoireObjectifDeclenchee()) return;
        import('./actions-jeu.js').then(({ obtenirActions }) => {
            obtenirActions().terminerPartie?.(true);
        });
    }, DUREE_VICTOIRE_BOSS_MS);
}

function _exectuterAttaque() {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    store.histoire.boss._flashAttaque = true;
    reagirRoboBossAttaque();
    setTimeout(() => {
        if (store.histoire.boss.actif) store.histoire.boss._flashAttaque = false;
    }, 280);

    const boss = store.histoire.boss.actif;
    const attaque = executerAttaqueBoss(boss, store.histoire.boss.phase, _ctxAttaque());
    if (attaque) _afficherEffetAttaque(attaque.type, attaque.dureeMs, attaque.resultat);
}

/**
 * @param {string} type
 * @param {number} dureeMs
 * @param {unknown} resultat
 */
function _afficherEffetAttaque(type, dureeMs, resultat) {
    switch (type) {
        case 'rangee_braise':
            if (resultat === false) {
                _afficherTexteBoss('🔥 BRAISE CONTENUE');
            } else {
                _afficherTexteBoss('🔥 RANGÉE DE BRAISE');
                if (!AudioMoteur.muet) AudioMoteur.son('verrou');
            }
            break;
        case 'colonne_gelee': {
            const colonnes = /** @type {number[] | undefined} */ (resultat);
            if (colonnes?.length) {
                _afficherTexteBoss(`❄ COLONNES ${colonnes.map((c) => c + 1).join(', ')} GELÉES`);
                if (!AudioMoteur.muet) AudioMoteur.son('hold');
            }
            break;
        }
        case 'inverser_controles':
            _afficherTexteBoss('⚠ CONTRÔLES INVERSÉS');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            break;
        case 'faux_fantome':
            _afficherTexteBoss('⚠ SIGNAL BROUILLÉ');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'distorsion_plateau':
            _afficherTexteBoss('∞ DISTORSION ACTIVE');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'permutation_colonnes': {
            const cols = /** @type {[number, number] | null | undefined} */ (resultat);
            if (cols) {
                _afficherTexteBoss(`🌀 PERMUTATION DES COLONNES ${cols[0] + 1} ↔ ${cols[1] + 1}`);
                if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            }
            break;
        }
        default:
            break;
    }
}

function _degelColonnes() {
    degelColonnes(etat.plateau, store.histoire.boss.effets);
    _afficherTexteBoss('');
}

export function obtenirDecalageDistorsionBoss() {
    if (!store.histoire.boss.actif) return 0;
    return store.histoire.boss.effets.decalageDistorsion ?? 0;
}

export function obtenirControlesInversesBoss() {
    if (!store.histoire.boss.actif) return false;
    return store.histoire.boss.effets.bossControlesInverses ?? false;
}

export function obtenirFauxFantomeActif() {
    if (!store.histoire.boss.actif) return false;
    return store.histoire.boss.effets.bossFauxFantome ?? false;
}

function _verifierPhase() {
    const boss = store.histoire.boss.actif;
    if (!boss) return;

    const pctRestant = (store.histoire.boss.pv / boss.pvMax) * 100;
    const textesMi = TEXTES_MI_COMBAT[boss.id];
    if (textesMi && !store.histoire.boss._textesMiAffiches) {
        store.histoire.boss._textesMiAffiches = new Set();
    }
    if (textesMi) {
        for (const [seuilStr, texte] of Object.entries(textesMi)) {
            const seuil = Number(seuilStr);
            if (pctRestant <= seuil && !store.histoire.boss._textesMiAffiches.has(seuil)) {
                store.histoire.boss._textesMiAffiches.add(seuil);
                _afficherTexteBoss(texte);
                if (!AudioMoteur.muet) AudioMoteur.son('rotation');
                notifierPhaseBossParPv(boss.id, pctRestant);
            }
        }
    }

    const phaseAvant = store.histoire.boss.phase;

    if (!boss.phases) return;

    for (let i = boss.phases.length - 1; i >= 0; i--) {
        const phase = boss.phases[i];
        const seuilPhase = phase.pvSeuil ?? boss.pvMax;
        if (store.histoire.boss.pv <= seuilPhase && store.histoire.boss.phase < i) {
            store.histoire.boss.phase = i;
            _afficherTexteBoss('⚠ NOUVELLE PHASE');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            setTimeout(_exectuterAttaque, 800);
            if (store.histoire.boss.phase !== phaseAvant) {
                notifierPhaseBoss(boss.id, store.histoire.boss.phase);
            }
            break;
        }
    }
}

/** @param {boolean} visible */
function _afficherSectionBoss(visible) {
    if (typeof document === 'undefined') return;
    const sectionBoss = document.getElementById('section-boss');
    const sectionMascotte = document.getElementById('section-mascotte');
    if (sectionBoss) sectionBoss.classList.toggle('element-masque', !visible);
    if (sectionMascotte) sectionMascotte.classList.toggle('element-masque', visible);

    if (visible && store.histoire.boss.actif) {
        const elNom = document.getElementById('boss-nom-affiche');
        if (elNom) {
            elNom.textContent = store.histoire.boss.actif.nom ?? 'BOSS';
            elNom.style.color = store.histoire.boss.actif.couleur ?? 'var(--rose)';
        }
    }
}

function _mettreAJourHPBar() {
    if (typeof document === 'undefined') return;
    const boss = store.histoire.boss.actif;
    if (!boss) return;
    const pct = Math.max(0, (store.histoire.boss.pv / boss.pvMax) * 100);
    const fill = document.getElementById('boss-hp-fill');
    const label = document.getElementById('boss-hp-label');
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${store.histoire.boss.pv} / ${boss.pvMax}`;
    if (fill) {
        if (pct > 60) fill.style.background = store.histoire.boss.actif?.couleur ?? 'var(--vert)';
        else if (pct > 30) fill.style.background = 'var(--jaune)';
        else fill.style.background = 'var(--rose)';
    }
}

/** @param {string} texte */
function _afficherTexteBoss(texte) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('boss-attaque-label');
    if (el) el.textContent = texte;
}

function _mettreAJourTimerUI() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('boss-timer-label');
    const attaqueEl = document.getElementById('boss-attaque-label');

    if (store.histoire.boss.actif?.id === 'distorsion' && conditionsRuntime.trameAttenteActive) {
        const secRestantes = obtenirSecondesRestantesAttenteTrame();
        if (el) {
            el.textContent = secRestantes > 0 ? `ATTENTE : ${secRestantes}s` : 'CONDITION VALIDÉE';
        }
        if (attaqueEl) attaqueEl.textContent = 'NE RIEN EFFACER…';
        return;
    }

    if (store.histoire.boss.actif?.id === 'distorsion' && attaqueEl) {
        const etatHist = obtenirEtatHistoire();
        const ct = etatHist?.conditionsTrame;
        const prerequisOk =
            ct &&
            !ct.actionDistorsionFaite &&
            ct.miroirComplete &&
            ct.tousJournauxTrouves &&
            ct.tousBossSansContinue;
        if (prerequisOk) {
            attaqueEl.textContent = "UN ÉCHO RÉSONNE… REMPLISSEZ LE PLATEAU SANS L'EFFACER";
        }
    }

    if (el && store.histoire.boss.actif) {
        const sec = Math.ceil(store.histoire.boss.timerAttaque / 1000);
        el.textContent = sec > 0 ? `PROCHAINE : ${sec}s` : 'ATTAQUE !';
    }
}

export function bossEstActif() {
    return !!store.histoire.boss.actif;
}

export function bossEstVaincu() {
    return store.histoire.boss.vaincu;
}
