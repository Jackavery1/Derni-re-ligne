import { readFileSync, writeFileSync } from 'fs';

function splitObjetParCles(cheminSource, nomExport, actes) {
    const src = readFileSync(cheminSource, 'utf8');
    const debutObjet = src.indexOf('{');
    const body = src.slice(debutObjet + 1, src.lastIndexOf('};')).trimEnd();
    const keyRegex = /^\s{4}([a-z0-9_]+):\s*(?:\[|\{)/gm;
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

    for (const act of actes) {
        const suffix = act.file
            .replace(/^cutscenes-(?:post-monde|boss-victoire|entree)-/, '')
            .replace('.js', '')
            .replace(/-/g, '_')
            .toUpperCase();
        const exportName = `${nomExport}_${suffix}`;
        const blocks = act.keys.map((k) => {
            const pos = positions.find((p) => p.key === k);
            if (!pos) throw new Error(`${cheminSource}: cle manquante ${k}`);
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
        cheminSource,
        `${importLines.join('\n')}\n\nexport const ${nomExport} = {\n${spreadLines.join('\n')}\n};\n`
    );
}

splitObjetParCles('js/histoire-textes/cutscenes-post-monde.js', 'CUTSCENES_POST_MONDE', [
    {
        file: 'cutscenes-post-monde-prologue.js',
        keys: ['monde_prologue', 'monde_lave', 'monde_rouille'],
    },
    {
        file: 'cutscenes-post-monde-ocean.js',
        keys: ['monde_ocean', 'monde_foret', 'monde_glace'],
    },
    {
        file: 'cutscenes-post-monde-desert.js',
        keys: ['monde_desert', 'monde_eclipse', 'monde_cyber'],
    },
    {
        file: 'cutscenes-post-monde-cosmos.js',
        keys: ['monde_fuochi', 'monde_cosmos', 'monde_vide'],
    },
    {
        file: 'cutscenes-post-monde-finale.js',
        keys: ['monde_miroir', 'monde_trame', 'monde_paradoxe'],
    },
]);

splitObjetParCles('js/histoire-textes/cutscenes-boss-victoire.js', 'CUTSCENES_VICTOIRE_BOSS', [
    {
        file: 'cutscenes-boss-victoire-gardiens.js',
        keys: ['brasier', 'sentinelle', 'archiviste', 'avantgarde'],
    },
    {
        file: 'cutscenes-boss-victoire-distorsion.js',
        keys: ['distorsion_normal', 'distorsion_vrai', 'distorsion_secret'],
    },
]);

const introSrc = readFileSync('js/histoire-textes/intro-interludes.js', 'utf8');
const interludeStart = introSrc.indexOf(
    '// ============================================================\n// INTERLUDES'
);
const outroStart = introSrc.indexOf(
    '// ============================================================\n// OUTROS'
);

writeFileSync(
    'js/histoire-textes/intro-histoire.js',
    introSrc.slice(0, interludeStart).trimEnd() + '\n'
);
writeFileSync(
    'js/histoire-textes/interludes.js',
    introSrc
        .slice(interludeStart, outroStart)
        .replace(/^\/\/ =+\n\/\/ INTERLUDES[^\n]*\n\/\/ =+\n/, '')
        .trimEnd() + '\n'
);
writeFileSync(
    'js/histoire-textes/outro-fins.js',
    introSrc
        .slice(outroStart)
        .replace(/^\/\/ =+\n\/\/ OUTROS[^\n]*\n\/\/ =+\n/, '')
        .trimEnd() + '\n'
);
writeFileSync(
    'js/histoire-textes/intro-interludes.js',
    `export { INTRO_HISTOIRE } from './intro-histoire.js';\n` +
        `export { INTERLUDES } from './interludes.js';\n` +
        `export { OUTRO_FINS } from './outro-fins.js';\n`
);

console.log('Split textes narratifs OK');
