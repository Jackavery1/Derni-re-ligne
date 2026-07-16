import { readFileSync } from 'fs';
import { resolve, sep } from 'path';

const racineJs = resolve('js');

/**
 * Retire les appels `logger.debug(...)` / `logger.info(...)` du code source avant minify.
 * Les littéraux restent sinon dans le bundle malgré DEBUG=false en prod.
 * @param {string} code
 * @param {'debug' | 'info'} methode
 */
export function retirerAppelsLogger(code, methode) {
    const needle = `logger.${methode}(`;
    let out = '';
    let i = 0;
    while (i < code.length) {
        const idx = code.indexOf(needle, i);
        if (idx === -1) {
            out += code.slice(i);
            break;
        }
        if (idx > 0 && /[\w$]/.test(code[idx - 1])) {
            out += code.slice(i, idx + needle.length);
            i = idx + needle.length;
            continue;
        }
        out += code.slice(i, idx);
        let profondeur = 1;
        let j = idx + needle.length;
        /** @type {string | null} */
        let dansChaine = null;
        let echappe = false;
        while (j < code.length && profondeur > 0) {
            const c = code[j];
            if (dansChaine) {
                if (echappe) echappe = false;
                else if (c === '\\') echappe = true;
                else if (c === dansChaine) dansChaine = null;
            } else if (c === '"' || c === "'" || c === '`') {
                dansChaine = c;
            } else if (c === '(') profondeur += 1;
            else if (c === ')') profondeur -= 1;
            j += 1;
        }
        if (code[j] === ';') j += 1;
        i = j;
    }
    return out;
}

function estFichierSourceJs(chemin) {
    if (chemin === racineJs) return false;
    if (!chemin.startsWith(racineJs + sep)) return false;
    if (chemin.endsWith(`${sep}logger.js`)) return false;
    return true;
}

export function creerPluginStripLoggerDebug() {
    return {
        name: 'strip-logger-debug',
        setup(buildApi) {
            buildApi.onLoad({ filter: /\.js$/ }, (args) => {
                const chemin = resolve(args.path);
                if (!estFichierSourceJs(chemin)) return null;
                let code = readFileSync(chemin, 'utf8');
                code = retirerAppelsLogger(code, 'debug');
                code = retirerAppelsLogger(code, 'info');
                return { contents: code, loader: 'js' };
            });
        },
    };
}
