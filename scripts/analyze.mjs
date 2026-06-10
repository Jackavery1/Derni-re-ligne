import * as esbuild from 'esbuild';
import { writeFileSync, readdirSync, readFileSync, statSync, mkdirSync } from 'fs';
import { join, relative } from 'path';

const racine = '.';

function listerFichiersJs(dossier) {
    /** @type {string[]} */
    const fichiers = [];
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, entree.name);
        if (entree.isDirectory()) {
            fichiers.push(...listerFichiersJs(chemin));
        } else if (entree.name.endsWith('.js')) {
            fichiers.push(chemin);
        }
    }
    return fichiers;
}

function compterLignes(chemin) {
    return readFileSync(chemin, 'utf8').split('\n').length;
}

const modules = listerFichiersJs('js')
    .map((chemin) => {
        const rel = relative(racine, chemin).replace(/\\/g, '/');
        const lignes = compterLignes(chemin);
        const octets = statSync(chemin).size;
        return { chemin: rel, lignes, octets };
    })
    .sort((a, b) => b.lignes - a.lignes);

mkdirSync('dist', { recursive: true });
writeFileSync(
    'dist/modules-index.json',
    JSON.stringify({ genere: new Date().toISOString(), modules }, null, 2)
);

const hotspots = modules.filter((m) => m.lignes > 450);
const md = [
    '# Index des modules JS',
    '',
    `Généré par \`npm run analyze\` — ${modules.length} fichiers sous \`js/\`.`,
    '',
    '## Hotspots (> 450 lignes)',
    '',
    '| Module | Lignes |',
    '| ------ | ------ |',
    ...hotspots.map((m) => `| \`${m.chemin}\` | ${m.lignes} |`),
    '',
    '## Tous les modules',
    '',
    '| Module | Lignes | Taille |',
    '| ------ | ------ | ------ |',
    ...modules.map((m) => `| \`${m.chemin}\` | ${m.lignes} | ${Math.round(m.octets / 1024)} Ko |`),
    '',
].join('\n');

writeFileSync('docs/modules-index.md', md);

const result = await esbuild.build({
    entryPoints: ['js/main.js'],
    bundle: true,
    outfile: 'dist/analyze-bundle.js',
    format: 'esm',
    minify: true,
    metafile: true,
    write: false,
    target: ['es2022'],
    logLevel: 'silent',
});

writeFileSync('dist/metafile.json', JSON.stringify(result.metafile, null, 2));

const inputs = Object.entries(result.metafile.inputs)
    .map(([chemin, info]) => ({ chemin, octets: info.bytes }))
    .sort((a, b) => b.octets - a.octets);

console.log('Top 15 modules par taille (bundle prod) :');
inputs.slice(0, 15).forEach(({ chemin, octets }) => {
    console.log(`  ${String(Math.round(octets / 1024)).padStart(4)} Ko  ${chemin}`);
});

console.log(
    `\nTotal bundle : ${Math.round(result.metafile.outputs['dist/analyze-bundle.js'].bytes / 1024)} Ko`
);
console.log(`Index modules : ${modules.length} fichiers → docs/modules-index.md`);
if (hotspots.length > 0) {
    console.log(`Hotspots (>450 lignes) : ${hotspots.length}`);
}
console.log('Détail complet : dist/metafile.json, dist/modules-index.json');
