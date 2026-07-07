import { readFileSync, writeFileSync } from 'fs';

const illu = readFileSync('js/histoire-illustrations.js', 'utf8');
const fondBlock = illu.slice(0, illu.indexOf('// ---- Journal 1'));
const j1Start = illu.indexOf('// ---- Journal 1');
const j4Start = illu.indexOf('// ---- Journal 4');
const j7Start = illu.indexOf('// ---- Journal 7');
const mapStart = illu.indexOf(
    '// ============================================================\n// MAP ID'
);

writeFileSync(
    'js/histoire-illustrations-utils.js',
    `/** Fond commun des illustrations de journaux VERA. */\n${fondBlock.replace('function fondJournal', 'export function fondJournal')}`
);

const groups = [
    {
        file: 'histoire-illustrations-journaux-1-3.js',
        start: j1Start,
        end: j4Start,
        imports: [1, 2, 3],
    },
    {
        file: 'histoire-illustrations-journaux-4-6.js',
        start: j4Start,
        end: j7Start,
        imports: [4, 5, 6],
    },
    {
        file: 'histoire-illustrations-journaux-7-9.js',
        start: j7Start,
        end: mapStart,
        imports: [7, 8, 9],
    },
];

const importLines = [];
const mapLines = [];

for (const g of groups) {
    const body = illu.slice(g.start, g.end).trimEnd();
    const exports = g.imports.map((n) => `dessinerJournal${n}`).join(', ');
    writeFileSync(
        `js/${g.file}`,
        `import { fondJournal } from '../../js/histoire/histoire-illustrations-utils.js';\n\n${body}\n`
    );
    importLines.push(`import { ${exports} } from './${g.file}';`);
    for (const n of g.imports) {
        mapLines.push(`    journal_${n}: dessinerJournal${n},`);
    }
}

writeFileSync(
    'js/histoire-illustrations.js',
    `/** Illustrations canvas des journaux VERA — façade. */\n${importLines.join('\n')}\n\nexport const ILLUSTRATIONS_JOURNAUX = {\n${mapLines.join('\n')}\n};\n`
);

const fonds = readFileSync('js/histoire-cutscene-fonds.js', 'utf8');
const animesStart = fonds.indexOf('const FONDS_CUTSCENE');
const scenesStart = fonds.indexOf('/**\n * @param {{ voile?: number, kenBurns?: string }} scene');
const boucleStart = fonds.indexOf('function _boucleFondCutscene');

const header = fonds.slice(0, animesStart);
const animesBlock = fonds.slice(animesStart, scenesStart);
const scenesBlock = fonds.slice(scenesStart, boucleStart);
const orchestration = fonds.slice(boucleStart);

writeFileSync(
    'js/histoire-cutscene-fonds-animes.js',
    `/** Animateurs canvas des fonds cutscene procéduraux. */\n${animesBlock
        .replace('function _fondEtoilesDefaut', 'function fondEtoilesDefaut')
        .replace(
            'function _dessinerFondCanvas(ctx, w, h, ts) {',
            'export function dessinerFondCanvas(ctx, w, h, ts, fondActif) {'
        )
        .replace(
            '    if (!_fondActif) return;\n    const dessiner = FONDS_CUTSCENE[_fondActif.type] ?? _fondEtoilesDefaut;',
            '    if (!fondActif) return;\n    const dessiner = FONDS_CUTSCENE[fondActif.type] ?? fondEtoilesDefaut;'
        )}`
);

writeFileSync(
    'js/histoire-cutscene-fonds-scenes.js',
    `/** Rendu image plein écran (Ken Burns) pour cutscenes. */\n${scenesBlock
        .replace('function _calculerKenBurns', 'function calculerKenBurns')
        .replace('function _dessinerImageScene', 'export function dessinerImageScene')
        .replace('_calculerKenBurns(', 'calculerKenBurns(')}`
);

writeFileSync(
    'js/histoire-cutscene-fonds.js',
    `${header}import { dessinerFondCanvas } from '../../js/histoire/histoire-cutscene-fonds-animes.js';
import { dessinerImageScene } from '../../js/histoire/histoire-cutscene-fonds-scenes.js';

${orchestration
    .replaceAll(
        '_dessinerFondCanvas(_ctxBg, w, h, ts)',
        'dessinerFondCanvas(_ctxBg, w, h, ts, _fondActif)'
    )
    .replaceAll('_dessinerImageScene(', 'dessinerImageScene(')}`
);

console.log('Split illustrations + cutscene-fonds OK');
