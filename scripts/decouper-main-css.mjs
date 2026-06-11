import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const sourcePath = 'styles/main.css';
const outDir = 'styles';
const lines = readFileSync(sourcePath, 'utf8').split(/\r?\n/);

/** @type {{ file: string, from: number, to: number }[]} */
const sections = [
    { file: 'base.css', from: 2, to: 207 },
    { file: 'variables.css', from: 208, to: 316 },
    { file: 'ecrans-base.css', from: 317, to: 428 },
    { file: 'ecran-titre.css', from: 429, to: 711 },
    { file: 'ecran-pause.css', from: 712, to: 767 },
    { file: 'ecran-game-over.css', from: 768, to: 1042 },
    { file: 'overlays-meta.css', from: 1043, to: 1600 },
    { file: 'interface-jeu.css', from: 1601, to: 1893 },
    { file: 'controles-tactiles.css', from: 1894, to: 1957 },
    { file: 'responsive.css', from: 1958, to: 2090 },
    { file: 'ecran-selection.css', from: 2091, to: 3218 },
    { file: 'mode-architecte.css', from: 3219, to: 3491 },
    { file: 'mode-histoire.css', from: 3492, to: 3928 },
    { file: 'boss.css', from: 3929, to: 4473 },
    { file: 'mecaniques-histoire.css', from: 4474, to: 4664 },
    { file: 'menu-narratif.css', from: 4665, to: 4916 },
    { file: 'boutons-verrouilles.css', from: 4917, to: 4963 },
    { file: 'typographie.css', from: 4964, to: 5101 },
    { file: 'cutscenes.css', from: 5102, to: 5744 },
    { file: 'dev.css', from: 5745, to: lines.length },
];

mkdirSync(outDir, { recursive: true });

for (const { file, from, to } of sections) {
    const chunk = lines
        .slice(from - 1, to)
        .join('\n')
        .trimEnd();
    writeFileSync(join(outDir, file), `${chunk}\n`);
    console.log(`${file}: ${to - from + 1} lignes`);
}

const imports = [
    "@import url('objectifs-histoire.css');",
    ...sections.map(({ file }) => `@import url('${file}');`),
].join('\n');

writeFileSync(join(outDir, 'main.css'), `${imports}\n`);

console.log(`main.css → ${sections.length + 1} imports`);
