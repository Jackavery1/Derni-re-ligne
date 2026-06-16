import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';

const textes = await import('../js/histoire-textes.js');

mkdirSync('data', { recursive: true });

const exportsTextes = {};
for (const [cle, valeur] of Object.entries(textes)) {
    if (cle !== 'default') exportsTextes[cle] = valeur;
}

const fichiersExportes = ['data/histoire-textes.json'];
writeFileSync('data/histoire-textes.json', `${JSON.stringify(exportsTextes, null, 4)}\n`);
rmSync('data/codex-donnees.json', { force: true });

execSync('node scripts/exporter-codex-archi.mjs', { stdio: 'inherit' });
fichiersExportes.push(
    'data/codex-textes.json',
    'data/archi-niveaux.json',
    'js/codex-conditions.js'
);
execSync(`npx prettier --write ${fichiersExportes.join(' ')}`, { stdio: 'inherit' });

console.log('Données exportées → data/histoire-textes.json');
