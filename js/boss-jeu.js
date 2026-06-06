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
import { enregistrerVictoireBossTimer } from './achievements-histoire.js';

export const COULEUR_BRAISE = '#cc2200';
export const COULEUR_GLACE_B = '#aaeeff';
export const DUREE_VICTOIRE_BOSS_MS = 2200;

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
    store.histoire.boss.timerAttaque = boss.attaqueIntervalleMs ?? 15000;
    store.histoire.boss.timerAttaqueActive = 0;
    store.histoire.boss.vaincu = false;
    store.histoire.boss.timerVaincu = 0;
    store.histoire.boss.timerDebut = performance.now();
    store.histoire.boss.timerPortrait = 0;
    _reinitialiserMecaniques();

    _afficherSectionBoss(true);
    _mettreAJourHPBar();
    _afficherTexteBoss(boss.texteApparition ?? '');
    logger.info('[boss] démarré :', bossId, 'PV:', boss.pvMax);
    reinitialiserConditionsRuntime();
}

export function arreterBoss() {
    if (!store.histoire.boss.actif) return;
    _reinitialiserMecaniques();
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
        store.histoire.boss.timerAttaque = boss.attaqueIntervalleMs ?? 15000;
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
    const texte = boss?.texteDefaite ?? boss?.texteDefaite_normal ?? 'Défaite...';
    _afficherTexteBoss(texte);

    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * CONFIG.colonnes);
        const y = Math.floor(Math.random() * 6);
        creerParticulesExplosion(x, y, boss?.couleur ?? '#ffe600');
    }
    if (!AudioMoteur.muet) AudioMoteur.son('tetris');

    setTimeout(() => {
        import('./actions-jeu.js').then(({ obtenirActions }) => {
            obtenirActions().terminerPartie?.(true);
        });
    }, DUREE_VICTOIRE_BOSS_MS);
}

function _exectuterAttaque() {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    const boss = store.histoire.boss.actif;
    const phase = _obtenirPhaseActuelle();
    const typeAttaque = phase?.attaqueType ?? boss.attaqueType;

    if (!typeAttaque) return;

    if (typeAttaque === 'multi_phase') {
        const phaseData = boss.phases?.[store.histoire.boss.phase];
        if (phaseData) _appliquerAttaque(phaseData.type, phaseData.dureeMs);
    } else if (typeAttaque === 'combinaison' || typeAttaque === 'combinaison_glace_glitch') {
        const disponibles = boss.attaquesDisponibles ?? [
            'rangee_braise',
            'colonne_gelee',
            'inverser_controles',
        ];
        const type = disponibles[Math.floor(Math.random() * disponibles.length)];
        _appliquerAttaque(type, 8000);
    } else {
        _appliquerAttaque(typeAttaque, phase?.dureeMs ?? 0);
    }
}

/** @param {string} type @param {number} dureeMs */
function _appliquerAttaque(type, dureeMs) {
    const m = store.histoire.boss.effets;
    switch (type) {
        case 'rangee_braise':
            _attaqueRangeeBraise();
            break;
        case 'colonne_gelee':
            _attaqueColonneGelee(
                store.histoire.boss.actif?.nbColonnesGelees ?? 2,
                dureeMs || store.histoire.boss.actif?.dureeGelee || 8000
            );
            break;
        case 'inverser_controles':
            m.bossControlesInverses = true;
            m.timerControlesInverses = dureeMs || 6000;
            _afficherTexteBoss('⚠ CONTRÔLES INVERSÉS');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            break;
        case 'faux_fantome':
            m.bossFauxFantome = true;
            m.timerFauxFantome = dureeMs || 8000;
            _afficherTexteBoss('⚠ SIGNAL BROUILLÉ');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'distorsion_plateau':
            _attaqueDistorsionPlateau(dureeMs || 6000);
            break;
        default:
            logger.warn("[boss] type d'attaque inconnu :", type);
    }
}

function _attaqueRangeeBraise() {
    const gap = Math.floor(Math.random() * CONFIG.colonnes);
    const braise = new Array(CONFIG.colonnes).fill(COULEUR_BRAISE);
    braise[gap] = 0;
    etat.plateau.splice(0, 1);
    etat.plateau.push(braise);
    _afficherTexteBoss('🔥 RANGÉE DE BRAISE');
    if (!AudioMoteur.muet) AudioMoteur.son('verrou');
}

/** @param {number} nb @param {number} dureeMs */
function _attaqueColonneGelee(nb, dureeMs) {
    const colonnesDispos = Array.from({ length: CONFIG.colonnes }, (_, i) => i);
    const colonnesChoisies = _melangerTableau(colonnesDispos).slice(0, nb);
    const m = store.histoire.boss.effets;
    m.colonnesGelees = colonnesChoisies;
    m.timerDegelMs = dureeMs;

    const lignesAGeler = [
        CONFIG.lignes - 4,
        CONFIG.lignes - 3,
        CONFIG.lignes - 2,
        CONFIG.lignes - 1,
    ];
    for (const col of colonnesChoisies) {
        for (const lig of lignesAGeler) {
            if (lig >= 0 && etat.plateau[lig]?.[col] === 0) {
                etat.plateau[lig][col] = COULEUR_GLACE_B;
            }
        }
    }
    _afficherTexteBoss(`❄ COLONNES ${colonnesChoisies.map((c) => c + 1).join(', ')} GELÉES`);
    if (!AudioMoteur.muet) AudioMoteur.son('hold');
}

function _degelColonnes() {
    const m = store.histoire.boss.effets;
    for (let lig = 0; lig < CONFIG.lignes; lig++) {
        for (let col = 0; col < CONFIG.colonnes; col++) {
            if (etat.plateau[lig]?.[col] === COULEUR_GLACE_B) {
                etat.plateau[lig][col] = 0;
            }
        }
    }
    m.colonnesGelees = [];
    m.timerDegelMs = 0;
    _afficherTexteBoss('');
}

/** @param {number} dureeMs */
function _attaqueDistorsionPlateau(dureeMs) {
    const m = store.histoire.boss.effets;
    m.decalageDistorsion = Math.random() < 0.5 ? 1 : -1;
    m.timerDistorsion = dureeMs;
    _afficherTexteBoss('∞ DISTORSION ACTIVE');
    if (!AudioMoteur.muet) AudioMoteur.son('rotation');
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
    if (!boss?.phases) return;
    for (let i = boss.phases.length - 1; i >= 0; i--) {
        const phase = boss.phases[i];
        const seuil = phase.pvSeuil ?? boss.pvMax;
        if (store.histoire.boss.pv <= seuil && store.histoire.boss.phase < i) {
            store.histoire.boss.phase = i;
            _afficherTexteBoss('⚠ NOUVELLE PHASE');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            setTimeout(_exectuterAttaque, 800);
            break;
        }
    }
}

function _obtenirPhaseActuelle() {
    const boss = store.histoire.boss.actif;
    if (!boss?.phases) return null;
    return boss.phases[store.histoire.boss.phase] ?? null;
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

    if (el && store.histoire.boss.actif) {
        const sec = Math.ceil(store.histoire.boss.timerAttaque / 1000);
        el.textContent = sec > 0 ? `PROCHAINE : ${sec}s` : 'ATTAQUE !';
    }
}

/** @param {number[]} arr */
function _melangerTableau(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function bossEstActif() {
    return !!store.histoire.boss.actif;
}

export function bossEstVaincu() {
    return store.histoire.boss.vaincu;
}
