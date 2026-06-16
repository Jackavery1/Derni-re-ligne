import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('js/config.js', 'utf8');
const lines = src.split('\n');

const configJeu = [
    ...lines.slice(0, 13),
    '',
    ...lines.slice(582, 597),
    '',
    ...lines.slice(597, 828),
].join('\n');

const biomes = [...lines.slice(14, 380), '', ...lines.slice(570, 581)].join('\n');

const contenu = lines.slice(381, 569).join('\n');

writeFileSync('js/config-jeu.js', configJeu + '\n');
writeFileSync('js/biomes.js', biomes + '\n');
writeFileSync('js/contenu-jeu.js', contenu + '\n');

writeFileSync(
    'js/config.js',
    `export {
    CONFIG,
    LAYOUT,
    TABLE_KICK_STANDARD,
    TABLE_KICK_I,
    TETROMINOS,
    TOUCHES_DEFAUT,
} from './config-jeu.js';
export { BIOMES, ORDRE_BIOMES } from './biomes.js';
export { RELIQUES, METEO_BIOMES } from './contenu-jeu.js';
`
);

console.log('config.js découpé en config-jeu.js, biomes.js, contenu-jeu.js');
