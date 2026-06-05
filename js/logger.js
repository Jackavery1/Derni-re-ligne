function modeDebugActif() {
    const meta = /** @type {ImportMeta & { env?: { DEV?: boolean } }} */ (import.meta);
    if (typeof import.meta !== 'undefined' && meta.env?.DEV) return true;
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('debug');
}

const DEBUG = modeDebugActif();

export const logger = {
    debug(...args) {
        if (DEBUG) console.debug('[TetrisNeo]', ...args);
    },
    info(...args) {
        if (DEBUG) console.info('[TetrisNeo]', ...args);
    },
    warn(...args) {
        console.warn('[TetrisNeo]', ...args);
    },
    error(...args) {
        console.error('[TetrisNeo]', ...args);
    },
};

export function afficherErreurUtilisateur(message) {
    const banniere = document.getElementById('banniere-erreur');
    if (!banniere) return;
    const texte = document.getElementById('banniere-erreur-texte');
    if (texte) texte.textContent = message;
    banniere.classList.add('visible');
}
