import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const cheminJson = join(racine, 'data/histoire-textes.json');

if (!existsSync(cheminJson)) {
    console.error('data/histoire-textes.json introuvable — lancez npm run sync:data');
    process.exit(1);
}

const textes = await import(pathToFileURL(join(racine, 'js/histoire-textes.js')).href);
const attendu = {};
for (const [cle, valeur] of Object.entries(textes)) {
    if (cle !== 'default') attendu[cle] = valeur;
}

const attenduSerialise = `${JSON.stringify(attendu, null, 4)}\n`;
const surDisque = readFileSync(cheminJson, 'utf8');

if (surDisque !== attenduSerialise) {
    console.error(
        'data/histoire-textes.json desynchronise du module js/histoire-textes.js — lancez npm run sync:data'
    );
    process.exit(1);
}

console.log('Sync textes histoire OK (JSON = module source)');
