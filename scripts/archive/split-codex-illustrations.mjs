import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const src = readFileSync('js/codex-illustrations.js', 'utf8').split('\n');
const dir = 'js/codex-illustrations';
mkdirSync(dir, { recursive: true });

function write(name, from, to, header) {
    const body = src.slice(from - 1, to).join('\n');
    writeFileSync(join(dir, name), `${header}${body}\n`);
}

write('biomes.js', 3, 199, '');
write(
    'reliques.js',
    201,
    310,
    `import {
    dessinerIllustGlace,
    dessinerIllustDesert,
    dessinerIllustCyber,
    dessinerIllustFuochi,
    dessinerIllustCosmos,
} from './biomes.js';

`
);
write(
    'chroniques.js',
    312,
    264,
    `import { dessinerIllustLave } from './biomes.js';

`
);

writeFileSync(
    'js/codex-illustrations.js',
    `import { ILLUSTRATIONS_CODEX_HISTOIRE } from '../../js/codex/codex-illustrations-histoire.js';
import * as biomes from '../../js/codex-illustrations/biomes.js';
import * as reliques from '../../js/codex-illustrations/reliques.js';
import * as chroniques from '../../js/codex-illustrations/chroniques.js';

export * from '../../js/codex-illustrations/biomes.js';
export * from '../../js/codex-illustrations/reliques.js';
export * from '../../js/codex-illustrations/chroniques.js';

export const ILLUSTRATIONS_CODEX = {
    ...biomes,
    ...reliques,
    ...chroniques,
};

Object.assign(ILLUSTRATIONS_CODEX, ILLUSTRATIONS_CODEX_HISTOIRE);
`
);

console.log('Split codex-illustrations OK');
