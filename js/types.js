/**
 * @typedef {Object} StatsGlobales
 * @property {number} lignesTotal
 * @property {number} meilleurScore
 * @property {number} meilleurTemps
 * @property {number} maxLignesUnCoup
 * @property {number} maxCombo
 * @property {Set<string>} biomesJoues
 * @property {Record<string, number>} meilleurTempsParBiome
 * @property {Record<string, number>} lignesParBiome
 * @property {number} reliquesUtilisees
 * @property {Set<string>} typesReliquesUtilises
 * @property {number} meteosSubies
 * @property {Set<string>} meteosPartieActuelle
 * @property {number} reactionsRobo
 * @property {number} maxNotesComposition
 * @property {number} nbAchievementsDebloques
 * @property {Set<string>} debloques
 * @property {number} [oracleDeviationsPartieActuelle]
 * @property {number} [oracleMeilleuresMult]
 * @property {number} [lignesCoopTotal]
 * @property {number} [coopMaxLignesUnCoup]
 * @property {Set<string>} [archiNiveauxCompletes]
 * @property {number} [archiEtoilesMax]
 * @property {number} [archiPrecisionMax]
 * @property {number} [archiParAtteint]
 * @property {number} [evenementsVivantSubis]
 * @property {number} [maxEvenementsUnePartie]
 * @property {Set<string>} [biomesVivantSubis]
 * @property {number} [lignesPendantVivant]
 */

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
