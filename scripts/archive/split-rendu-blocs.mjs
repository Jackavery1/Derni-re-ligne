import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('js/rendu-blocs.js', 'utf8');
const lines = src.split('\n');

const styles = [
    "import { assombrir, eclaircir, coordsBloc, debutBloc, finBloc, pseudoAleatoire, tracerRectArrondi } from '../../js/rendu/rendu-blocs-utils.js';",
    '',
    ...lines.slice(77, 598),
].join('\n');

const barrel = `import { BIOMES } from '../../js/config/config.js';
import { assombrir, eclaircir } from '../../js/rendu/rendu-blocs-utils.js';
import {
    dessinerBlocBiseaute,
    dessinerBlocFondu,
    dessinerBlocCristal,
    dessinerBlocOrganique,
    dessinerBlocGlace,
    dessinerBlocGrain,
    dessinerBlocCircuit,
    dessinerBlocDiamant,
    dessinerBlocNebuleuse,
} from '../../js/rendu/rendu-blocs-styles.js';

${lines.slice(578, 621).join('\n')}
`;

writeFileSync('js/rendu-blocs-utils.js', lines.slice(0, 76).join('\n') + '\n');
writeFileSync('js/rendu-blocs-styles.js', styles + '\n');
writeFileSync('js/rendu-blocs.js', barrel);

console.log('rendu-blocs découpé');
