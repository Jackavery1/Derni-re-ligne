import { NIVEAUX_ARCHI } from './archi-donnees.js';

/** Gabarits procéduraux — puzzles supplémentaires après les niveaux manuels. */
/** @type {import('./archi-donnees.js').NiveauArchi[]} */
const MODELES_PROCEDURAUX = [
    {
        id: 'ligne',
        nom: 'LIGNE PROC.',
        biome: 'classique',
        difficulte: 1,
        parPieces: 2,
        deblocage: 150,
        silhouette: ['....####..', '....####..'],
        pieces: [
            { type: 'I', qte: 1 },
            { type: 'O', qte: 1 },
        ],
    },
    {
        id: 'escalier',
        nom: 'ESCALIER PROC.',
        biome: 'lave',
        difficulte: 1,
        parPieces: 3,
        deblocage: 250,
        silhouette: ['......##..', '....##....', '..##......'],
        pieces: [
            { type: 'L', qte: 2 },
            { type: 'J', qte: 1 },
        ],
    },
    {
        id: 't_proc',
        nom: 'T PROC.',
        biome: 'ocean',
        difficulte: 1,
        parPieces: 2,
        deblocage: 350,
        silhouette: ['....##....', '..######..', '....##....'],
        pieces: [{ type: 'T', qte: 2 }],
    },
    {
        id: 'zigzag',
        nom: 'ZIGZAG PROC.',
        biome: 'foret',
        difficulte: 2,
        parPieces: 4,
        deblocage: 450,
        silhouette: ['..##......', '....##....', '......##..', '........##'],
        pieces: [
            { type: 'S', qte: 2 },
            { type: 'Z', qte: 2 },
        ],
    },
    {
        id: 'colonne',
        nom: 'COLONNE PROC.',
        biome: 'glace',
        difficulte: 2,
        parPieces: 3,
        deblocage: 550,
        silhouette: ['....##....', '....##....', '....##....', '....##....'],
        pieces: [
            { type: 'I', qte: 2 },
            { type: 'O', qte: 1 },
        ],
    },
    {
        id: 'pont',
        nom: 'PONT PROC.',
        biome: 'desert',
        difficulte: 2,
        parPieces: 4,
        deblocage: 650,
        silhouette: ['##......##', '..######..', '..######..', '##......##'],
        pieces: [
            { type: 'I', qte: 2 },
            { type: 'T', qte: 2 },
        ],
    },
    {
        id: 'double',
        nom: 'DOUBLE PROC.',
        biome: 'cyber',
        difficulte: 2,
        parPieces: 4,
        deblocage: 750,
        silhouette: ['..####....', '..####....', '....####..', '....####..'],
        pieces: [
            { type: 'O', qte: 2 },
            { type: 'I', qte: 1 },
        ],
    },
    {
        id: 'croix_proc',
        nom: 'CROIX PROC.',
        biome: 'fuochi',
        difficulte: 3,
        parPieces: 5,
        deblocage: 850,
        silhouette: ['....##....', '..######..', '########..', '..######..', '....##....'],
        pieces: [
            { type: 'T', qte: 2 },
            { type: 'I', qte: 2 },
            { type: 'O', qte: 1 },
        ],
    },
    {
        id: 'spirale',
        nom: 'SPIRALE PROC.',
        biome: 'cosmos',
        difficulte: 3,
        parPieces: 6,
        deblocage: 950,
        silhouette: [
            '......##..',
            '....##....',
            '..##......',
            '##........',
            '..##......',
            '....##....',
        ],
        pieces: [
            { type: 'L', qte: 2 },
            { type: 'J', qte: 2 },
            { type: 'S', qte: 1 },
            { type: 'Z', qte: 1 },
        ],
    },
    {
        id: 'couronne',
        nom: 'COURONNE PROC.',
        biome: 'classique',
        difficulte: 3,
        parPieces: 6,
        deblocage: 1100,
        silhouette: ['..######..', '.########.', '########..', '.########.', '..######..'],
        pieces: [
            { type: 'O', qte: 2 },
            { type: 'T', qte: 2 },
            { type: 'I', qte: 2 },
        ],
    },
];

/** @returns {import('./archi-donnees.js').NiveauArchi[]} */
export function obtenirNiveauxArchiProceduraux() {
    return MODELES_PROCEDURAUX.map((m) => ({
        id: `proc_${m.id}`,
        nom: m.nom,
        biome: m.biome,
        difficulte: /** @type {1 | 2 | 3} */ (m.difficulte),
        parPieces: m.parPieces,
        deblocage: m.deblocage,
        silhouette: m.silhouette,
        pieces: m.pieces,
    }));
}

/** @returns {import('./archi-donnees.js').NiveauArchi[]} */
export function obtenirTousNiveauxArchi() {
    return [...NIVEAUX_ARCHI, ...obtenirNiveauxArchiProceduraux()];
}
