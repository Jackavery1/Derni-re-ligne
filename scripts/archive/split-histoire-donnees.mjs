import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const src = readFileSync('js/histoire-donnees.js', 'utf8').split('\n');
const dir = 'js/histoire-donnees';
mkdirSync(dir, { recursive: true });

function write(name, from, to, header) {
    const body = src.slice(from - 1, to).join('\n');
    writeFileSync(join(dir, name), `${header}${body}\n`);
}

write('personnages-boss.js', 1, 104, '// Donnees narratives — personnages et boss\n');
write('journaux-donnees.js', 106, 239, '// Journaux VERA (donnees statiques)\n');
write('fins-etat.js', 241, 344, '// Fins et etat initial histoire\n');
write('sequence-histoire.js', 349, src.length, '// Sequence narrative complete\n');

writeFileSync(
    'js/histoire-donnees.js',
    `// Barrel histoire-donnees — re-exporte les sous-modules
export * from './histoire-donnees/personnages-boss.js';
export * from './histoire-donnees/journaux-donnees.js';
export * from '../../js/histoire-donnees/fins-etat.js';
export * from './histoire-donnees/sequence-histoire.js';
`
);

console.log('Split histoire-donnees OK');
