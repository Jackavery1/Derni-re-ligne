import * as esbuild from 'esbuild';
import { writeFileSync } from 'fs';

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
    `\nTotal : ${Math.round(result.metafile.outputs['dist/analyze-bundle.js'].bytes / 1024)} Ko`
);
console.log('Détail complet : dist/metafile.json');
