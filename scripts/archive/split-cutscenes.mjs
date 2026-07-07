import { readFileSync, writeFileSync } from 'fs';

const bossSrc = readFileSync('js/histoire-textes/cutscenes-boss.js', 'utf8');
const splitBoss = bossSrc.indexOf('export const CUTSCENES_POST_MONDE');
writeFileSync(
    'js/histoire-textes/cutscenes-boss-victoire.js',
    bossSrc.slice(0, splitBoss).trimEnd() + '\n'
);
writeFileSync(
    'js/histoire-textes/cutscenes-post-monde.js',
    bossSrc.slice(splitBoss).trimEnd() + '\n'
);
writeFileSync(
    'js/histoire-textes/cutscenes-boss.js',
    "export { CUTSCENES_VICTOIRE_BOSS } from '../../js/histoire-textes/cutscenes-boss-victoire.js';\n" +
        "export { CUTSCENES_POST_MONDE } from '../../js/histoire-textes/cutscenes-post-monde.js';\n"
);

const entreeSrc = readFileSync('js/histoire-textes/cutscenes-entree.js', 'utf8');
const acts = [
    {
        file: 'cutscenes-entree-prologue.js',
        keys: ['monde_prologue', 'monde_lave', 'monde_rouille', 'monde_boss_1'],
    },
    {
        file: 'cutscenes-entree-ocean.js',
        keys: ['monde_ocean', 'monde_foret', 'monde_glace', 'monde_boss_2'],
    },
    {
        file: 'cutscenes-entree-desert.js',
        keys: ['monde_desert', 'monde_eclipse', 'monde_cyber', 'monde_boss_3'],
    },
    {
        file: 'cutscenes-entree-cosmos.js',
        keys: ['monde_fuochi', 'monde_cosmos', 'monde_vide', 'monde_boss_4'],
    },
    {
        file: 'cutscenes-entree-finale.js',
        keys: [
            'monde_finale',
            'monde_finale_miroir',
            'monde_miroir',
            'monde_trame',
            'monde_paradoxe',
        ],
    },
];

const body = entreeSrc
    .replace(/^export const CUTSCENES_ENTREE = \{\n/, '')
    .replace(/\n\};\s*$/, '');
const keyRegex = /^\s{4}(monde_[a-z0-9_]+):\s*\[/gm;
const matches = [...body.matchAll(keyRegex)];
const positions = matches.map((m, i) => ({
    key: m[1],
    start: m.index,
    end: i + 1 < matches.length ? matches[i + 1].index : body.length,
}));

function extractBlock(start, end) {
    return body.slice(start, end).trimEnd().replace(/,\s*$/, '');
}

const importLines = [];
const spreadLines = [];

for (const act of acts) {
    const suffix = act.file.replace('cutscenes-entree-', '').replace('.js', '').toUpperCase();
    const exportName = `CUTSCENES_ENTREE_${suffix}`;
    const blocks = act.keys.map((k) => {
        const pos = positions.find((p) => p.key === k);
        if (!pos) throw new Error(`missing key ${k}`);
        return extractBlock(pos.start, pos.end);
    });
    writeFileSync(
        `js/histoire-textes/${act.file}`,
        `export const ${exportName} = {\n${blocks.join(',\n\n')}\n};\n`
    );
    importLines.push(`import { ${exportName} } from './${act.file}';`);
    spreadLines.push(`    ...${exportName},`);
}

writeFileSync(
    'js/histoire-textes/cutscenes-entree.js',
    `${importLines.join('\n')}\n\nexport const CUTSCENES_ENTREE = {\n${spreadLines.join('\n')}\n};\n`
);

console.log('Split cutscenes OK');
