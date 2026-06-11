import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT_DIR = 'assets/polices';

/** @type {{ package: string, fichier: string, destination: string }[]} */
const FICHIERS = [
    {
        package: '@fontsource/press-start-2p',
        fichier: 'press-start-2p-latin-400-normal.woff2',
        destination: 'press-start-2p-latin-400-normal.woff2',
    },
    {
        package: '@fontsource/orbitron',
        fichier: 'orbitron-latin-600-normal.woff2',
        destination: 'orbitron-latin-600-normal.woff2',
    },
    {
        package: '@fontsource/orbitron',
        fichier: 'orbitron-latin-700-normal.woff2',
        destination: 'orbitron-latin-700-normal.woff2',
    },
    {
        package: '@fontsource/rajdhani',
        fichier: 'rajdhani-latin-400-normal.woff2',
        destination: 'rajdhani-latin-400-normal.woff2',
    },
    {
        package: '@fontsource/rajdhani',
        fichier: 'rajdhani-latin-500-normal.woff2',
        destination: 'rajdhani-latin-500-normal.woff2',
    },
    {
        package: '@fontsource/rajdhani',
        fichier: 'rajdhani-latin-600-normal.woff2',
        destination: 'rajdhani-latin-600-normal.woff2',
    },
    {
        package: '@fontsource/rajdhani',
        fichier: 'rajdhani-latin-700-normal.woff2',
        destination: 'rajdhani-latin-700-normal.woff2',
    },
    {
        package: '@fontsource/crimson-pro',
        fichier: 'crimson-pro-latin-400-normal.woff2',
        destination: 'crimson-pro-latin-400-normal.woff2',
    },
    {
        package: '@fontsource/crimson-pro',
        fichier: 'crimson-pro-latin-400-italic.woff2',
        destination: 'crimson-pro-latin-400-italic.woff2',
    },
];

mkdirSync(OUT_DIR, { recursive: true });

console.log('\n=== Preparation polices woff2 (latin) ===\n');

let copies = 0;

for (const { package: pkg, fichier, destination } of FICHIERS) {
    const source = join('node_modules', pkg, 'files', fichier);
    const cible = join(OUT_DIR, destination);

    if (!existsSync(source)) {
        console.error(`  MANQUANT : ${source}`);
        console.error('  Lancez npm install puis relancez npm run media:polices');
        process.exit(1);
    }

    cpSync(source, cible);
    copies++;
    console.log(`  ${destination}`);
}

console.log(`\n${copies} fichier(s) copie(s) vers ${OUT_DIR}/`);
