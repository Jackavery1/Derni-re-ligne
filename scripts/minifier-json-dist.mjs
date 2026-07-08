import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const dossier = process.argv[2] ?? 'dist/data';

let totalAvant = 0;
let totalApres = 0;
let fichiers = 0;

for (const nom of readdirSync(dossier)) {
    if (!nom.endsWith('.json')) continue;
    const chemin = join(dossier, nom);
    const brut = readFileSync(chemin, 'utf8');
    totalAvant += statSync(chemin).size;
    const minifie = JSON.stringify(JSON.parse(brut));
    writeFileSync(chemin, minifie);
    totalApres += Buffer.byteLength(minifie, 'utf8');
    fichiers++;
}

console.log(
    `JSON minifie : ${fichiers} fichiers, ${Math.round((totalAvant / 1024) * 10) / 10} Ko → ${Math.round((totalApres / 1024) * 10) / 10} Ko (${dossier})`
);
