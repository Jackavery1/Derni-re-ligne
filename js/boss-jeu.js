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
    store.bossActif = boss;
    store.pvBossActuels = boss.pvMax;
    store.bossPhaseActuelle = 0;
    store.timerAttaqueBoss = boss.attaqueIntervalleMs ?? 15000;
    store.timerAttaqueActive = 0;
    store.bossVaincu = false;
    store.timerBossVaincu = 0;
    store.timerBossDebut = performance.now();
    store.timerPortraitBoss = 0;
    _reinitialiserMecaniques();

    _afficherSectionBoss(true);
    _mettreAJourHPBar();
    _afficherTexteBoss(boss.texteApparition ?? '');
    logger.info('[boss] démarré :', bossId, 'PV:', boss.pvMax);
    reinitialiserConditionsRuntime();
}

export function arreterBoss() {
    if (!store.bossActif) return;
    _reinitialiserMecaniques();
    store.bossActif = null;
    store.pvBossActuels = 0;
    store.bossPhaseActuelle = 0;
    store.timerAttaqueBoss = 0;
    store.timerAttaqueActive = 0;
    store.bossVaincu = false;
    store.timerBossVaincu = 0;
    store.timerPortraitBoss = 0;
    _afficherSectionBoss(false);
}

function _reinitialiserMecaniques() {
    const m = store.mechaniquesBiomeActif;
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
    if (!store.bossActif || store.bossVaincu || etat.estEnPause) return;

    const boss = store.bossActif;
    const m = store.mechaniquesBiomeActif;

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

    store.timerAttaqueBoss -= dt;
    if (store.timerAttaqueBoss <= 0) {
        _exectuterAttaque();
        store.timerAttaqueBoss = boss.attaqueIntervalleMs ?? 15000;
    }

    _verifierPhase();
    store.timerPortraitBoss += dt;

    if (store.bossVaincu) {
        store.timerBossVaincu -= dt;
    }

    _mettreAJourTimerUI();

    if (store.bossActif.id === 'distorsion') {
        tickConditionTrame(dt);
    }
}

/** @param {number} nbLignes */
export function endommagerBoss(nbLignes) {
    if (!store.bossActif || store.bossVaincu) return;
    store.pvBossActuels = Math.max(0, store.pvBossActuels - nbLignes);
    _mettreAJourHPBar();

    if (store.pvBossActuels <= 0) {
        _declencherVictoireBoss();
    }
}

function _declencherVictoireBoss() {
    if (store.bossVaincu) return;
    store.bossVaincu = true;
    store.timerBossVaincu = DUREE_VICTOIRE_BOSS_MS;
    if (store.timerBossDebut) {
        enregistrerVictoireBossTimer(store.timerBossDebut);
    }

    const boss = store.bossActif;
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
    if (!store.bossActif || store.bossVaincu) return;
    const boss = store.bossActif;
    const phase = _obtenirPhaseActuelle();
    const typeAttaque = phase?.attaqueType ?? boss.attaqueType;

    if (!typeAttaque) return;

    if (typeAttaque === 'multi_phase') {
        const phaseData = boss.phases?.[store.bossPhaseActuelle];
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
    const m = store.mechaniquesBiomeActif;
    switch (type) {
        case 'rangee_braise':
            _attaqueRangeeBraise();
            break;
        case 'colonne_gelee':
            _attaqueColonneGelee(
                store.bossActif?.nbColonnesGelees ?? 2,
                dureeMs || store.bossActif?.dureeGelee || 8000
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
    const m = store.mechaniquesBiomeActif;
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
    const m = store.mechaniquesBiomeActif;
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
    const m = store.mechaniquesBiomeActif;
    m.decalageDistorsion = Math.random() < 0.5 ? 1 : -1;
    m.timerDistorsion = dureeMs;
    _afficherTexteBoss('∞ DISTORSION ACTIVE');
    if (!AudioMoteur.muet) AudioMoteur.son('rotation');
}

export function obtenirDecalageDistorsionBoss() {
    if (!store.bossActif) return 0;
    return store.mechaniquesBiomeActif.decalageDistorsion ?? 0;
}

export function obtenirControlesInversesBoss() {
    if (!store.bossActif) return false;
    return store.mechaniquesBiomeActif.bossControlesInverses ?? false;
}

export function obtenirFauxFantomeActif() {
    if (!store.bossActif) return false;
    return store.mechaniquesBiomeActif.bossFauxFantome ?? false;
}

function _verifierPhase() {
    const boss = store.bossActif;
    if (!boss?.phases) return;
    for (let i = boss.phases.length - 1; i >= 0; i--) {
        const phase = boss.phases[i];
        const seuil = phase.pvSeuil ?? boss.pvMax;
        if (store.pvBossActuels <= seuil && store.bossPhaseActuelle < i) {
            store.bossPhaseActuelle = i;
            _afficherTexteBoss('⚠ NOUVELLE PHASE');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            setTimeout(_exectuterAttaque, 800);
            break;
        }
    }
}

function _obtenirPhaseActuelle() {
    const boss = store.bossActif;
    if (!boss?.phases) return null;
    return boss.phases[store.bossPhaseActuelle] ?? null;
}

/** @param {boolean} visible */
function _afficherSectionBoss(visible) {
    if (typeof document === 'undefined') return;
    const sectionBoss = document.getElementById('section-boss');
    const sectionMascotte = document.getElementById('section-mascotte');
    if (sectionBoss) sectionBoss.style.display = visible ? 'flex' : 'none';
    if (sectionMascotte) sectionMascotte.style.display = visible ? 'none' : '';

    if (visible && store.bossActif) {
        const elNom = document.getElementById('boss-nom-affiche');
        if (elNom) {
            elNom.textContent = store.bossActif.nom ?? 'BOSS';
            elNom.style.color = store.bossActif.couleur ?? 'var(--rose)';
        }
    }
}

function _mettreAJourHPBar() {
    if (typeof document === 'undefined') return;
    const boss = store.bossActif;
    if (!boss) return;
    const pct = Math.max(0, (store.pvBossActuels / boss.pvMax) * 100);
    const fill = document.getElementById('boss-hp-fill');
    const label = document.getElementById('boss-hp-label');
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${store.pvBossActuels} / ${boss.pvMax}`;
    if (fill) {
        if (pct > 60) fill.style.background = store.bossActif?.couleur ?? 'var(--vert)';
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

    if (store.bossActif?.id === 'distorsion' && conditionsRuntime.trameAttenteActive) {
        const secRestantes = obtenirSecondesRestantesAttenteTrame();
        if (el) {
            el.textContent = secRestantes > 0 ? `ATTENTE : ${secRestantes}s` : 'CONDITION VALIDÉE';
        }
        if (attaqueEl) attaqueEl.textContent = 'NE RIEN EFFACER…';
        return;
    }

    if (el && store.bossActif) {
        const sec = Math.ceil(store.timerAttaqueBoss / 1000);
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
    return !!store.bossActif;
}

export function bossEstVaincu() {
    return store.bossVaincu;
}
