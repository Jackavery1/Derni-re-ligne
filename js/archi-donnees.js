/** Barrel niveaux Architecte — runtime via data/archi-niveaux.json. */
/** @typedef {{ id: string, nom: string, biome: string, difficulte: 1|2|3, parPieces: number, silhouette: string[], pieces: { type: string, qte: number }[], deblocage: number }} NiveauArchi */

import { NIVEAUX_ARCHI_NATURE } from './archi-donnees/niveaux-nature.js';
import { NIVEAUX_ARCHI_EXTREMES } from './archi-donnees/niveaux-extremes.js';

/** @type {NiveauArchi[]} */
export const NIVEAUX_ARCHI = [...NIVEAUX_ARCHI_NATURE, ...NIVEAUX_ARCHI_EXTREMES];
