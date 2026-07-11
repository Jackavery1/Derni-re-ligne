/**
 * Vague 2 — migration des modules transverses js/*.js → js/<domaine>/
 * Usage : node scripts/archive/migrer-js-transverses.mjs [--dry-run]
 */
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, join, normalize, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jsDir = join(racine, 'js');
const dryRun = process.argv.includes('--dry-run');

/** Barrels, entrées et données — restent à la racine js/ (vague 3 : voir scripts/archive/migrer-js-racine-vague3.mjs) */
const RESTER_RACINE = new Set([
    'main.js',
    'moteur.js',
    'neo-test-api.js',
    'neo-test-init.js',
    'logger.js',
    'types.js',
    'histoire-textes.js',
    'histoire-textes.fallback.js',
    'histoire-textes.fallback.stub.js',
    'histoire-donnees.js',
    'archi-donnees.js',
    'codex-donnees.js',
    'achievements-donnees.js',
    'achievements.js',
    'codex.js',
]);

const DOMAINES = [
    {
        dossier: 'rendu',
        re: /^(portraits-|expressions-cutscene|scenes-cutscene|fin-bg-rendu|fond-ecrans-meta|particules-jeu|biome-fond|boss-rendu|coop-rendu|constellation-rendu|archi-rendu|archi-apercu|profil-rendu|themes-biome|icones-pixel|boss-ui-hud)/,
    },
    {
        dossier: 'histoire',
        re: /^(mecaniques-histoire|fins-histoire|file-narrative|monde-paradoxe|conditions-secrets|reinitialiser-campagne|preferences-campagne|menu-titre-campagne|reactions-boss-portrait|boss-dialogues|histoire-donnees-chargement|codex-histoire)/,
    },
    {
        dossier: 'ui',
        re: /^(options-|profil-affichage|profil-jeu|tutoriel|deblocage-ui|annonces|notifications-file|ecran-chargement|accessibilite|charger-feuille-style)/,
    },
    { dossier: 'achievements', re: /^achievements-/ },
    { dossier: 'codex', re: /^codex-/ },
    { dossier: 'io', re: /^(leaderboard-cloud|difficulte-mondes-chargement|prechargement-medias)/ },
    {
        dossier: 'logique',
        re: /^(coop-|archi-|boss-jeu|constellation|gestionnaire-difficulte|effets-partie|defi-jour|mode-defi-jour|mode-sprint|mode-dev-etat|mode-developpeur|input-|touches-config|controles-tactiles|actions-jeu|moteur-config-actions|timer-niveau|reliques|texte-jeu|viewport-dimensions|safe-area|partie-canvas|partie-fin|dom-utils)/,
    },
];

/** @type {Map<string, string>} */
const deplacements = new Map();

function domainePourFichier(nom) {
    if (RESTER_RACINE.has(nom)) return null;
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

console.log(`${dryRun ? '[dry-run] ' : ''}${deplacements.size} modules transverses à déplacer`);
for (const [, nouveau] of deplacements) {
    console.log(`  → ${relative(jsDir, nouveau)}`);
}

if (!dryRun && deplacements.size > 0) {
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
    console.log(
        'Migration vague 2 terminée — lancez node scripts/corriger-imports-js.mjs && npm run sync:sw && npm test'
    );
}
