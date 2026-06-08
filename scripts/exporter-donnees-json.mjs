import { mkdirSync, writeFileSync } from 'fs';

const textes = await import('../js/histoire-textes.js');
const codex = await import('../js/codex-donnees.js');

mkdirSync('data', { recursive: true });

const exportsTextes = {};
for (const [cle, valeur] of Object.entries(textes)) {
    if (cle !== 'default') exportsTextes[cle] = valeur;
}

writeFileSync('data/histoire-textes.json', `${JSON.stringify(exportsTextes, null, 4)}\n`);
writeFileSync('data/codex-donnees.json', `${JSON.stringify({ CODEX: codex.CODEX }, null, 4)}\n`);

console.log('Données exportées → data/histoire-textes.json, data/codex-donnees.json');
