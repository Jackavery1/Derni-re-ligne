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
 * @property {Set<string>} meteosVues
 * @property {number} reactionsRobo
 * @property {number} maxNotesComposition
 * @property {number} nbAchievementsDebloques
 * @property {Record<string, boolean>} debloqués
 * @property {string[]} decorationsActives
 * @property {number} oraclePartiesJouees
 * @property {number} oracleMeilleuresMult
 * @property {number} oracleTotalDeviations
 * @property {number} oracleDeviationsPartieActuelle
 * @property {number} lignesCoopTotal
 * @property {number} coopMaxLignesUnCoup
 * @property {number} archiScoreTotal
 * @property {Set<string>} archiNiveauxCompletes
 * @property {number} archiEtoilesMax
 * @property {Record<string, number>} archiEtoilesParNiveau
 * @property {number} archiPrecisionMax
 * @property {number} archiParAtteint
 * @property {number} evenementsVivantSubis
 * @property {number} maxEvenementsUnePartie
 * @property {Set<string>} biomesVivantSubis
 * @property {number} lignesPendantVivant
 * @property {string[]} bossHistoireVaincus
 * @property {string[]} journauxHistoire
 * @property {string[]} toutesFinHistoire
 * @property {string[]} mondesHistoireCompletes
 * @property {string[]} mondesCachesDebloques
 */

/**
 * @typedef {Object} PieceJeu
 * @property {string} type
 * @property {number} rotation
 * @property {number} [x]
 * @property {number} [y]
 * @property {number[][]} [reliqueForme]
 * @property {object} [reliqueData]
 * @property {'j1' | 'j2'} [joueur]
 */

/**
 * @typedef {Object} EtatPartie
 * @property {(number | string)[][]} plateau
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
 * @property {string} humeur
 * @property {number | null} tempsDebut
 * @property {number} tempsPauseAccumule
 * @property {number | null} tempsPauseDebut
 * @property {string} modeJeu
 * @property {boolean} victoireSprint
 * @property {number} [compteurEvenementsPartie]
 */

/**
 * @typedef {Object} Particule
 * @property {string} [type]
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [vx]
 * @property {number} [vy]
 * @property {number} [opacite]
 * @property {number | string} [couleur]
 * @property {number} [rotation]
 * @property {number} [vRot]
 * @property {number} [taille]
 * @property {boolean} [trainee]
 * @property {number} [hauteur]
 * @property {number} [longueur]
 * @property {boolean} [actif]
 * @property {number} [age]
 * @property {number} [sinPhase]
 * @property {number} [scintille]
 * @property {string} [char]
 * @property {number} [dureeVie]
 * @property {number} [duree]
 * @property {number} [timer]
 */

/**
 * @typedef {Object} TexteFlottant
 * @property {string} texte
 * @property {number} x
 * @property {number} y
 * @property {string} couleur
 * @property {number} opacite
 * @property {number} vy
 * @property {number} taille
 * @property {boolean} arcEnCiel
 * @property {number} age
 * @property {number} duree
 */

/**
 * @typedef {Object} StoreJeu
 * @property {string} biomeActif
 * @property {number} niveauGlobal
 * @property {number} compteurPieces
 * @property {number} seuilProchRelique
 * @property {boolean} reliqueEnAttente
 * @property {string | null} reliqueActive
 * @property {string} ecranActuel
 * @property {number} transitionAlpha
 * @property {number} transitionDebut
 * @property {number} tempsAmbianceDecor
 * @property {number[]} couleurAmbRgb
 * @property {number} derniereSecondeTemps
 * @property {string[]} sacPieces
 * @property {number} lockDelayRestant
 * @property {number} nbLockResets
 * @property {boolean} pieceAuSol
 * @property {Record<string, { moment: number, repete: boolean }>} dasEtat
 * @property {boolean} prefererMoinsAnimations
 * @property {number} fpsMoyen
 * @property {boolean} effetsReduits
 * @property {number | null} idFrame
 * @property {boolean} boucleActive
 * @property {HTMLCanvasElement | null} canvasPlateau
 * @property {CanvasRenderingContext2D | null} ctx
 * @property {HTMLCanvasElement | null} canvasPreview
 * @property {CanvasRenderingContext2D | null} ctxPreview
 * @property {HTMLCanvasElement | null} canvasReserve
 * @property {CanvasRenderingContext2D | null} ctxReserve
 * @property {{ x: number, y: number } | null} touchDepart
 * @property {number} dernierTimestamp
 * @property {number} accumulateur
 * @property {EtatPartie} etat
 * @property {Particule[]} particules
 * @property {Particule[]} particulesAmbiance
 * @property {TexteFlottant[]} textesFlottants
 * @property {{ timer: number, intensite: number, duree: number }} secousse
 * @property {{ cellules: { x: number, y: number }[], timer: number, duree: number }} flashVerrou
 * @property {{ lignes: number[], timer: number, duree: number }} flashLignes
 * @property {Record<string, boolean>} touchesActives
 * @property {ReturnType<import('./store-histoire.js').creerEtatHistoireRuntime>} histoire
 */

/**
 * @typedef {Window & typeof globalThis & {
 *   webkitAudioContext?: typeof AudioContext,
 *   __NEO_SILENT_NOTIFS__?: boolean,
 *   __NEO_TEST__?: {
 *     terminerPartie?: (victoire: boolean, options?: { immediat?: boolean }) => void,
 *     demarrerPartieLibre?: (biomeId?: string) => void,
 *     boucleMenuUnifieActive?: () => boolean,
 *     simulerVictoireSprint?: () => void,
 *     obtenirColonnePieceActive?: () => number | null,
 *     obtenirMusiqueActive?: () => string | null
 *   }
 * }} WindowEtendu
 */

export {};
