/** Textes carte histoire — mécaniques boss avant combat. */
export const BRIEFINGS_MECANIQUES_BOSS = {
    brasier: 'Mécanique : rangées de braise sur le bas du plateau.',
    sentinelle: 'Mécanique : colonnes gelées — anticipez le gel.',
    archiviste:
        'Mécaniques : contrôles inversés, puis faux fantôme (ombre rose décalée — ne la suivez pas).',
    avantgarde: 'Mécaniques : permutations de colonnes et gel (entraînement ralenti).',
    distorsion:
        'Mécaniques : phases multiples — contrôles inversés, gel, puis fantôme trompeur en fin de combat.',
};

/** Infobulles première occurrence en combat (par type d’attaque). */
export const INFOBULLES_ATTAQUES_BOSS = {
    faux_fantome: {
        titre: 'FAUX FANTOME',
        texte:
            'Un second fantome rose est affiche — ne le suivez pas. ' +
            'Le fantome cyan indique la chute reelle.',
    },
    inverser_controles: {
        titre: 'CONTROLES INVERSÉS',
        texte: 'Gauche et droite sont inverses temporairement. Anticipez avant de placer la piece.',
    },
    distorsion_plateau: {
        titre: 'DISTORSION DU PLATEAU',
        texte: 'Le plateau est deforme visuellement — la logique de collision reste normale.',
    },
    permutation_colonnes: {
        titre: 'PERMUTATION',
        texte: 'Deux colonnes entieres echangent leur place. Recomposez votre strategie.',
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
