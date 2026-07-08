import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { serialiserHistoireTextesJson } from './generer-histoire-json.mjs';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const cheminJson = join(racine, 'data/histoire-textes.json');

if (!existsSync(cheminJson)) {
    console.error('data/histoire-textes.json introuvable — lancez npm run histoire:json');
    process.exit(1);
}

const attenduSerialise = await serialiserHistoireTextesJson();
const surDisque = readFileSync(cheminJson, 'utf8');

if (surDisque !== attenduSerialise) {
    console.error(
        'data/histoire-textes.json désynchronisé des modules js/histoire-textes/ — lancez npm run histoire:json'
    );
    process.exit(1);
}

console.log('Sync textes histoire OK (JSON = modules source)');
