const JOURNAL_ERREURS_CLE = 'derniereLigne_journalErreurs';
const JOURNAL_ERREURS_MAX = 10;

function genererSessionId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const sessionId =
    typeof sessionStorage !== 'undefined'
        ? (sessionStorage.getItem('derniereLigne_sessionId') ??
          (() => {
              const id = genererSessionId();
              sessionStorage.setItem('derniereLigne_sessionId', id);
              return id;
          })())
        : genererSessionId();

function modeDebugActif() {
    const meta = /** @type {ImportMeta & { env?: { DEV?: boolean } }} */ (import.meta);
    if (typeof import.meta !== 'undefined' && meta.env?.DEV) return true;
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('debug');
}

const DEBUG = typeof __NEO_PROD__ === 'undefined' ? modeDebugActif() : false;

function obtenirContexteLog() {
    if (typeof document === 'undefined') return '';
    const ecran = document.querySelector?.('.ecran.actif')?.id;
    return ecran ? `[${ecran}]` : '';
}

function formaterArgs(args) {
    const ctx = obtenirContexteLog();
    const prefixe = ctx ? [sessionId, ctx] : [sessionId];
    return [...prefixe, ...args];
}

function serialiserErreur(valeur) {
    if (valeur instanceof Error) {
        return {
            message: valeur.message,
            stack: valeur.stack,
            name: valeur.name,
        };
    }
    if (typeof valeur === 'object' && valeur !== null) {
        try {
            return JSON.parse(JSON.stringify(valeur));
        } catch {
            return String(valeur);
        }
    }
    return valeur;
}

function enregistrerErreurJournal(niveau, args) {
    if (typeof sessionStorage === 'undefined') return;
    try {
        const brut = sessionStorage.getItem(JOURNAL_ERREURS_CLE);
        const journal = brut ? JSON.parse(brut) : [];
        journal.push({
            niveau,
            sessionId,
            horodatage: new Date().toISOString(),
            ecran: obtenirContexteLog(),
            details: args.map(serialiserErreur),
        });
        sessionStorage.setItem(
            JOURNAL_ERREURS_CLE,
            JSON.stringify(journal.slice(-JOURNAL_ERREURS_MAX))
        );
    } catch {
        /* sessionStorage indisponible */
    }
}

export function obtenirJournalErreurs() {
    if (typeof sessionStorage === 'undefined') return [];
    try {
        const brut = sessionStorage.getItem(JOURNAL_ERREURS_CLE);
        return brut ? JSON.parse(brut) : [];
    } catch {
        return [];
    }
}

export function formaterRapportErreurs() {
    return JSON.stringify(
        {
            sessionId,
            horodatage: new Date().toISOString(),
            url: typeof window !== 'undefined' && window.location ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            journal: obtenirJournalErreurs(),
        },
        null,
        2
    );
}

export async function copierRapportErreurs() {
    const texte = formaterRapportErreurs();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texte);
        return true;
    }
    return false;
}

export const logger = {
    debug(...args) {
        if (DEBUG) console.debug('[DerniereLigne]', ...formaterArgs(args));
    },
    info(...args) {
        if (DEBUG) console.info('[DerniereLigne]', ...formaterArgs(args));
    },
    warn(...args) {
        console.warn('[DerniereLigne]', ...formaterArgs(args));
        enregistrerErreurJournal('warn', args);
    },
    error(...args) {
        console.error('[DerniereLigne]', ...formaterArgs(args));
        if (DEBUG) {
            const err = args.find((a) => a instanceof Error);
            if (err?.stack) console.error(err.stack);
        }
        enregistrerErreurJournal('error', args);
    },
};

export function afficherErreurUtilisateur(message) {
    const banniere = document.getElementById('banniere-erreur');
    if (!banniere) return;
    const texte = document.getElementById('banniere-erreur-texte');
    if (texte) texte.textContent = message;
    banniere.classList.add('visible');
}
