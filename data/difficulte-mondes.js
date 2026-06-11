/** Échelle unique : ms par descente d'une cellule (cohérente avec CONFIG : 900 ms = très lent). */
export const PALIERS_VITESSE_MS = {
    1: 800,
    2: 720,
    3: 650,
    4: 580,
    5: 520,
    6: 460,
    7: 410,
    8: 360,
    9: 320,
    10: 280,
    11: 250,
    12: 220,
    13: 200,
    14: 180,
};

/** Plancher de la vitesse EFFECTIVE après tous modificateurs (éclipse, Surtension). */
export const VITESSE_PLANCHER_MS = 110;

/**
 * profilVitesse : vagues { a: fraction objectif, palier: n } — le palier peut monter ou descendre.
 * Boss : phasePaliers[i] → phase i+1. objectifLignes = SEUILS_COMPLETION existants.
 */
export const DIFFICULTE_MONDES = {
    monde_prologue: {
        objectifLignes: 8,
        profilVitesse: [
            { a: 0, palier: 1 },
            { a: 0.5, palier: 2 },
        ],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'tops_volontaires', valeur: 3 },
    },
    monde_lave: {
        objectifLignes: 10,
        profilVitesse: [
            { a: 0, palier: 3 },
            { a: 0.3, palier: 5 },
            { a: 0.6, palier: 3 },
            { a: 0.8, palier: 6 },
        ],
        etoile2: { type: 'combo', valeur: 3 },
        etoile3: { type: 'tetris', valeur: 1 },
    },
    monde_rouille: {
        objectifLignes: 9,
        profilVitesse: [
            { a: 0, palier: 3 },
            { a: 0.45, palier: 5 },
            { a: 0.8, palier: 4 },
        ],
        etoile2: { type: 'pieces_max', valeur: 45 },
        etoile3: { type: 'combo', valeur: 4 },
    },
    monde_boss_1: {
        boss: true,
        phasePaliers: [4, 5, 6],
        etoile2: { type: 'sans_topout' },
        etoile3: { type: 'sans_continue' },
    },
    monde_ocean: {
        objectifLignes: 10,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.35, palier: 6 },
            { a: 0.65, palier: 4 },
            { a: 0.85, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'pieces_max', valeur: 48 },
    },
    monde_foret: {
        objectifLignes: 10,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.4, palier: 6 },
            { a: 0.8, palier: 7 },
        ],
        etoile2: { type: 'combo', valeur: 4 },
        etoile3: { type: 'tetris', valeur: 2 },
    },
    monde_glace: {
        objectifLignes: 10,
        profilVitesse: [
            { a: 0, palier: 6 },
            { a: 0.4, palier: 4 },
            { a: 0.7, palier: 7 },
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
        objectifLignes: 11,
        profilVitesse: [
            { a: 0, palier: 5 },
            { a: 0.3, palier: 6 },
            { a: 0.55, palier: 7 },
            { a: 0.8, palier: 8 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'pieces_max', valeur: 52 },
    },
    monde_eclipse: {
        objectifLignes: 10,
        profilVitesse: [
            { a: 0, palier: 5 },
            { a: 0.25, palier: 8 },
            { a: 0.5, palier: 5 },
            { a: 0.75, palier: 8 },
        ],
        etoile2: { type: 'combo', valeur: 4 },
        etoile3: { type: 'tetris', valeur: 2 },
    },
    monde_cyber: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 6 },
            { a: 0.3, palier: 9 },
            { a: 0.5, palier: 6 },
            { a: 0.7, palier: 10 },
            { a: 0.9, palier: 7 },
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
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.25, palier: 6 },
            { a: 0.45, palier: 4 },
            { a: 0.65, palier: 7 },
            { a: 0.85, palier: 5 },
        ],
        etoile2: { type: 'combo', valeur: 5 },
        etoile3: { type: 'tetris', valeur: 2 },
    },
    monde_cosmos: {
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 4 },
            { a: 0.35, palier: 6 },
            { a: 0.55, palier: 4 },
            { a: 0.75, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'pieces_max', valeur: 55 },
    },
    monde_vide: {
        objectifLignes: 9,
        profilVitesse: [
            { a: 0, palier: 5 },
            { a: 0.4, palier: 7 },
            { a: 0.7, palier: 5 },
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
        objectifLignes: 12,
        profilVitesse: [
            { a: 0, palier: 11 },
            { a: 0.4, palier: 9 },
            { a: 0.75, palier: 7 },
        ],
        etoile2: { type: 'tetris', valeur: 1 },
        etoile3: { type: 'sans_topout' },
    },
    monde_trame: {
        objectifLignes: 14,
        profilVitesse: [
            { a: 0, palier: 9 },
            { a: 0.3, palier: 11 },
            { a: 0.55, palier: 13 },
            { a: 0.8, palier: 14 },
        ],
        etoile2: { type: 'tetris', valeur: 2 },
        etoile3: { type: 'sans_topout' },
    },
    monde_paradoxe: {
        objectifLignes: 10,
        zen: true,
        profilVitesse: [{ a: 0, palier: 3 }],
        etoile2: null,
        etoile3: null,
    },
};
