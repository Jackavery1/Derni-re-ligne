import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const BUDGET_APP_SHELL_KO = 2048;
const MARQUEUR_DEBUT = '/* PRECACHE:DEBUT */';
const MARQUEUR_FIN = '/* PRECACHE:FIN */';

const modeProd = process.argv.includes('--prod');
const enforceBudget = process.argv.includes('--enforce-budget') || modeProd;
const racine = modeProd ? 'dist' : '.';
const swPath = modeProd ? 'dist/sw.js' : 'sw.js';

/** @param {string} dossier @param {string} prefixe @param {string} ext */
function listerPlat(dossier, prefixe, ext) {
    if (!existsSync(join(racine, dossier))) return [];
    return readdirSync(join(racine, dossier))
        .filter((f) => f.endsWith(ext))
        .sort()
        .map((f) => `${prefixe}${f}`);
}

/** @returns {string[]} */
function construireListePrecache() {
    /** @type {string[]} */
    const fichiers = [
        './',
        './index.html',
        './manifest.json',
        ...listerPlat('styles', './styles/', '.css'),
        ...listerPlat('html', './html/', '.html'),
        ...listerPlat('data', './data/', '.json'),
        ...listerPlat('assets/polices', './assets/polices/', '.woff2'),
    ];

    if (modeProd) {
        const jsDir = join(racine, 'js');
        if (existsSync(jsDir)) {
            fichiers.push(
                ...readdirSync(jsDir)
                    .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
                    .sort()
                    .map((f) => `./js/${f}`)
            );
        }
    } else {
        fichiers.push(...listerPlat('js', './js/', '.js'));
    }

    const imgDir = join(racine, 'img');
    if (existsSync(imgDir)) {
        for (const f of readdirSync(imgDir).sort()) {
            if (!f.endsWith('.png')) continue;
            if (f === 'robo-favicon.png') continue;
            fichiers.push(`./img/${f}`);
        }
    }

    return fichiers;
}

function mesurerPoids(fichiers) {
    let total = 0;
    for (const chemin of fichiers) {
        if (chemin === './' || chemin === '.') continue;
        const disque = join(racine, chemin.replace(/^\.\//, ''));
        if (existsSync(disque)) total += statSync(disque).size;
    }
    return total;
}

if (modeProd && !existsSync(swPath)) {
    console.error(`Mode prod : ${swPath} introuvable (lancez npm run build d abord).`);
    process.exit(1);
}

const fichiers = construireListePrecache();
const lignes = fichiers.map((f) => `    '${f}',`).join('\n');
const blocPrecache = `${MARQUEUR_DEBUT}\n${lignes}\n    ${MARQUEUR_FIN}`;

let sw = readFileSync(swPath, 'utf8');
const regexPrecache = new RegExp(
    `${MARQUEUR_DEBUT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARQUEUR_FIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
);

if (!regexPrecache.test(sw)) {
    console.error(`Marqueurs PRECACHE introuvables dans ${swPath}`);
    process.exit(1);
}

sw = sw.replace(regexPrecache, blocPrecache);
writeFileSync(swPath, sw);

const octets = mesurerPoids(fichiers);
const ko = Math.round((octets / 1024) * 10) / 10;
const label = modeProd ? 'prod' : 'dev';

console.log(`Precache ${label} : ${fichiers.length} fichiers, ${ko} Ko (${swPath})`);

if (octets > BUDGET_APP_SHELL_KO * 1024) {
    const msg = `App shell trop lourd : ${ko} Ko (max ${BUDGET_APP_SHELL_KO} Ko)`;
    if (enforceBudget) {
        console.error(msg);
        process.exit(1);
    }
    console.warn(`ATTENTION — ${msg}`);
}
