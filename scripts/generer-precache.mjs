import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const BUDGET_APP_SHELL_KO = 2048;
const MARQUEUR_DEBUT = '/* PRECACHE:DEBUT */';
const MARQUEUR_FIN = '/* PRECACHE:FIN */';

/** Fichiers exclus du precache (fetch runtime, trop lourds, ou sources export-only). */
const EXCLUS_PRECACHE = new Set([
    './styles/dev.css',
    './img/icon-512.png',
    './img/icon-maskable-512.png',
    './js/codex-histoire.js',
    './js/logique/dev-init.js',
]);

/** Polices narratif — fetch à la demande (hors shell installable). */
const POLICES_DIFFERES_PRECACHE = new Set([
    './assets/fonts-dist/crimson-pro-latin-400-normal.woff2',
    './assets/fonts-dist/crimson-pro-latin-400-italic.woff2',
]);

const modeProd = process.argv.includes('--prod');
const enforceBudget = process.argv.includes('--enforce-budget') || modeProd;
const racine = modeProd ? 'dist' : '.';
const precacheListPath = modeProd ? 'dist/sw-precache-list.js' : 'sw-precache-list.js';

/** @returns {Set<string>} */
function obtenirExclusPrecache() {
    const exclus = new Set([...EXCLUS_PRECACHE, ...POLICES_DIFFERES_PRECACHE]);
    if (modeProd) {
        const budgetPath = join(racine, 'js/budget-exclus.json');
        if (existsSync(budgetPath)) {
            try {
                const liste = JSON.parse(readFileSync(budgetPath, 'utf8'));
                if (Array.isArray(liste)) {
                    for (const nom of liste) {
                        exclus.add(`./js/${nom}`);
                    }
                }
            } catch {
                /* budget-exclus absent ou illisible */
            }
        }
    }
    return exclus;
}

const MODELE_LISTE_PRECACHE = `// Genere par npm run sync:sw — ne pas editer a la main.
const FICHIERS_A_CACHER = [
    ${MARQUEUR_DEBUT}
    ${MARQUEUR_FIN}
];
`;

/** @param {string} dossier @param {string} prefixe @param {string} ext */
function listerPlat(dossier, prefixe, ext) {
    if (!existsSync(join(racine, dossier))) return [];
    return readdirSync(join(racine, dossier))
        .filter((f) => f.endsWith(ext))
        .sort()
        .map((f) => `${prefixe}${f}`);
}

/** @param {string} dossier @param {string} prefixe */
function listerJsRecursif(dossier, prefixe) {
    const base = join(racine, dossier);
    if (!existsSync(base)) return [];
    /** @type {string[]} */
    const resultat = [];
    function parcourir(courant, pref) {
        for (const entree of readdirSync(courant, { withFileTypes: true }).sort((a, b) =>
            a.name.localeCompare(b.name)
        )) {
            const chemin = join(courant, entree.name);
            if (entree.isDirectory()) {
                parcourir(chemin, `${pref}${entree.name}/`);
            } else if (entree.name.endsWith('.js') && !entree.name.endsWith('.map')) {
                resultat.push(`${prefixe}${pref}${entree.name}`);
            }
        }
    }
    parcourir(base, '');
    return resultat;
}

/** @returns {string[]} */
function construireListePrecache() {
    /** @type {string[]} */
    const fichiers = [
        './',
        './index.html',
        './manifest.json',
        './sw-precache.js',
        './sw-precache-list.js',
        ...listerPlat('styles', './styles/', '.css'),
        ...listerPlat('html', './html/', '.html'),
        ...listerPlat('data', './data/', '.json'),
        ...listerPlat('assets/fonts-dist', './assets/fonts-dist/', '.woff2'),
        ...listerPlat('assets/sfx/boss', './assets/sfx/boss/', '.ogg'),
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
        fichiers.push(...listerJsRecursif('js', './js/'));
    }

    const imgDir = join(racine, 'img');
    if (existsSync(imgDir)) {
        for (const f of readdirSync(imgDir).sort()) {
            if (!f.endsWith('.png')) continue;
            if (f === 'robo-favicon.png') continue;
            fichiers.push(`./img/${f}`);
        }
    }

    return fichiers.filter((f) => !obtenirExclusPrecache().has(f));
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

if (!existsSync(precacheListPath)) {
    if (modeProd) {
        console.error(
            `Mode prod : ${precacheListPath} introuvable (copiez sw-precache-list.js dans dist).`
        );
        process.exit(1);
    }
    writeFileSync(precacheListPath, MODELE_LISTE_PRECACHE);
}

const fichiers = construireListePrecache();
const lignes = fichiers.map((f) => `    '${f}',`).join('\n');
const blocPrecache = `${MARQUEUR_DEBUT}\n${lignes}\n    ${MARQUEUR_FIN}`;

let precache = readFileSync(precacheListPath, 'utf8');
const regexPrecache = new RegExp(
    `${MARQUEUR_DEBUT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARQUEUR_FIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
);

if (!regexPrecache.test(precache)) {
    console.error(`Marqueurs PRECACHE introuvables dans ${precacheListPath}`);
    process.exit(1);
}

precache = precache.replace(regexPrecache, blocPrecache);
writeFileSync(precacheListPath, precache);

const octets = mesurerPoids(fichiers);
const ko = Math.round((octets / 1024) * 10) / 10;
const label = modeProd ? 'prod' : 'dev';

console.log(`Precache ${label} : ${fichiers.length} fichiers, ${ko} Ko (${precacheListPath})`);

if (octets > BUDGET_APP_SHELL_KO * 1024) {
    const msg = `App shell trop lourd : ${ko} Ko (max ${BUDGET_APP_SHELL_KO} Ko)`;
    if (enforceBudget) {
        console.error(msg);
        process.exit(1);
    }
    if (modeProd) {
        console.warn(`ATTENTION — ${msg}`);
    }
}
