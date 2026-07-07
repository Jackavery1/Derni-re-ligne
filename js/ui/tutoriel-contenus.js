export const CLES = {
    prologue: 'derniereLigne_tutorielHistoireVu',
    libre: 'derniereLigne_tutorielLibreVu',
    coop: 'derniereLigne_tutorielCoopVu',
    architecte: 'derniereLigne_tutorielArchitecteVu',
    oracle: 'derniereLigne_tutorielOracleVu',
    distorsion: 'derniereLigne_tutorielDistorsionVu',
};

/** @type {{ titre: string, lignes: string[], avecControles?: boolean }[]} */
export const SLIDES_PROLOGUE = [
    {
        titre: 'BIENVENUE DANS DERNIÈRE LIGNE',
        lignes: [
            'Parcourez la carte des mondes (souris ou liste clavier) et suivez ROBO à travers l’histoire.',
            'Molette ou pincement pour zoomer, clic-glisser pour déplacer. Sur mobile : glissez un doigt.',
        ],
        avecControles: true,
    },
    {
        titre: 'OBJECTIFS, BOSS ET BIOMES',
        lignes: [
            'Chaque monde se termine après un quota de lignes ou un combat de boss — visez ★★★ pour les secrets.',
            'Les boss changent de phase quand leur jauge baisse ; le palier de vitesse monte en partie.',
            'Chaque biome modifie les règles (météo, cellules vivantes, reliques…) : lisez l’indicateur sous l’objectif.',
        ],
    },
    {
        titre: 'RELIQUES ET ORACLE',
        lignes: [
            'Les reliques apparaissent après un nombre de pièces — choisissez-en une à chaque palier.',
            "L'Oracle (débloqué plus tard) suggère un placement : suivez-le ou défiez-le pour multiplier le score.",
            'Amusez-vous — les modes Coop, Architecte et Oracle ont leur propre tutoriel au premier lancement.',
        ],
    },
];

export const NOMBRE_SLIDES_PROLOGUE = SLIDES_PROLOGUE.length;

/** @type {{ titre: string, lignes: string[], avecControles?: boolean }[]} */
export const SLIDES_LIBRE = [
    {
        titre: 'BIENVENUE — MODE LIBRE',
        lignes: [
            'Choisissez un biome sur la constellation, puis effacez des lignes pour monter en niveau.',
            'En marathon, le compteur TEMPS NIV. force un passage de niveau à zéro — la barre sous le chrono montre le temps restant.',
            'Le sprint vise 40 lignes au chrono, sans timer de niveau.',
        ],
        avecControles: true,
    },
    {
        titre: 'SCORE ET PROGRESSION',
        lignes: [
            'Tetris, combos et back-to-back multiplient les points. Battez vos records par biome.',
            'Les reliques apparaissent après un nombre de pièces — le compteur est affiché sous NEXT.',
        ],
    },
    {
        titre: 'MODES AVANCÉS',
        lignes: [
            'Coop, Architecte et Oracle se débloquent en campagne — chacun a son tutoriel au premier lancement.',
            'La campagne Histoire (bouton rose) raconte la quête de ROBO et de VERA.',
        ],
    },
];

export const NOMBRE_SLIDES_LIBRE = SLIDES_LIBRE.length;

/** @type {{ touche: string, action: string }[]} */
export const CONTROLES_CLAVIER = [
    { touche: '← →', action: 'Deplacer' },
    { touche: '↑ / Z', action: 'Tourner (horaire)' },
    { touche: 'X', action: 'Tourner (anti-horaire)' },
    { touche: '↓', action: 'Chute lente' },
    { touche: 'ESPACE', action: 'Chute rapide' },
    { touche: 'C / ⇧', action: 'Reserve (hold)' },
    { touche: 'P / Échap', action: 'Pause' },
];

/** @type {Record<'coop' | 'architecte' | 'oracle' | 'distorsion', { titre: string, lignes: string[] }>} */
export const CONTENUS = {
    coop: {
        titre: 'MODE COOPÉRATIF',
        lignes: [
            'Deux joueurs partagent UN SEUL plateau : J1 colonnes 1–5 (gauche), J2 colonnes 6–10 (droite).',
            'Schema : [ J1 | J1 | J1 | J1 | J1 | J2 | J2 | J2 | J2 | J2 ] — une ligne ne s’efface que si les DEUX moities sont remplies.',
            'J1 : WASD deplacer, W/Q tourner, Shift gauche = chute rapide, E = reserve, R = passerelle.',
            'J2 : fleches deplacer, ↑ / Pave num. 8 tourner, Shift droit = chute rapide, Pave num. 7 = reserve, 9 = passerelle.',
            'La passerelle envoie votre prochaine piece à l’autre joueur (1 par niveau). Coordonnez-vous !',
        ],
    },
    architecte: {
        titre: 'MODE ARCHITECTE',
        lignes: [
            'Placez les pieces sans gravite automatique pour remplir l’objectif du puzzle.',
            'Backspace annule le dernier placement. Visez la precision et le nombre minimal de pieces pour les etoiles.',
        ],
    },
    oracle: {
        titre: 'MODE ORACLE',
        lignes: [
            'L’Oracle suggere un placement optimal pour la piece en cours (fantome cyan).',
            'Suivez la suggestion : bonus de score. Ignorez-la avec succes : multiplicateur jusqu’a ×5.0.',
            'Echouez en ignorant : le multiplicateur retombe a ×1.0. Ideal pour les joueurs avances !',
            'Disponible apres le boss Avant-Garde. Activez-le depuis le menu ou en partie.',
        ],
    },
    distorsion: {
        titre: 'ENTRAINEMENT — PUIS DISTORSION',
        lignes: [
            "L'Avant-Garde est un combat d'entrainement : PV reduits, attaques ralenties.",
            'La Distorsion a 3 phases : rangees de braise, glace + glitch, puis distorsion du plateau.',
            'Observez la jauge de vie et anticipez les changements de phase a 50 % et 25 % des PV.',
            "Validez l'entrainement avant d'affronter la finale.",
        ],
    },
};
