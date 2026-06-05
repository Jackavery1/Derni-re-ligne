import { readdirSync, statSync } from 'fs';

const MAX_KO = 220;
const dossier = 'dist/js';
const octets = readdirSync(dossier)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    .reduce((total, fichier) => total + statSync(`${dossier}/${fichier}`).size, 0);
const ko = Math.round(octets / 1024);

if (ko > MAX_KO) {
    console.error(`Bundle trop lourd : ${ko} Ko (max ${MAX_KO} Ko)`);
    process.exit(1);
}

console.log(`Bundle OK : ${ko} Ko total JS (max ${MAX_KO} Ko)`);
