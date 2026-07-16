/** Textes carte histoire — mécaniques boss avant combat. */
export const BRIEFINGS_MECANIQUES_BOSS = {
    brasier: 'Mécanique : rangées de braise sur le bas du plateau.',
    sentinelle: 'Mécanique : colonnes gelées — anticipez le gel.',
    archiviste:
        'Mécaniques : contrôles inversés, puis faux fantôme (ombre rose décalée — ne la suivez pas).',
    avantgarde: 'Mécaniques : permutations de colonnes et gel (entraînement ralenti).',
    distorsion:
        'Mécaniques : phases multiples — rangées de braise, puis gel/glitch, puis distorsion du plateau.',
};

/** Infobulles première occurrence en combat (par type d’attaque). */
export const INFOBULLES_ATTAQUES_BOSS = {
    rangee_braise: {
        titre: 'RANGÉE DE BRAISE',
        texte:
            'Une rangée de braise apparaît en bas du plateau, avec une seule brèche. ' +
            'Placez une pièce dans l’ouverture pour contenir la montée.',
    },
    colonne_gelee: {
        titre: 'COLONNES GELÉES',
        texte:
            'Des colonnes se figent temporairement. Anticipez le gel et jouez autour ' +
            'des colonnes encore libres.',
    },
    faux_fantome: {
        titre: 'FAUX FANTÔME',
        texte:
            'Un second fantôme rose est affiché — ne le suivez pas. ' +
            'Le fantôme cyan indique la chute réelle.',
    },
    inverser_controles: {
        titre: 'CONTRÔLES INVERSÉS',
        texte: 'Gauche et droite sont inversés temporairement. Anticipez avant de placer la pièce.',
    },
    distorsion_plateau: {
        titre: 'DISTORSION DU PLATEAU',
        texte: 'Le plateau est déformé visuellement — la logique de collision reste normale.',
    },
    permutation_colonnes: {
        titre: 'PERMUTATION',
        texte: 'Deux colonnes entières échangent leur place. Recomposez votre stratégie.',
    },
};

/** @param {string | undefined} bossId */
export function obtenirBriefingMecaniqueBoss(bossId) {
    if (!bossId) return '';
    return BRIEFINGS_MECANIQUES_BOSS[bossId] ?? '';
}

/** @param {string | undefined} typeAttaque */
export function obtenirInfobulleAttaqueBoss(typeAttaque) {
    if (!typeAttaque) return null;
    return (
        INFOBULLES_ATTAQUES_BOSS[
            /** @type {keyof typeof INFOBULLES_ATTAQUES_BOSS} */ (typeAttaque)
        ] ?? null
    );
}
