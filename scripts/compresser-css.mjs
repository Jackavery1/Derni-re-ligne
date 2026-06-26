import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const dossier = process.argv[2] ?? 'dist/styles';

function minifierCss(texte) {
    return texte
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
}

let totalAvant = 0;
let totalApres = 0;

for (const nom of readdirSync(dossier)) {
    if (!nom.endsWith('.css')) continue;
    const chemin = join(dossier, nom);
    const avant = readFileSync(chemin, 'utf8');
    totalAvant += statSync(chemin).size;
    const apres = minifierCss(avant);
    writeFileSync(chemin, apres);
    totalApres += Buffer.byteLength(apres, 'utf8');
}

console.log(
    `CSS minifie : ${Math.round((totalAvant / 1024) * 10) / 10} Ko → ${Math.round((totalApres / 1024) * 10) / 10} Ko (${dossier})`
);
