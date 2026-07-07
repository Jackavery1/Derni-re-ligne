import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'js/histoire-textes.js');
const outDir = join(root, 'js/histoire-textes');

const lines = readFileSync(sourcePath, 'utf8').split('\n');

/** @type {{ file: string, start: number, end: number }[]} */
const sections = [
    { file: 'portraits.js', start: 8, end: 108 },
    { file: 'cutscenes-entree.js', start: 114, end: 514 },
    { file: 'dialogues-boss.js', start: 519, end: 579 },
    { file: 'cutscenes-boss.js', start: 584, end: 925 },
    { file: 'chapitres.js', start: 930, end: 1080 },
    { file: 'journaux.js', start: 1085, end: 1173 },
    { file: 'intro-interludes.js', start: 1178, end: 1385 },
];

mkdirSync(outDir, { recursive: true });

for (const { file, start, end } of sections) {
    const body = lines
        .slice(start - 1, end)
        .join('\n')
        .trimEnd();
    writeFileSync(join(outDir, file), `${body}\n`);
}

const barrel = `// Barrel — réexporte les modules narratifs découpés.
export * from '../../js/histoire-textes/portraits.js';
export * from '../../js/histoire-textes/cutscenes-entree.js';
export * from '../../js/histoire-textes/dialogues-boss.js';
export * from '../../js/histoire-textes/cutscenes-boss.js';
export * from '../../js/histoire-textes/chapitres.js';
export * from '../../js/histoire-textes/journaux.js';
export * from '../../js/histoire-textes/intro-interludes.js';
`;

writeFileSync(sourcePath, barrel);
console.log(`Découpage terminé → ${sections.length} modules dans js/histoire-textes/`);
