import { readdirSync, statSync } from 'fs';

const MAX_KO = 560;
const WARN_KO = 520;
const dossier = 'dist/js';
const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.js') && !f.endsWith('.map'));
const octets = fichiers.reduce(
    (total, fichier) => total + statSync(`${dossier}/${fichier}`).size,
    0
);
const ko = Math.round(octets / 1024);

const bundlePrincipal = fichiers.find((f) => f.startsWith('bundle'));
if (bundlePrincipal) {
    const koPrincipal = Math.round(statSync(`${dossier}/${bundlePrincipal}`).size / 1024);
    console.log(`Entree principale : ${koPrincipal} Ko (${bundlePrincipal})`);
}

if (ko > MAX_KO) {
    console.error(`Bundle trop lourd : ${ko} Ko (max ${MAX_KO} Ko)`);
    process.exit(1);
}

if (ko > WARN_KO) {
    console.warn(
        `Attention : bundle proche du plafond (${ko} Ko, seuil d alerte ${WARN_KO} Ko, max ${MAX_KO} Ko)`
    );
}

console.log(`Bundle OK : ${ko} Ko total JS (${fichiers.length} fichiers, max ${MAX_KO} Ko)`);
