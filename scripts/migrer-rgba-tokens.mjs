/**
 * Migre les rgba() littéraux vers des tokens CSS dans variables.css.
 * Usage : node scripts/migrer-rgba-tokens.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = join(racine, 'styles');
const cutscenesDir = join(racine, 'assets', 'cutscenes');
const variablesPath = join(stylesDir, 'variables.css');

const EXCLUS = new Set(['variables.css', 'dev.css', 'cutscenes.css']);
const RGBA_RE = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g;

/** @param {string} r @param {string} g @param {string} b @param {string} a */
function nomToken(r, g, b, a) {
    const aNorm = a.replace('.', '-');
    return `--rgba-${r}-${g}-${b}-${aNorm}`;
}

/** @param {string} dir @param {string} [prefix] */
function listerCss(dir, prefix = '') {
    /** @type {{ chemin: string, rel: string }[]} */
    const fichiers = [];
    for (const nom of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
        if (EXCLUS.has(nom)) continue;
        fichiers.push({ chemin: join(dir, nom), rel: `${prefix}${nom}` });
    }
    return fichiers;
}

const cibles = [...listerCss(stylesDir), ...listerCss(cutscenesDir, 'assets/cutscenes/')];

/** @type {Map<string, string>} rgba literal → token name */
const tokens = new Map();

for (const { chemin } of cibles) {
    const css = readFileSync(chemin, 'utf8');
    for (const m of css.matchAll(RGBA_RE)) {
        const literal = m[0];
        if (!tokens.has(literal)) {
            tokens.set(literal, nomToken(m[1], m[2], m[3], m[4]));
        }
    }
}

let variables = readFileSync(variablesPath, 'utf8');
const marqueur = '    /* --- Tokens rgba (migrés) --- */';
if (!variables.includes(marqueur)) {
    let tokensRgbaPath = join(stylesDir, 'tokens-rgba.css');
    let tokensRgba = readFileSync(tokensRgbaPath, 'utf8');
    const lignesTokens = [...tokens.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([literal, token]) => `    ${token}: ${literal};`)
        .join('\n');
    if (!tokensRgba.includes(':root')) {
        tokensRgba = `:root {\n${lignesTokens}\n}\n`;
    } else {
        tokensRgba = tokensRgba.replace(/\}\s*$/, `${lignesTokens}\n}\n`);
    }
    writeFileSync(tokensRgbaPath, tokensRgba);
}

for (const { chemin } of cibles) {
    let css = readFileSync(chemin, 'utf8');
    let modifie = false;
    for (const [literal, token] of tokens) {
        if (!css.includes(literal)) continue;
        css = css.split(literal).join(`var(${token})`);
        modifie = true;
    }
    if (modifie) writeFileSync(chemin, css);
}

console.log(`Migré ${tokens.size} tokens rgba dans ${cibles.length} feuilles CSS.`);
