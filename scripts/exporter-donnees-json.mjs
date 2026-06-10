import { mkdirSync, writeFileSync, rmSync } from 'fs';

const textes = await import('../js/histoire-textes.js');

mkdirSync('data', { recursive: true });

const exportsTextes = {};
for (const [cle, valeur] of Object.entries(textes)) {
    if (cle !== 'default') exportsTextes[cle] = valeur;
}

writeFileSync('data/histoire-textes.json', `${JSON.stringify(exportsTextes, null, 4)}\n`);
// Le codex n'est plus exporté en JSON : ses conditions sont des fonctions,
// le runtime importe directement js/codex-donnees.js.
rmSync('data/codex-donnees.json', { force: true });

console.log('Données exportées → data/histoire-textes.json');
