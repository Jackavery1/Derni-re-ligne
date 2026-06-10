import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const REVISION_CACHE = 'r7';
const versionCache = `derniere-ligne-${pkg.version}-${REVISION_CACHE}`;

const STATIQUES = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './styles/objectifs-histoire.css',
    './fonts/PressStart2P-Regular.ttf',
];

function listerFichiers(dossier, prefixe, extension) {
    if (!existsSync(dossier)) return [];
    return readdirSync(dossier)
        .filter((f) => f.endsWith(extension))
        .sort()
        .map((f) => `${prefixe}${f}`);
}

const html = listerFichiers('html', './html/', '.html');
const js = listerFichiers('js', './js/', '.js');
const img = listerFichiers('img', './img/', '.png');
const data = existsSync('data') ? listerFichiers('data', './data/', '.json') : [];
const cutscenes = listerFichiers('assets/cutscenes', './assets/cutscenes/', '.png');
const fichiers = [...STATIQUES, ...img, ...html, ...js, ...data, ...cutscenes];

const lignes = fichiers.map((f) => `    '${f}',`).join('\n');
const bloc = `const FICHIERS_A_CACHER = [\n${lignes}\n];`;

let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/const VERSION_CACHE = '[^']+';/, `const VERSION_CACHE = '${versionCache}';`);
sw = sw.replace(/const FICHIERS_A_CACHER = \[[\s\S]*?\];/, bloc);
writeFileSync('sw.js', sw);

console.log(`Cache SW synchronisé : ${fichiers.length} fichiers (${versionCache})`);
