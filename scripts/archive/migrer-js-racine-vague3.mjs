/**
 * Vague 3 — migration des modules encore à la racine js/*.js → js/<domaine>/
 * Usage : node scripts/archive/migrer-js-racine-vague3.mjs [--dry-run]
 */
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, join, normalize, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jsDir = join(racine, 'js');
const dryRun = process.argv.includes('--dry-run');

/** @type {Map<string, string>} ancien abs → nouveau abs */
const deplacements = new Map([
    ['partie.js', 'logique/partie.js'],
    ['boucle-jeu.js', 'logique/boucle-jeu.js'],
    ['planificateur-raf.js', 'logique/planificateur-raf.js'],
    ['modes-input-lazy.js', 'logique/modes-input-lazy.js'],
    ['dev-init.js', 'logique/dev-init.js'],
    ['menu-fond.js', 'rendu/menu-fond.js'],
    ['biome-icones-map.js', 'rendu/biome-icones-map.js'],
    ['archi-icones-map.js', 'rendu/archi-icones-map.js'],
    ['chargement-watchdog.js', 'ui/chargement-watchdog.js'],
    ['profil-donnees.js', 'ui/profil-donnees.js'],
    ['sw-dev.js', 'io/sw-dev.js'],
    ['codex-conditions.js', 'codex/codex-conditions.js'],
    ['codex-icones-map.js', 'codex/codex-icones-map.js'],
    ['achievements-icones-map.js', 'achievements/achievements-icones-map.js'],
    ['moteur-init-systemes.js', 'moteur/moteur-init-systemes.js'],
    ['moteur-init-interface.js', 'moteur/moteur-init-interface.js'],
    ['moteur-init-test-api.js', 'moteur/moteur-init-test-api.js'],
]);

/** @type {Map<string, string>} */
const deplacementsAbs = new Map();
for (const [ancien, nouveau] of deplacements) {
    deplacementsAbs.set(join(jsDir, ancien), join(jsDir, nouveau));
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
            } else if (/\.(js|mjs|html|json)$/.test(entree.name)) {
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
        const nouveau = deplacementsAbs.get(ancien);
        if (nouveau) {
            return `${matchJs[1]}js/${relative(jsDir, nouveau).split(sep).join('/')}`;
        }
        return spec;
    }

    const cibleAbs = normalize(join(dirname(fromFile), spec));
    const nouveau = deplacementsAbs.get(cibleAbs);
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

console.log(`${dryRun ? '[dry-run] ' : ''}${deplacementsAbs.size} modules racine à déplacer`);
for (const [, nouveau] of deplacementsAbs) {
    console.log(`  → ${relative(jsDir, nouveau)}`);
}

if (!dryRun) {
    for (const [, nouveau] of deplacementsAbs) {
        mkdirSync(dirname(nouveau), { recursive: true });
    }
    for (const [ancien, nouveau] of deplacementsAbs) {
        renameSync(ancien, nouveau);
    }
    for (const fichier of listerFichiersProjet()) {
        const original = readFileSync(fichier, 'utf8');
        const misAJour = reecrireImports(fichier, original);
        if (misAJour !== original) writeFileSync(fichier, misAJour, 'utf8');
    }
    console.log(
        'Migration vague 3 terminée — lancez node scripts/corriger-imports-js.mjs && npm run sync:sw && npm test'
    );
}
