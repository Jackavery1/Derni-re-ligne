import { readdirSync, statSync, readFileSync, existsSync } from 'fs';

const MAX_KO_TOTAL = 588;
const WARN_KO_ENTREE = 80;
const WARN_KO_TOTAL = 560;
const dossier = 'dist/js';

/** @type {Set<string>} */
const exclusBudget = new Set(['neo-test-init.js', 'dev-init.js']);
const exclusPath = `${dossier}/budget-exclus.json`;
if (existsSync(exclusPath)) {
    for (const nom of JSON.parse(readFileSync(exclusPath, 'utf8'))) {
        exclusBudget.add(nom);
    }
}

const fichiers = readdirSync(dossier).filter(
    (f) =>
        f.endsWith('.js') &&
        !f.endsWith('.map') &&
        f !== 'budget-exclus.json' &&
        !exclusBudget.has(f)
);
const octets = fichiers.reduce(
    (total, fichier) => total + statSync(`${dossier}/${fichier}`).size,
    0
);
const koTotal = Math.round(octets / 1024);

const bundlePrincipal = fichiers.find((f) => f.startsWith('bundle'));
let koEntree = null;
if (bundlePrincipal) {
    koEntree = Math.round(statSync(`${dossier}/${bundlePrincipal}`).size / 1024);
    console.log(`Entree principale : ${koEntree} Ko (${bundlePrincipal})`);
}

if (koTotal > MAX_KO_TOTAL) {
    console.error(`Bundle trop lourd : ${koTotal} Ko (max ${MAX_KO_TOTAL} Ko)`);
    process.exit(1);
}

if (koEntree != null && koEntree > WARN_KO_ENTREE) {
    console.warn(
        `Attention : entree JS elevee (${koEntree} Ko, seuil d alerte ${WARN_KO_ENTREE} Ko)`
    );
}

if (koTotal > WARN_KO_TOTAL) {
    console.warn(
        `Attention : bundle total proche du plafond (${koTotal} Ko, seuil confort ${WARN_KO_TOTAL} Ko, max ${MAX_KO_TOTAL} Ko)`
    );
}

console.log(
    `Bundle OK : ${koTotal} Ko total JS (${fichiers.length} fichiers, max ${MAX_KO_TOTAL} Ko)`
);
