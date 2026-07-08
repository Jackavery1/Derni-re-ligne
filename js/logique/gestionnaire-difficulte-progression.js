import { PALIERS_VITESSE_MS, VITESSE_PLANCHER_MS } from '../io/difficulte-mondes-chargement.js';
import { store } from '../etat/store-jeu.js';
import { logger } from '../logger.js';
import { emettre, ecouter } from '../etat/bus-jeu.js';
import { obtenirSuiviDifficulte } from './gestionnaire-difficulte-etat.js';

const DUREE_VICTOIRE_OBJECTIF_MS = 2200;

export function vitesseHistoireMs() {
    const d = store.histoire.difficulte;
    if (!d?.actif) return PALIERS_VITESSE_MS[5];
    const palierMs = PALIERS_VITESSE_MS[d.palierCourant] ?? PALIERS_VITESSE_MS[5];
    const mult = store.multGraviteMusique || 1;
    const effective = Math.max(VITESSE_PLANCHER_MS, palierMs / mult);
    logger.debug('[difficulte] vitesse effective ms', effective, 'palier', d.palierCourant);
    return effective;
}

function planifierPalier(nouveauPalier) {
    const d = store.histoire.difficulte;
    if (!d?.actif || d.palierCourant === nouveauPalier) return;

    const appliquer = () => {
        const palierAvant = d.palierCourant;
        d.palierEnAttente = nouveauPalier;
        emettre('difficulte:vague', {
            palierAvant,
            palierApres: nouveauPalier,
            montee: nouveauPalier > palierAvant,
        });
        logger.debug('[difficulte] vague planifiee', palierAvant, '→', nouveauPalier);
    };

    if (store.surtensionActive) {
        if (d.ecouteurSurtension) {
            appliquer();
            return;
        }
        d.ecouteurSurtension = ecouter('musique:section', () => {
            d.ecouteurSurtension?.();
            d.ecouteurSurtension = null;
            appliquer();
        });
        return;
    }

    appliquer();
}

export function consommerPalierEnAttentePosePiece() {
    const d = store.histoire.difficulte;
    if (!d?.actif || d.palierEnAttente === null) return;

    d.palierCourant = d.palierEnAttente;
    d.palierEnAttente = null;
}

export function enregistrerPosePiece() {
    const d = store.histoire.difficulte;
    if (!d?.actif) return;
    d.suiviEtoiles.pieces++;
    consommerPalierEnAttentePosePiece();
}

/**
 * @param {{ nbLignes?: number, estTetris?: boolean, combo?: number }} params
 */
export function enregistrerProgression(params) {
    const d = store.histoire.difficulte;
    if (!d?.actif || d.victoireDeclenchee) return;

    const nbLignes = params.nbLignes ?? 0;
    const estTetris = params.estTetris ?? false;
    const combo = params.combo ?? 0;

    if (nbLignes <= 0) return;

    d.lignesEffacees += nbLignes;
    if (combo > d.suiviEtoiles.comboMax) d.suiviEtoiles.comboMax = combo;
    if (estTetris) d.suiviEtoiles.tetris++;
    if (nbLignes === 3) d.suiviEtoiles.triples++;

    const config = d.config;
    if (!config || config.boss) return;

    const fraction = d.lignesObjectif > 0 ? d.lignesEffacees / d.lignesObjectif : 0;
    const vagues = config.profilVitesse ?? [];

    for (let i = 0; i < vagues.length; i++) {
        if (i === 0) continue;
        const vague = vagues[i];
        if (fraction >= vague.a && !d.vaguesAppliquees.includes(i)) {
            d.vaguesAppliquees.push(i);
            planifierPalier(vague.palier);
        }
    }

    if (!d.zen && d.lignesEffacees >= d.lignesObjectif) {
        d.victoireDeclenchee = true;
        emettre('monde:objectif-atteint', { mondeId: d.mondeId });
        setTimeout(() => {
            import('./actions-jeu.js').then(({ obtenirActions }) => {
                obtenirActions().terminerPartie?.(true);
            });
        }, DUREE_VICTOIRE_OBJECTIF_MS);
    }
}

/** @param {string} bossId @param {number} phaseIndex */
export function notifierPhaseBoss(bossId, phaseIndex) {
    const d = store.histoire.difficulte;
    if (!d?.actif || !d.boss) return;

    const paliers = d.config?.phasePaliers ?? [];
    if (phaseIndex <= 0 || phaseIndex >= paliers.length) return;
    if (d.phasesBossAppliquees.includes(phaseIndex)) return;

    d.phasesBossAppliquees.push(phaseIndex);
    planifierPalier(paliers[phaseIndex]);
    emettre('boss:phase', { bossId, phase: phaseIndex + 1 });
    logger.debug('[difficulte] boss:phase', bossId, phaseIndex + 1);
}

/** @param {string} bossId @param {number} pctRestant */
export function notifierPhaseBossParPv(bossId, pctRestant) {
    const d = store.histoire.difficulte;
    if (!d?.actif || !d.boss) return;
    if (pctRestant <= 25) notifierPhaseBoss(bossId, 2);
    else if (pctRestant <= 50) notifierPhaseBoss(bossId, 1);
}

export function enregistrerTopOut() {
    const d = obtenirSuiviDifficulte();
    if (!d?.actif) return;
    d.suiviEtoiles.topout = true;
}
