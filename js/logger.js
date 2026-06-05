function modeDebugActif() {
    const meta = /** @type {ImportMeta & { env?: { DEV?: boolean } }} */ (import.meta);
    if (typeof import.meta !== 'undefined' && meta.env?.DEV) return true;
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('debug');
}

const DEBUG = modeDebugActif();

function obtenirContexteLog() {
    if (typeof document === 'undefined') return '';
    const ecran = document.querySelector('.ecran.actif')?.id;
    return ecran ? `[${ecran}]` : '';
}

function formaterArgs(args) {
    const ctx = obtenirContexteLog();
    return ctx ? [ctx, ...args] : args;
}

export const logger = {
    debug(...args) {
        if (DEBUG) console.debug('[TetrisNeo]', ...formaterArgs(args));
    },
    info(...args) {
        if (DEBUG) console.info('[TetrisNeo]', ...formaterArgs(args));
    },
    warn(...args) {
        console.warn('[TetrisNeo]', ...formaterArgs(args));
    },
    error(...args) {
        console.error('[TetrisNeo]', ...formaterArgs(args));
    },
};

export function afficherErreurUtilisateur(message) {
    const banniere = document.getElementById('banniere-erreur');
    if (!banniere) return;
    const texte = document.getElementById('banniere-erreur-texte');
    if (texte) texte.textContent = message;
    banniere.classList.add('visible');
}
