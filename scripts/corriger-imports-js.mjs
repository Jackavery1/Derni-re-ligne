/**
 * Corrige les imports relatifs .js après migration physique js/<domaine>/.
 * Usage : node scripts/corriger-imports-js.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join, normalize, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = join(racine, 'js');

/** @type {Map<string, string|null>} */
const parBasename = new Map();
/** @type {Map<string, string>} */
const parCheminJs = new Map();

function indexerJs(dir) {
    for (const entree of readdirSync(dir, { withFileTypes: true })) {
        const chemin = join(dir, entree.name);
        if (entree.isDirectory()) {
            indexerJs(chemin);
        } else if (entree.name.endsWith('.js')) {
            const relJs = relative(jsDir, chemin).split(sep).join('/');
            parCheminJs.set(relJs, chemin);
            const base = entree.name;
            if (!parBasename.has(base)) {
                parBasename.set(base, chemin);
            } else if (parBasename.get(base) !== chemin) {
                parBasename.set(base, null);
            }
        }
    }
}

indexerJs(jsDir);

function cheminRelatif(fromFile, cibleAbs) {
    let rel = relative(dirname(fromFile), cibleAbs).split(sep).join('/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
}

function resoudreCible(fromFile, spec) {
    if (!spec.startsWith('.')) return spec;

    const matchJs = spec.match(/^((?:\.\.\/)+)js\/(.+\.js)$/);
    if (matchJs) {
        const prefix = matchJs[1];
        const relJs = matchJs[2];
        let abs = parCheminJs.get(relJs);
        if (!abs) {
            const unique = parBasename.get(basename(relJs));
            if (unique) abs = unique;
        }
        if (!abs) return spec;
        const nouveauRel = relative(jsDir, abs).split(sep).join('/');
        return `${prefix}js/${nouveauRel}`;
    }

    const cibleDirecte = normalize(join(dirname(fromFile), spec));
    if (existsSync(cibleDirecte)) return spec;

    const base = basename(spec);
    const unique = parBasename.get(base);
    if (unique) return cheminRelatif(fromFile, unique);

    return spec;
}

const PATRON_IMPORT = /(?<=(?:from|import|vi\.mock)\s*(?:\(\s*)?)['"](\.\.?\/[^'"]+\.js)['"]/g;

function reecrireContenu(fichier, contenu) {
    return contenu.replace(PATRON_IMPORT, (match, spec) => {
        const nouveau = resoudreCible(fichier, spec);
        return match.replace(spec, nouveau);
    });
}

function listerFichiersProjet() {
    /** @type {string[]} */
    const fichiers = [];
    function parcourir(dir) {
        for (const entree of readdirSync(dir, { withFileTypes: true })) {
            const chemin = join(dir, entree.name);
            if (entree.isDirectory()) {
                if (['node_modules', 'dist', 'coverage', '.git'].includes(entree.name)) continue;
                parcourir(chemin);
            } else if (/\.(js|mjs|html|ts|cjs)$/.test(entree.name)) {
                fichiers.push(chemin);
            }
        }
    }
    parcourir(racine);
    return fichiers;
}

let modifies = 0;
for (const fichier of listerFichiersProjet()) {
    const original = readFileSync(fichier, 'utf8');
    const misAJour = reecrireContenu(fichier, original);
    if (misAJour !== original) {
        writeFileSync(fichier, misAJour, 'utf8');
        modifies++;
    }
}

console.log(`Imports corrigés dans ${modifies} fichiers`);
