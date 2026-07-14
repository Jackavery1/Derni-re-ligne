import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { ecrireHistoireTextesJson } from './generer-histoire-json.mjs';

const biomesSource = await import('../scripts/sources-biomes-export.mjs');
const biomesHistoire = await import('../scripts/sources-biomes-histoire-export.mjs');
const contenuSource = await import('../scripts/sources-contenu-jeu-export.mjs');
const difficulteSource = await import('../scripts/sources-difficulte-mondes-export.mjs');

mkdirSync('data', { recursive: true });

const fichiersExportes = ['data/histoire-textes.json'];
await ecrireHistoireTextesJson();

writeFileSync(
    'data/biomes.json',
    `${JSON.stringify(
        {
            BIOMES: biomesSource.BIOMES,
            ORDRE_BIOMES: biomesSource.ORDRE_BIOMES,
            ORDRE_BIOMES_LIBRE: biomesSource.ORDRE_BIOMES_LIBRE,
            BIOMES_HISTOIRE: biomesHistoire.BIOMES_HISTOIRE,
            ORDRE_BIOMES_HISTOIRE: biomesHistoire.ORDRE_BIOMES_HISTOIRE,
        },
        null,
        2
    )}\n`
);
fichiersExportes.push('data/biomes.json');

writeFileSync(
    'data/contenu-jeu.json',
    `${JSON.stringify(
        {
            RELIQUES: contenuSource.RELIQUES,
            METEO_BIOMES: contenuSource.METEO_BIOMES,
            INFOBULLES_MODES: contenuSource.INFOBULLES_MODES,
        },
        null,
        2
    )}\n`
);
fichiersExportes.push('data/contenu-jeu.json');

writeFileSync(
    'data/difficulte-mondes.json',
    `${JSON.stringify(
        {
            PALIERS_VITESSE_MS: difficulteSource.PALIERS_VITESSE_MS,
            VITESSE_PLANCHER_MS: difficulteSource.VITESSE_PLANCHER_MS,
            DIFFICULTE_MONDES: difficulteSource.DIFFICULTE_MONDES,
        },
        null,
        2
    )}\n`
);
fichiersExportes.push('data/difficulte-mondes.json');
fichiersExportes.push('data/achievements-core.json');
fichiersExportes.push('data/histoire-donnees.json');
fichiersExportes.push('data/achievements-histoire.json');

rmSync('data/codex-donnees.json', { force: true });

execSync('node scripts/exporter-codex-archi.mjs', { stdio: 'inherit' });
fichiersExportes.push(
    'data/codex-textes.json',
    'data/archi-niveaux.json',
    'js/codex/codex-conditions.js'
);
execSync(`npx prettier --write ${fichiersExportes.join(' ')}`, { stdio: 'inherit' });

console.log(
    'Données exportées → data/histoire-textes.json, data/biomes.json, data/contenu-jeu.json'
);
