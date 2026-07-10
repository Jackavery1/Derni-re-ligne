/** Combat boss — dégâts, phases, victoire et attaques spéciales. */
import { CONFIG } from '../config/config-jeu.js';
import { store } from '../etat/store-jeu.js';
import { etat } from '../etat/store-jeu.js';
import { AudioMoteur } from '../audio/audio.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { creerParticulesExplosion } from '../rendu/particules-jeu.js';
import { enregistrerVictoireBossTimer } from '../achievements/achievements-histoire.js';
import {
    notifierPhaseBoss,
    notifierPhaseBossParPv,
    victoireObjectifDeclenchee,
} from './gestionnaire-difficulte.js';
import {
    reagirRoboBossAttaque,
    reagirRoboBossDegats,
    reagirRoboBossVaincu,
} from '../ui/mascotte-robo.js';
import { degelColonnes, executerAttaqueBoss } from './boss-attaques.js';
import {
    enqueueDialogueBoss,
    notifierTransitionPhaseBoss,
    notifierSeuilsPvBoss,
    notifierQuasiVaincuBoss,
    dialogueBossActif,
} from '../histoire/boss-dialogues.js';
import { DUREE_VICTOIRE_BOSS_MS } from './boss-jeu-constantes.js';
import { afficherTexteBoss, mettreAJourHPBarBoss } from '../rendu/boss-ui-hud.js';
import { proposerInfobulleAttaqueBoss } from '../ui/infobulles-contexte.js';

/** @returns {import('./boss-attaques.js').ContexteAttaqueBoss} */
function ctxAttaque() {
    return {
        plateau: etat.plateau,
        effets: store.histoire.boss.effets,
        bossActif: store.histoire.boss.actif,
    };
}

/** @param {{ id?: string, attaqueIntervalleMs?: number }} boss */
export function obtenirIntervalleAttaqueBoss(boss) {
    const base = boss.attaqueIntervalleMs ?? 15000;
    if (boss.id === 'distorsion' && store.histoire.boss.pv <= 12) {
        return 9000;
    }
    return base;
}

/** @param {number} nbLignes */
export function endommagerBossCombat(nbLignes) {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    store.histoire.boss.pv = Math.max(0, store.histoire.boss.pv - nbLignes);
    mettreAJourHPBarBoss();
    reagirRoboBossDegats();

    const boss = store.histoire.boss.actif;
    const pctRestant = (store.histoire.boss.pv / boss.pvMax) * 100;
    if (modeHistoireEnCours()) {
        notifierQuasiVaincuBoss(pctRestant);
    }

    if (store.histoire.boss.pv <= 0) {
        declencherVictoireBoss();
    }
}

export function declencherVictoireBoss() {
    if (store.histoire.boss.vaincu) return;
    store.histoire.boss.vaincu = true;
    store.histoire.boss.timerVaincu = DUREE_VICTOIRE_BOSS_MS;
    if (store.histoire.boss.timerDebut) {
        enregistrerVictoireBossTimer(store.histoire.boss.timerDebut);
    }

    const boss = store.histoire.boss.actif;
    const texte = boss?.texteDefaite ?? boss?.texteDefaite_normal ?? 'Defaite...';
    enqueueDialogueBoss(texte);
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

export function executerAttaqueBossCombat() {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    store.histoire.boss._flashAttaque = true;
    reagirRoboBossAttaque();
    setTimeout(() => {
        if (store.histoire.boss.actif) store.histoire.boss._flashAttaque = false;
    }, 280);

    const boss = store.histoire.boss.actif;
    const attaque = executerAttaqueBoss(boss, store.histoire.boss.phase, ctxAttaque());
    if (attaque) afficherEffetAttaqueBoss(attaque.type, attaque.dureeMs, attaque.resultat);
}

/**
 * @param {string} type
 * @param {number} dureeMs
 * @param {unknown} resultat
 */
function afficherEffetAttaqueBoss(type, dureeMs, resultat) {
    proposerInfobulleAttaqueBoss(type);
    switch (type) {
        case 'rangee_braise':
            if (resultat === false) {
                enqueueDialogueBoss('🔥 BRAISE CONTENUE');
            } else {
                enqueueDialogueBoss('🔥 RANGÉE DE BRAISE');
                if (!AudioMoteur.muet) AudioMoteur.son('verrou');
            }
            break;
        case 'colonne_gelee': {
            const colonnes = /** @type {number[] | undefined} */ (resultat);
            if (colonnes?.length) {
                enqueueDialogueBoss(`❄ COLONNES ${colonnes.map((c) => c + 1).join(', ')} GELÉES`);
                if (!AudioMoteur.muet) AudioMoteur.son('hold');
            }
            break;
        }
        case 'inverser_controles':
            enqueueDialogueBoss('⚠ CONTRÔLES INVERSÉS');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            break;
        case 'faux_fantome':
            enqueueDialogueBoss('⚠ FANTOME ROSE = PIÈGE');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'distorsion_plateau':
            enqueueDialogueBoss('∞ DISTORSION ACTIVE');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'permutation_colonnes': {
            const cols = /** @type {[number, number] | null | undefined} */ (resultat);
            if (cols) {
                enqueueDialogueBoss(`🌀 PERMUTATION DES COLONNES ${cols[0] + 1} ↔ ${cols[1] + 1}`);
                if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            }
            break;
        }
        default:
            break;
    }
}

export function degelColonnesBoss() {
    degelColonnes(etat.plateau, store.histoire.boss.effets);
    if (!dialogueBossActif()) afficherTexteBoss('');
}

export function verifierPhaseBoss() {
    const boss = store.histoire.boss.actif;
    if (!boss) return;

    const pctRestant = (store.histoire.boss.pv / boss.pvMax) * 100;

    if (modeHistoireEnCours()) {
        notifierSeuilsPvBoss(pctRestant);
        notifierPhaseBossParPv(boss.id, pctRestant);
    }

    const phaseAvant = store.histoire.boss.phase;

    if (!boss.phases) return;

    for (let i = boss.phases.length - 1; i >= 0; i--) {
        const phase = boss.phases[i];
        const seuilPhase = phase.pvSeuil ?? boss.pvMax;
        if (store.histoire.boss.pv <= seuilPhase && store.histoire.boss.phase < i) {
            store.histoire.boss.phase = i;
            if (modeHistoireEnCours()) {
                notifierTransitionPhaseBoss(phaseAvant, store.histoire.boss.phase);
            } else {
                enqueueDialogueBoss('⚠ NOUVELLE PHASE');
            }
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            setTimeout(executerAttaqueBossCombat, 800);
            if (store.histoire.boss.phase !== phaseAvant) {
                notifierPhaseBoss(boss.id, store.histoire.boss.phase);
            }
            break;
        }
    }
}
