import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const cheminParDefaut = join(racine, 'data/histoire-textes.json');

export const ENTETE_GENERE =
    'NE PAS ÉDITER — généré depuis js/histoire-textes/ par scripts/generer-histoire-json.mjs';

/** @returns {Promise<Record<string, unknown>>} */
export async function obtenirExportsTextesHistoire() {
    const textes = await import(pathToFileURL(join(racine, 'js/histoire-textes.js')).href);
    /** @type {Record<string, unknown>} */
    const exportsTextes = { _genere: ENTETE_GENERE };
    for (const [cle, valeur] of Object.entries(textes)) {
        if (cle !== 'default') exportsTextes[cle] = valeur;
    }
    return exportsTextes;
}

export async function serialiserHistoireTextesJson() {
    const exportsTextes = await obtenirExportsTextesHistoire();
    return `${JSON.stringify(exportsTextes, null, 4)}\n`;
}

/** @param {string} [chemin] */
export async function ecrireHistoireTextesJson(chemin = cheminParDefaut) {
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, await serialiserHistoireTextesJson(), 'utf8');
}

function estFichierPrincipal() {
    if (!process.argv[1]) return false;
    return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (estFichierPrincipal()) {
    await ecrireHistoireTextesJson();
    console.log('Généré → data/histoire-textes.json');
}
