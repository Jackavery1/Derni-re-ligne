import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';

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

const sw = readFileSync('sw.js', 'utf8');
const misAJour = sw.replace(/const FICHIERS_A_CACHER = \[[\s\S]*?\];/, bloc);
writeFileSync('sw.js', misAJour);

console.log(`Cache SW synchronisé : ${fichiers.length} fichiers`);
