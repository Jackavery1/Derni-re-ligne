/**
 * Remplace les imports barrel config/config.js par des imports directs
 * (config-jeu.js, biomes.js, contenu-jeu.js).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';

const RACINE = process.cwd();

const VERS_CONFIG_JEU = new Set([
    'CONFIG',
    'LAYOUT',
    'TABLE_KICK_STANDARD',
    'TABLE_KICK_I',
    'TETROMINOS',
    'TOUCHES_DEFAUT',
]);
const VERS_BIOMES = new Set([
    'BIOMES',
    'ORDRE_BIOMES',
    'ORDRE_BIOMES_LIBRE',
    'chargerBiomesJeu',
    'biomesCharges',
    'BIOMES_HISTOIRE',
    'ORDRE_BIOMES_HISTOIRE',
]);
const VERS_CONTENU = new Set(['RELIQUES', 'METEO_BIOMES', 'chargerContenuJeu', 'contenuJeuCharge']);

const IMPORT_RE = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]*config\/config\.js)['"]\s*;/g;

function listerFichiers(dossier, ext) {
    /** @type {string[]} */
    const fichiers = [];
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, entree.name);
        if (entree.isDirectory()) {
            if (entree.name === 'node_modules' || entree.name === 'dist') continue;
            fichiers.push(...listerFichiers(chemin, ext));
        } else if (entree.name.endsWith(ext)) {
            fichiers.push(chemin);
        }
    }
    return fichiers;
}

/** @param {string} depuisFichier @param {string} cibleNom */
function cheminRelatifConfig(depuisFichier, cibleNom) {
    const dossierConfig = join(RACINE, 'js', 'config');
    const cible = join(dossierConfig, cibleNom);
    let rel = relative(dirname(depuisFichier), cible).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
}

/** @param {string} symbolesBruts */
function parserSymboles(symbolesBruts) {
    return symbolesBruts
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

/** @param {string} contenu @param {string} cheminFichier */
function migrerFichier(contenu, cheminFichier) {
    if (cheminFichier.replace(/\\/g, '/').endsWith('js/config/config.js')) {
        return contenu;
    }

    return contenu.replace(IMPORT_RE, (match, symbolesBruts) => {
        const symboles = parserSymboles(symbolesBruts);
        /** @type {Map<string, string[]>} */
        const parCible = new Map();

        for (const sym of symboles) {
            let cible = null;
            if (VERS_CONFIG_JEU.has(sym)) cible = 'config-jeu.js';
            else if (VERS_BIOMES.has(sym)) cible = 'biomes.js';
            else if (VERS_CONTENU.has(sym)) cible = 'contenu-jeu.js';
            else throw new Error(`${cheminFichier}: symbole inconnu « ${sym} »`);
            if (!parCible.has(cible)) parCible.set(cible, []);
            parCible.get(cible).push(sym);
        }

        const lignes = [...parCible.entries()].map(([cible, syms]) => {
            const rel = cheminRelatifConfig(cheminFichier, cible);
            return `import { ${syms.join(', ')} } from '${rel}';`;
        });
        return lignes.join('\n');
    });
}

const cibles = [
    ...listerFichiers(join(RACINE, 'js'), '.js'),
    ...listerFichiers(join(RACINE, 'tests'), '.mjs'),
];

let modifies = 0;
for (const chemin of cibles) {
    const avant = readFileSync(chemin, 'utf8');
    if (!avant.includes('config/config.js')) continue;
    const apres = migrerFichier(avant, chemin);
    if (apres !== avant) {
        writeFileSync(chemin, apres);
        modifies++;
        console.log(relative(RACINE, chemin));
    }
}

console.log(`\n${modifies} fichier(s) migré(s).`);
