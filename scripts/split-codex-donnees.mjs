import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const src = readFileSync('js/codex-donnees.js', 'utf8').split('\n');
const dir = 'js/codex-donnees';
mkdirSync(dir, { recursive: true });

function write(name, from, to, header) {
    const body = src.slice(from - 1, to).join('\n');
    writeFileSync(join(dir, name), `${header}${body}\n`);
}

function closeObject(name) {
    const path = join(dir, name);
    writeFileSync(path, readFileSync(path, 'utf8').trimEnd() + '\n};\n');
}

write('mondes.js', 4, 155, 'export const CODEX_MONDES = {\n');
write('reliques.js', 157, 299, 'export const CODEX_RELIQUES = {\n');
write('chroniques.js', 301, 488, 'export const CODEX_CHRONIQUES = {\n');
closeObject('mondes.js');
closeObject('reliques.js');
closeObject('chroniques.js');

writeFileSync(
    'js/codex-donnees.js',
    `import { CODEX_HISTOIRE } from './codex-histoire.js';
import { CODEX_MONDES } from './codex-donnees/mondes.js';
import { CODEX_RELIQUES } from './codex-donnees/reliques.js';
import { CODEX_CHRONIQUES } from './codex-donnees/chroniques.js';

export const CODEX = {
    ...CODEX_MONDES,
    ...CODEX_RELIQUES,
    ...CODEX_CHRONIQUES,
};

Object.assign(CODEX, CODEX_HISTOIRE);
`
);

console.log('Split codex-donnees OK');
