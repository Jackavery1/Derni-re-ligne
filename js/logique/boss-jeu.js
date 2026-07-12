import { store } from '../etat/store-jeu.js';
import { etat } from '../etat/store-jeu.js';
import { BOSS } from '../histoire-donnees.js';
import { AudioMoteur } from '../audio/audio.js';
import { logger } from '../io/logger.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import {
    tickConditionTrame,
    reinitialiserConditionsRuntime,
} from '../histoire/conditions-secrets.js';
import {
    demarrerPresentationBoss,
    mettreAJourDialoguesBoss,
    reinitialiserDialoguesBoss,
    dialogueBossActif,
} from '../histoire/boss-dialogues.js';
import { COULEUR_BRAISE, COULEUR_GLACE_B } from './boss-attaques.js';
import {
    afficherSectionBoss,
    afficherTexteBoss,
    mettreAJourHPBarBoss,
    mettreAJourTimerUIBoss,
} from '../rendu/boss-ui-hud.js';
import {
    degelColonnesBoss,
    endommagerBossCombat,
    executerAttaqueBossCombat,
    obtenirIntervalleAttaqueBoss,
    verifierPhaseBoss,
} from './boss-combat.js';

export { COULEUR_BRAISE, COULEUR_GLACE_B };
export {
    notifierTetrisBoss,
    obtenirRepliqueGameOverBoss,
    appliquerRepliqueGameOverBoss,
} from '../histoire/boss-dialogues.js';
export { DUREE_VICTOIRE_BOSS_MS } from './boss-jeu-constantes.js';

/** @param {string} bossId */
export function demarrerBoss(bossId) {
    const boss = BOSS[bossId];
    if (!boss) {
        logger.warn('[boss] bossId inconnu :', bossId);
        return;
    }
    reinitialiserDialoguesBoss();
    store.histoire.boss.actif = boss;
    store.histoire.boss.pv = boss.pvMax;
    store.histoire.boss.phase = 0;
    store.histoire.boss.timerAttaque = obtenirIntervalleAttaqueBoss(boss);
    store.histoire.boss.timerAttaqueActive = 0;
    store.histoire.boss.vaincu = false;
    store.histoire.boss.timerVaincu = 0;
    store.histoire.boss.timerDebut = performance.now();
    store.histoire.boss.timerPortrait = 0;
    store.histoire.boss._textesMiAffiches = null;
    store.histoire.boss._flashAttaque = false;
    reinitialiserMecaniquesBoss();

    afficherSectionBoss(true);
    mettreAJourHPBarBoss();

    if (modeHistoireEnCours()) {
        demarrerPresentationBoss(bossId);
        afficherTexteBoss(
            boss.entrainement
                ? 'ENTRAINEMENT — attaques ralenties, apprenez le rythme avant la Distorsion.'
                : ''
        );
    } else {
        afficherTexteBoss(boss.texteApparition ?? '');
    }

    logger.info('[boss] demarre :', bossId, 'PV:', boss.pvMax);
    if (!AudioMoteur.muet) AudioMoteur.jouerStingerBoss?.();
    reinitialiserConditionsRuntime();
}

export function arreterBoss() {
    if (!store.histoire.boss.actif) return;
    reinitialiserMecaniquesBoss();
    reinitialiserDialoguesBoss();
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
    afficherSectionBoss(false);
}

function reinitialiserMecaniquesBoss() {
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

    mettreAJourDialoguesBoss(dt);

    const boss = store.histoire.boss.actif;
    const m = store.histoire.boss.effets;

    if (m.timerControlesInverses > 0) {
        m.timerControlesInverses -= dt;
        if (m.timerControlesInverses <= 0) {
            m.bossControlesInverses = false;
            m.timerControlesInverses = 0;
            if (!dialogueBossActif()) afficherTexteBoss('');
        }
    }
    if (m.timerFauxFantome > 0) {
        m.timerFauxFantome -= dt;
        if (m.timerFauxFantome <= 0) {
            m.bossFauxFantome = false;
            m.timerFauxFantome = 0;
            if (!dialogueBossActif()) afficherTexteBoss('');
        }
    }
    if (m.timerDegelMs > 0) {
        m.timerDegelMs -= dt;
        if (m.timerDegelMs <= 0) degelColonnesBoss();
    }
    if (m.timerDistorsion > 0) {
        m.timerDistorsion -= dt;
        if (m.timerDistorsion <= 0) {
            m.decalageDistorsion = 0;
            m.timerDistorsion = 0;
            if (!dialogueBossActif()) afficherTexteBoss('');
        }
    }

    store.histoire.boss.timerAttaque -= dt;
    if (store.histoire.boss.timerAttaque <= 0) {
        executerAttaqueBossCombat();
        store.histoire.boss.timerAttaque = obtenirIntervalleAttaqueBoss(boss);
    }

    verifierPhaseBoss();
    store.histoire.boss.timerPortrait += dt;

    if (store.histoire.boss.vaincu) {
        store.histoire.boss.timerVaincu -= dt;
    }

    mettreAJourTimerUIBoss();

    if (store.histoire.boss.actif.id === 'distorsion') {
        tickConditionTrame(dt);
    }
}

/** @param {number} nbLignes */
export function endommagerBoss(nbLignes) {
    endommagerBossCombat(nbLignes);
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

export function bossEstActif() {
    return !!store.histoire.boss.actif;
}

export function bossEstVaincu() {
    return store.histoire.boss.vaincu;
}

export function obtenirBossIdActif() {
    return store.histoire.boss.actif?.id ?? null;
}
