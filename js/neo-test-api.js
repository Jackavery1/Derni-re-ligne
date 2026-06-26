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
 *   declencherFinHistoire?: (finId: string) => Promise<void>,
 *   declencherPostMondeNarratif?: (mondeId: string) => Promise<void>,
 *   simulerVictoireMondeHistoire?: (mondeId: string, lignes?: number, sansNarratif?: boolean) => Promise<void>,
 *   obtenirTypeFinHistoire?: () => Promise<string>,
 *   obtenirSceneCutsceneActive?: () => string | null,
 *   obtenirHumeurPortraitCutscene?: () => string | null,
 *   simulerTopVolontairePrologue?: () => Promise<void>
 *   injecterConditionsTrameDistorsion?: () => void
 *   emettreEvenementBusJeu?: (evenement: string, payload?: unknown) => void
 *   menuAnimActif?: () => boolean
 *   simulerGameOverBossDistorsion?: () => void
 * }} api
 */
export function exposerNeoTestApi(api) {
    if (!estNeoTestAutorise()) return;
    /** @type {Window & { __NEO_TEST__?: typeof api }} */ (window).__NEO_TEST__ = api;
}
