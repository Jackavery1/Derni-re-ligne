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
 * @param {NonNullable<Window['__NEO_TEST__']>} api
 */
export function exposerNeoTestApi(api) {
    if (!estNeoTestAutorise()) return;
    window.__NEO_TEST__ = api;
}
