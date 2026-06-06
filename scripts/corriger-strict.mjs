/**
 * Migration checkJs : @param {*}, @type {any} et casts d'indexation uniquement.
 */
import { readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';

const RACINE = join(import.meta.dirname, '..');

/** @returns {{ file: string, line: number, code: string, message: string }[]} */
function lireErreursTypecheck() {
    const resultat = spawnSync(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['tsc', '--noEmit', '-p', 'jsconfig.json'],
        { cwd: RACINE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: true }
    );
    const sortie = `${resultat.stdout ?? ''}\n${resultat.stderr ?? ''}`;
    /** @type {{ file: string, line: number, code: string, message: string }[]} */
    const erreurs = [];
    for (const ligneBrute of sortie.split('\n')) {
        const ligne = ligneBrute.replace(/\r$/, '');
        const match = ligne.match(/^(js[\\/][^(]+)\((\d+),\d+\): error (TS\d+): (.+)$/);
        if (!match) continue;
        erreurs.push({
            file: match[1].replace(/\\/g, '/'),
            line: Number(match[2]),
            code: match[3],
            message: match[4],
        });
    }
    return erreurs;
}

/**
 * @param {string[]} lines
 * @param {number} lineIndex
 * @param {string} paramName
 */
function ajouterParamJsdoc(lines, lineIndex, paramName) {
    const tag = ` * @param {*} ${paramName}`;
    let i = lineIndex;
    while (i > 0 && lines[i - 1].trim() === '') i--;

    if (i > 0 && lines[i - 1].trim() === '*/') {
        let debut = i - 1;
        while (debut > 0 && !lines[debut].trim().startsWith('/**')) debut--;
        const bloc = lines.slice(debut, i).join('\n');
        if (
            bloc.includes(tag) ||
            bloc.match(new RegExp(`@param\\s+\\{[^}]*\\}\\s+${paramName}\\b`))
        ) {
            return false;
        }
        lines.splice(i, 0, tag);
        return true;
    }

    let insertAt = lineIndex;
    while (insertAt > 0) {
        const t = lines[insertAt - 1].trim();
        if (t.startsWith('/**') || t.startsWith('*') || t.startsWith('*/')) break;
        if (
            t.match(/^(export\s+)?(async\s+)?function\s/) ||
            t.match(/^(export\s+)?(const|let|var)\s+\w+\s*=/) ||
            t.includes(')=>') ||
            (t.includes('(') && !t.startsWith('//'))
        ) {
            break;
        }
        insertAt--;
    }

    const indent = (lines[insertAt].match(/^(\s*)/) ?? ['', ''])[1];
    lines.splice(
        insertAt,
        0,
        `${indent}/**`,
        `${indent} * @param {*} ${paramName}`,
        `${indent} */`
    );
    return true;
}

/**
 * @param {string[]} lines
 * @param {number} lineIndex
 */
function ajouterTypeAnyAvantLigne(lines, lineIndex) {
    const ligne = lines[lineIndex];
    const indent = (ligne.match(/^(\s*)/) ?? ['', ''])[1];
    if (lineIndex > 0 && lines[lineIndex - 1].includes('@type {any}')) return false;
    lines.splice(lineIndex, 0, `${indent}/** @type {any} */`);
    return true;
}

/**
 * @param {string[]} lines
 * @param {number} lineIndex
 */
function corrigerIndexation(lines, lineIndex) {
    const ligne = lines[lineIndex];
    const match = ligne.match(/^(\s*)(.*?)(\[[^\]]+\])(.*)$/);
    if (!match) return false;
    const [, indent, base, index, reste] = match;
    const baseTrim = base.trim();
    if (!baseTrim || baseTrim.includes('@type {any}')) return false;
    if (baseTrim.startsWith('(/** @type {any} */')) return false;
    lines[lineIndex] = `${indent}(/** @type {any} */ (${baseTrim}))${index}${reste}`;
    return true;
}

/** @param {string} cheminRelatif @param {{ file: string, line: number, code: string, message: string }[]} erreurs */
function appliquerCorrectionsFichier(cheminRelatif, erreurs) {
    const cheminAbs = join(RACINE, cheminRelatif);
    const lines = readFileSync(cheminAbs, 'utf8').split('\n');
    let modifie = false;

    const triees = [...erreurs].sort((a, b) => b.line - a.line);
    for (const err of triees) {
        const idx = err.line - 1;
        if (idx < 0 || idx >= lines.length) continue;

        if (err.code === 'TS7006') {
            const m = err.message.match(/Parameter '([^']+)' implicitly/);
            if (m && ajouterParamJsdoc(lines, idx, m[1])) modifie = true;
        } else if (err.code === 'TS7034' || err.code === 'TS7005' || err.code === 'TS7019') {
            if (ajouterTypeAnyAvantLigne(lines, idx)) modifie = true;
        }
    }

    if (modifie) writeFileSync(cheminAbs, lines.join('\n'), 'utf8');
    return modifie;
}

function main() {
    for (let passe = 1; passe <= 15; passe++) {
        const erreurs = lireErreursTypecheck();
        if (erreurs.length === 0) {
            console.log(`Typecheck OK après ${passe - 1} passe(s).`);
            return 0;
        }

        const parFichier = new Map();
        for (const err of erreurs) {
            if (!parFichier.has(err.file)) parFichier.set(err.file, []);
            parFichier.get(err.file).push(err);
        }

        let fichiersModifies = 0;
        for (const [fichier, errs] of parFichier) {
            if (appliquerCorrectionsFichier(fichier, errs)) fichiersModifies++;
        }

        console.log(
            `Passe ${passe}: ${erreurs.length} erreur(s), ${fichiersModifies} fichier(s) modifié(s).`
        );
        if (fichiersModifies === 0) break;
    }

    const restantes = lireErreursTypecheck();
    if (restantes.length === 0) return 0;

    console.error(`${restantes.length} erreur(s) restantes.`);
    for (const err of restantes.slice(0, 20)) {
        console.error(`${err.file}(${err.line}): ${err.code} ${err.message}`);
    }
    return 1;
}

process.exit(main());
