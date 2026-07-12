import { CONFIG } from '../config/config-jeu.js';
import { logger } from '../io/logger.js';

export const COULEUR_BRAISE = '#cc2200';
export const COULEUR_GLACE_B = '#aaeeff';

/** @param {(string | number)[][]} plateau */
export function hauteurEmpilement(plateau) {
    for (let lig = 0; lig < CONFIG.lignes; lig++) {
        if (plateau[lig]?.some((cellule) => cellule !== 0)) {
            return CONFIG.lignes - lig;
        }
    }
    return 0;
}

/** @param {number[]} arr */
export function melangerTableau(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * @param {(string | number)[][]} plateau
 * @returns {boolean} true si la rangée a été ajoutée
 */
export function attaqueRangeeBraise(plateau) {
    if (hauteurEmpilement(plateau) >= CONFIG.lignes - 2) {
        return false;
    }
    const gap = Math.floor(Math.random() * CONFIG.colonnes);
    const braise = new Array(CONFIG.colonnes).fill(COULEUR_BRAISE);
    braise[gap] = 0;
    plateau.splice(0, 1);
    plateau.push(braise);
    return true;
}

/**
 * @param {(string | number)[][]} plateau
 * @param {{ colonnesGelees: number[], timerDegelMs: number }} effets
 * @param {number} nb
 * @param {number} dureeMs
 * @returns {number[]}
 */
export function attaqueColonneGelee(plateau, effets, nb, dureeMs) {
    const colonnesDispos = Array.from({ length: CONFIG.colonnes }, (_, i) => i);
    const colonnesChoisies = melangerTableau(colonnesDispos).slice(0, nb);
    effets.colonnesGelees = colonnesChoisies;
    effets.timerDegelMs = dureeMs;

    const lignesAGeler = [
        CONFIG.lignes - 4,
        CONFIG.lignes - 3,
        CONFIG.lignes - 2,
        CONFIG.lignes - 1,
    ];
    for (const col of colonnesChoisies) {
        for (const lig of lignesAGeler) {
            if (lig >= 0 && plateau[lig]?.[col] === 0) {
                plateau[lig][col] = COULEUR_GLACE_B;
            }
        }
    }
    return colonnesChoisies;
}

/**
 * @param {(string | number)[][]} plateau
 * @param {{ colonnesGelees: number[], timerDegelMs: number }} effets
 */
export function degelColonnes(plateau, effets) {
    for (const col of effets.colonnesGelees) {
        for (let lig = 0; lig < CONFIG.lignes; lig++) {
            if (plateau[lig]?.[col] === COULEUR_GLACE_B) {
                plateau[lig][col] = 0;
            }
        }
    }
    effets.colonnesGelees = [];
    effets.timerDegelMs = 0;
}

/** @param {(string | number)[][]} plateau @returns {[number, number] | null} */
export function attaquePermutationColonnes(plateau) {
    if (CONFIG.colonnes < 2) return null;
    const [colA, colB] = melangerTableau(
        Array.from({ length: CONFIG.colonnes }, (_, i) => i)
    ).slice(0, 2);

    for (let lig = 0; lig < CONFIG.lignes; lig++) {
        const ligne = plateau[lig];
        if (!ligne) continue;
        const tmp = ligne[colA];
        ligne[colA] = ligne[colB];
        ligne[colB] = tmp;
    }
    return [colA, colB];
}

/**
 * @param {{ decalageDistorsion: number, timerDistorsion: number }} effets
 * @param {number} dureeMs
 */
export function attaqueDistorsionPlateau(effets, dureeMs) {
    effets.decalageDistorsion = Math.random() < 0.5 ? 1 : -1;
    effets.timerDistorsion = dureeMs;
}

/**
 * @typedef {object} ContexteAttaqueBoss
 * @property {(string | number)[][]} plateau
 * @property {object} effets
 * @property {object | null} bossActif
 */

export const REGISTRE_ATTAQUES_BOSS = {
    rangee_braise: (ctx) => attaqueRangeeBraise(ctx.plateau),
    colonne_gelee: (ctx, dureeMs) =>
        attaqueColonneGelee(
            ctx.plateau,
            ctx.effets,
            ctx.bossActif?.nbColonnesGelees ?? 2,
            dureeMs || ctx.bossActif?.dureeGelee || 8000
        ),
    inverser_controles: (ctx, dureeMs) => {
        ctx.effets.bossControlesInverses = true;
        ctx.effets.timerControlesInverses = dureeMs || 6000;
    },
    faux_fantome: (ctx, dureeMs) => {
        ctx.effets.bossFauxFantome = true;
        ctx.effets.timerFauxFantome = dureeMs || 8000;
    },
    distorsion_plateau: (ctx, dureeMs) => attaqueDistorsionPlateau(ctx.effets, dureeMs || 6000),
    permutation_colonnes: (ctx) => attaquePermutationColonnes(ctx.plateau),
};

/**
 * @param {string} type
 * @param {number} dureeMs
 * @param {ContexteAttaqueBoss} ctx
 * @returns {unknown}
 */
export function appliquerAttaqueBoss(type, dureeMs, ctx) {
    const handler =
        REGISTRE_ATTAQUES_BOSS[/** @type {keyof typeof REGISTRE_ATTAQUES_BOSS} */ (type)];
    if (!handler) {
        logger.warn("[boss] type d'attaque inconnu :", type);
        return null;
    }
    return handler(ctx, dureeMs);
}

/**
 * @param {object} boss
 * @param {number} phaseIndex
 * @param {ContexteAttaqueBoss} ctx
 * @returns {{ type: string, dureeMs: number, resultat: unknown } | null}
 */
export function executerAttaqueBoss(boss, phaseIndex, ctx) {
    const phase = boss.phases?.[phaseIndex] ?? null;
    const typeAttaque = phase?.attaqueType ?? boss.attaqueType;
    if (!typeAttaque) return null;

    if (typeAttaque === 'multi_phase') {
        const phaseData = boss.phases?.[phaseIndex];
        if (!phaseData) return null;
        return {
            type: phaseData.type,
            dureeMs: phaseData.dureeMs,
            resultat: appliquerAttaqueBoss(phaseData.type, phaseData.dureeMs, ctx),
        };
    }

    if (typeAttaque === 'combinaison' || typeAttaque === 'combinaison_glace_glitch') {
        const disponibles = boss.attaquesDisponibles ?? [
            'rangee_braise',
            'colonne_gelee',
            'inverser_controles',
        ];
        const type = disponibles[Math.floor(Math.random() * disponibles.length)];
        return {
            type,
            dureeMs: 8000,
            resultat: appliquerAttaqueBoss(type, 8000, ctx),
        };
    }

    const dureeMs = phase?.dureeMs ?? 0;
    return {
        type: typeAttaque,
        dureeMs,
        resultat: appliquerAttaqueBoss(typeAttaque, dureeMs, ctx),
    };
}
