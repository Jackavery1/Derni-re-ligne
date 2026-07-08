/** Échelle unique : ms par descente d'une cellule (cohérente avec CONFIG : 920 ms = très lent). */
export const PALIERS_VITESSE_MS = {
    1: 860,
    2: 780,
    3: 700,
    4: 630,
    5: 565,
    6: 505,
    7: 450,
    8: 400,
    9: 355,
    10: 315,
    11: 280,
    12: 250,
    13: 225,
    14: 200,
};

/** Plancher de la vitesse EFFECTIVE après tous modificateurs (éclipse, Surtension). */
export const VITESSE_PLANCHER_MS = 120;

/**
 * profilVitesse : vagues { a: fraction objectif, palier: n } — le palier peut monter ou descendre.
 * Boss : phasePaliers[i] → phase i+1. objectifLignes = SEUILS_COMPLETION existants.
 */
export const DIFFICULTE_MONDES = {
    monde_prologue: {
        objectifLignes: 10,
        profilVitesse: [
            { a: 0, palier: 1 },
            { a: 0.55, palier: 2 },
        ],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'tops_volontaires', valeur: 3 },
    },
    monde_lave: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 3 },
            { a: 0.35, palier: 5 },
            { a: 0.65, palier: 5 },
            { a: 0.85, palier: 6 },
        ],
        etoile2: { type: 'combo', valeur: 3 },
        etoile3: { type: 'tetris', valeur: 1 },
    },
    monde_rouille: {
        objectifLignes: 11,
        profilVitesse: [
            { a: 0, palier: 3 },
            { a: 0.5, palier: 5 },
            { a: 0.85, palier: 4 },
        ],
        etoile2: { type: 'pieces_max', valeur: 48 },
        etoile3: { type: 'combo', valeur: 4 },
    },
    monde_boss_1: {
        boss: true,
        phasePaliers: [4, 5, 6],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'sans_continue' },
    },
    monde_ocean: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.4, palier: 6 },
            { a: 0.7, palier: 4 },
            { a: 0.9, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'pieces_max', valeur: 52 },
    },
    monde_foret: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.45, palier: 6 },
            { a: 0.85, palier: 7 },
        ],
        etoile2: { type: 'combo', valeur: 4 },
        etoile3: { type: 'tetris', valeur: 2 },
    },
    monde_glace: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 6 },
            { a: 0.45, palier: 4 },
            { a: 0.75, palier: 7 },
        ],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'combo', valeur: 5 },
    },
    monde_boss_2: {
        boss: true,
        phasePaliers: [6, 7, 8],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'sans_continue' },
    },
    monde_desert: {
        objectifLignes: 13,
        profilVitesse: [
            { a: 0, palier: 5 },
            { a: 0.35, palier: 6 },
            { a: 0.6, palier: 7 },
            { a: 0.85, palier: 8 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'pieces_max', valeur: 56 },
    },
    monde_eclipse: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 5 },
            { a: 0.3, palier: 8 },
            { a: 0.55, palier: 5 },
            { a: 0.8, palier: 8 },
        ],
        etoile2: { type: 'combo', valeur: 4 },
        etoile3: { type: 'tetris', valeur: 2 },
    },
    monde_cyber: {
        objectifLignes: 14,
        profilVitesse: [
            { a: 0, palier: 6 },
            { a: 0.35, palier: 9 },
            { a: 0.55, palier: 6 },
            { a: 0.75, palier: 10 },
            { a: 0.92, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'tetris_triple', valeur: 3 },
    },
    monde_boss_3: {
        boss: true,
        phasePaliers: [8, 10, 9],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'sans_continue' },
    },
    monde_fuochi: {
        objectifLignes: 14,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.3, palier: 6 },
            { a: 0.5, palier: 4 },
            { a: 0.7, palier: 7 },
            { a: 0.9, palier: 5 },
        ],
        etoile2: { type: 'combo', valeur: 5 },
        etoile3: { type: 'tetris', valeur: 2 },
    },
    monde_cosmos: {
        objectifLignes: 14,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.4, palier: 6 },
            { a: 0.6, palier: 4 },
            { a: 0.8, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'pieces_max', valeur: 58 },
    },
    monde_vide: {
        objectifLignes: 11,
        profilVitesse: [
            { a: 0, palier: 5 },
            { a: 0.45, palier: 7 },
            { a: 0.75, palier: 5 },
        ],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'combo', valeur: 5 },
    },
    monde_boss_4: {
        boss: true,
        entrainement: true,
        phasePaliers: [5, 6, 7],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'sans_continue' },
    },
    monde_finale: {
        boss: true,
        phasePaliers: [6, 8, 6],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'attente_sans_effacer', valeur: 30 },
    },
    monde_miroir: {
        objectifLignes: 14,
        profilVitesse: [
            { a: 0, palier: 11 },
            { a: 0.45, palier: 9 },
            { a: 0.8, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'sans_topout' },
    },
    monde_trame: {
        objectifLignes: 16,
        profilVitesse: [
            { a: 0, palier: 9 },
            { a: 0.35, palier: 11 },
            { a: 0.6, palier: 13 },
            { a: 0.85, palier: 14 },
        ],
        etoile2: { type: 'tetris', valeur: 2 },
        etoile3: { type: 'sans_topout' },
    },
    monde_paradoxe: {
        objectifLignes: 12,
        zen: true,
        profilVitesse: [{ a: 0, palier: 3 }],
        etoile2: null,
        etoile3: null,
    },
};
