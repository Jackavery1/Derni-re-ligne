/**
 * API de test E2E — exposée uniquement en dev local ou via ?neoTest=1.
 * Absente sur le déploiement public (GitHub Pages) sans paramètre explicite.
 */
export function estNeoTestAutorise() {
    if (typeof window === 'undefined') return false;
    const { hostname, search } = window.location;
    if (new URLSearchParams(search).has('neoTest')) return true;
    return hostname === '127.0.0.1' || hostname === 'localhost';
}

/**
 * @param {{
 *   terminerPartie?: (victoire: boolean, options?: { immediat?: boolean }) => void,
 *   demarrerPartieLibre?: (biomeId?: string) => void,
 *   boucleMenuUnifieActive?: () => boolean,
 *   simulerVictoireSprint?: () => void,
 *   obtenirColonnePieceActive?: () => number | null,
 *   obtenirMusiqueActive?: () => string | null,
 *   demarrerMondeHistoire?: (mondeId: string) => Promise<void>,
 *   declencherFinHistoire?: (finId: string) => Promise<void>,
 *   declencherPostMondeNarratif?: (mondeId: string) => Promise<void>,
 *   simulerVictoireMondeHistoire?: (mondeId: string, lignes?: number, sansNarratif?: boolean) => Promise<void>,
 *   simulerVictoireObjectifHistoire?: (mondeId: string, options?: { immediat?: boolean }) => Promise<void>,
 *   obtenirTypeFinHistoire?: () => Promise<string>,
 *   obtenirSceneCutsceneActive?: () => string | null,
 *   typewriterEstActif?: () => boolean,
 *   obtenirHumeurPortraitCutscene?: (personnageId?: string) => string | null,
 *   simulerTopVolontairePrologue?: () => Promise<void>,
 *   emettreEvenementBusJeu?: (evenement: string, payload?: unknown) => void,
 *   menuAnimActif?: () => boolean,
 *   simulerTickConditionTrameDistorsion?: (dtMs?: number) => Promise<{
 *     actionDistorsionFaite: boolean,
 *     persistee: boolean,
 *   }>,
 *   simulerGameOverBossDistorsion?: () => void | Promise<void>,
 *   terminerPartieCoop?: () => Promise<void>,
 *   basculerPauseCoop?: () => Promise<void>,
 *   obtenirGameFeel?: () => {
 *     areRestant: number,
 *     coyoteRestant: number,
 *     spawnGraceRestant: number,
 *     inputBuffer: string[],
 *   },
 *   bufferiserInputTest?: (
 *     action: 'tourner_cw' | 'tourner_ccw' | 'hold' | 'gauche' | 'droite' | 'bas' | 'chute'
 *   ) => void,
 *   tickGameFeel?: (deltaMs: number) => void,
 *   forcerAreTest?: () => void,
 *   pieceControlesActifsTest?: () => boolean,
 *   areActiveTest?: () => boolean,
 *   coyoteActifTest?: () => boolean,
 *   graceSpawnActiveTest?: () => boolean,
 *   activerPieceAuSolTest?: () => void,
 *   quitterSolPieceTest?: () => void,
 *   obtenirJournalSfxTest?: () => string[],
 *   viderJournalSfxTest?: () => void,
 *   evaluerPalierDifficultePrologue?: () => Promise<{
 *     debut: number,
 *     apres: number,
 *     palier1: number,
 *     palier2: number,
 *     palierCourant: number | null,
 *   }>,
 *   evaluerPalierDifficulteMonde?: (mondeId: string, lignes?: number) => Promise<{
 *     mondeId: string,
 *     palierInitial: number | null,
 *     palierApres: number | null,
 *     vitesseInit: number,
 *     vitesseApres: number,
 *   }>,
 *   evaluerRespirationDifficulteMonde?: (mondeId: string) => Promise<{
 *     mondeId: string,
 *     paliers: (number | null)[],
 *     amplitude: number,
 *     respiration: boolean,
 *   }>,
 *   obtenirDelaiPremierEvenementVivant?: (biomeId?: string) => Promise<{
 *     biomeId: string,
 *     delaiMs: number,
 *     frames60: number,
 *     delaiMinimumConfig: number,
 *   } | null>,
 *   obtenirExpressionBossCombat?: () => 'calme' | 'agressif' | 'vacillant',
 *   obtenirPvBossCombat?: () => { pv: number, pvMax: number, vaincu: boolean } | null,
 *   endommagerBossTest?: (nbLignes?: number) => 'calme' | 'agressif' | 'vacillant',
 * }} api
 */
export function exposerNeoTestApi(api) {
    if (!estNeoTestAutorise()) return;
    /** @type {Window & { __NEO_TEST__?: typeof api }} */ (window).__NEO_TEST__ = api;
}
