import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const versionCache = `derniere-ligne-${pkg.version}`;

const STATIQUES = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
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
const fichiers = [...STATIQUES, ...html, ...js];

const lignes = fichiers.map((f) => `    '${f}',`).join('\n');
const bloc = `const FICHIERS_A_CACHER = [\n${lignes}\n];`;

let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/const VERSION_CACHE = '[^']+';/, `const VERSION_CACHE = '${versionCache}';`);
sw = sw.replace(/const FICHIERS_A_CACHER = \[[\s\S]*?\];/, bloc);
writeFileSync('sw.js', sw);

console.log(`Cache SW synchronisé : ${fichiers.length} fichiers (${versionCache})`);
