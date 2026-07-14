import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const variablesPath = join(racine, 'styles', 'variables.css');
const tokensPath = join(racine, 'styles', 'tokens-rgba.css');

const contenu = readFileSync(variablesPath, 'utf8');
const debut = contenu.indexOf('    /* --- Tokens rgba (migrés) --- */');
if (debut < 0) {
    console.log('Section rgba déjà extraite.');
    process.exit(0);
}

const finBloc = contenu.indexOf('\n}', debut);
const tokensBloc = contenu.slice(debut, finBloc);
const avant = contenu.slice(0, debut);
const apres = contenu
    .slice(finBloc + 2)
    .replace(/rgba\(0, 245, 255, 0.025\)/g, 'var(--rgba-0-245-255-0-025)');

writeFileSync(
    tokensPath,
    `:root {\n${tokensBloc}\n    --rgba-0-245-255-0-025: rgba(0, 245, 255, 0.025);\n}\n`
);
writeFileSync(variablesPath, avant + apres);
console.log('Extrait vers styles/tokens-rgba.css');
