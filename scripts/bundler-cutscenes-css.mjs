import { readFileSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

const racine = process.argv[2] ?? 'assets/cutscenes';
const sortie = process.argv[3] ?? join(racine, 'cutscenes.css');

const PARTIALS = [
    'cutscenes-structure.css',
    'cutscenes-dialogue-layout.css',
    'cutscenes-themes.css',
    'cutscenes-typo-controles.css',
    'cutscenes-responsive.css',
    'cutscenes-journal.css',
];

const contenu = PARTIALS.map((nom) => {
    const chemin = join(racine, nom);
    if (!existsSync(chemin)) {
        throw new Error(`Partial cutscene manquant : ${chemin}`);
    }
    return readFileSync(chemin, 'utf8');
})
    .join('\n')
    .trimEnd();

writeFileSync(sortie, `${contenu}\n`);

for (const nom of PARTIALS) {
    const chemin = join(racine, nom);
    if (chemin !== sortie && existsSync(chemin)) {
        rmSync(chemin);
    }
}

const ko = Math.round((Buffer.byteLength(contenu, 'utf8') / 1024) * 10) / 10;
console.log(`Cutscenes CSS bundle : ${PARTIALS.length} partials → ${sortie} (${ko} Ko)`);
