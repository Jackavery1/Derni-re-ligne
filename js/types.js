/**
 * @typedef {Object} PieceJeu
 * @property {string} type
 * @property {number} rotation
 * @property {number} x
 * @property {number} y
 * @property {number[][]} [reliqueForme]
 * @property {object} [reliqueData]
 * @property {'j1' | 'j2'} [joueur]
 */

/**
 * @typedef {Object} EtatPartie
 * @property {number[][]} plateau
 * @property {PieceJeu | null} pieceActuelle
 * @property {PieceJeu[]} filePieces
 * @property {PieceJeu | null} pieceEnReserve
 * @property {boolean} reserveUtilisee
 * @property {number} score
 * @property {number} lignes
 * @property {number} niveau
 * @property {boolean} estEnCours
 * @property {boolean} estEnPause
 * @property {number} combo
 * @property {boolean} dernierEtaitTetris
 */

/**
 * @typedef {Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }} WindowEtendu
 */

export {};
