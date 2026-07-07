/**
 * Migration physique js/ → js/<domaine>/ selon docs/domaines.md
 * Usage : node scripts/migrer-js-domaines.mjs [--dry-run]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { basename, dirname, join, normalize, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = join(racine, 'js');
const dryRun = process.argv.includes('--dry-run');

const DOMAINES = [
    { dossier: 'config', re: /^(config|biomes|contenu-jeu)/ },
    { dossier: 'etat', re: /^(store-|mode-histoire|bus-jeu|registre-modes)/ },
    { dossier: 'io', re: /^(progression|charger-histoire)/ },
    { dossier: 'audio', re: /^(audio|haptique|melodie)/ },
    {
        dossier: 'logique',
        re: /^(logique-|piece-jeu|score-partie|moteur-piece|archi-logique|coop-logique|boss-combat|boss-attaques|actions-piece|vivant|oracle-|buffer-input|game-feel|coop-game-feel|coop-lignes|meteo)/,
    },
    { dossier: 'rendu', re: /^(rendu-|decorations|hud-|portrait-|layout-calcul|layout-jeu)/ },
    { dossier: 'ui', re: /^(ui-|navigation|ecrans-|charger-ecrans|mascotte|infobulles)/ },
    { dossier: 'histoire', re: /^histoire-(?!textes|donnees)/ },
];

/** @type {Map<string, string>} */
const deplacements = new Map();

function domainePourFichier(nom) {
    for (const { dossier, re } of DOMAINES) {
        if (re.test(nom)) return dossier;
    }
    return null;
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
            } else if (/\.(js|mjs|html)$/.test(entree.name)) {
                fichiers.push(chemin);
            }
        }
    }
    parcourir(racine);
    return fichiers;
}

function resoudreImportSpec(fromFile, spec) {
    if (!spec.startsWith('.')) return spec;

    const matchJs = spec.match(/^((?:\.\.\/)+)js\/(.+\.js)$/);
    if (matchJs) {
        const ancien = join(jsDir, matchJs[2]);
        const nouveau = deplacements.get(ancien);
        if (nouveau) {
            return `${matchJs[1]}js/${relative(jsDir, nouveau).split(sep).join('/')}`;
        }
        return spec;
    }

    const cibleAbs = normalize(join(dirname(fromFile), spec));
    const nouveau = deplacements.get(cibleAbs);
    if (!nouveau) return spec;
    let rel = relative(dirname(fromFile), nouveau).split(sep).join('/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
}

function reecrireImports(fichier, contenu) {
    return contenu.replace(/from\s+['"](\.\.?\/[^'"]+\.js)['"]/g, (match, spec) => {
        const nouveau = resoudreImportSpec(fichier, spec);
        return match.replace(spec, nouveau);
    });
}

for (const nom of readdirSync(jsDir).filter((f) => f.endsWith('.js'))) {
    const domaine = domainePourFichier(nom);
    if (!domaine) continue;
    deplacements.set(join(jsDir, nom), join(jsDir, domaine, nom));
}

console.log(`${dryRun ? '[dry-run] ' : ''}${deplacements.size} modules à déplacer`);

if (!dryRun) {
    for (const [, nouveau] of deplacements) {
        mkdirSync(dirname(nouveau), { recursive: true });
    }
    for (const [ancien, nouveau] of deplacements) {
        renameSync(ancien, nouveau);
    }
    for (const fichier of listerFichiersProjet()) {
        const original = readFileSync(fichier, 'utf8');
        const misAJour = reecrireImports(fichier, original);
        if (misAJour !== original) writeFileSync(fichier, misAJour, 'utf8');
    }
    console.log('Migration terminée — lancez npm run sync:sw && npm test');
}
