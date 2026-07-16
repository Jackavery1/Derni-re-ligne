import { createHash } from 'crypto';
import * as esbuild from 'esbuild';
import {
    cpSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    rmSync,
    readdirSync,
    existsSync,
} from 'fs';
import { execSync } from 'child_process';
import { optionsCommunesProd } from './esbuild-prod-options.mjs';
import { listerSortiesTestUniquement } from './budget-exclus-test.mjs';

const dist = 'dist';

execSync('node scripts/compresser-icones.mjs', { stdio: 'inherit' });
execSync('node scripts/compresser-images-ui.mjs', { stdio: 'inherit' });
execSync('node scripts/exporter-donnees-json.mjs', { stdio: 'inherit' });

rmSync(dist, { recursive: true, force: true });
mkdirSync(`${dist}/js`, { recursive: true });
mkdirSync(`${dist}/data`, { recursive: true });

cpSync('data', `${dist}/data`, { recursive: true });
execSync('node scripts/minifier-json-dist.mjs', { stdio: 'inherit' });

const buildResult = await esbuild.build({
    ...optionsCommunesProd,
    entryPoints: {
        bundle: 'js/main.js',
        'neo-test-init': 'js/moteur/neo-test-init.js',
        'dev-init': 'js/logique/dev-init.js',
    },
    outdir: `${dist}/js`,
    entryNames: '[name]',
    chunkNames: 'chunk-[hash]',
    sourcemap: false,
    logLevel: 'info',
});

writeFileSync(`${dist}/js/metafile.json`, JSON.stringify(buildResult.metafile));

writeFileSync(
    `${dist}/js/budget-exclus.json`,
    JSON.stringify(listerSortiesTestUniquement(buildResult.metafile), null, 0)
);

cpSync('styles', `${dist}/styles`, { recursive: true });
execSync('node scripts/compresser-css.mjs', { stdio: 'inherit' });
cpSync('html', `${dist}/html`, { recursive: true });
if (existsSync('assets')) {
    cpSync('assets', `${dist}/assets`, {
        recursive: true,
        filter: (src) => {
            const bas = src.toLowerCase();
            if (bas.endsWith('.wav') || bas.endsWith('.ttf')) return false;
            return true;
        },
    });
}
execSync('node scripts/bundler-cutscenes-css.mjs dist/assets/cutscenes', { stdio: 'inherit' });
cpSync('manifest.json', `${dist}/manifest.json`);
cpSync('img', `${dist}/img`, { recursive: true });

const bundlePath = `${dist}/js/bundle.js`;
const bundleIntegrity =
    'sha384-' + createHash('sha384').update(readFileSync(bundlePath)).digest('base64');

const html = readFileSync('index.html', 'utf8');
writeFileSync(
    `${dist}/index.html`,
    html
        .replace(
            /<script type="module" src="js\/main\.js\?v=[^"']+"><\/script>/,
            `<script type="module" src="js/bundle.js" integrity="${bundleIntegrity}" crossorigin="anonymous"></script>`
        )
        .replace(
            /\n?\s*<script type="module" src="js\/moteur\/neo-test-init\.js[^"]*"><\/script>/,
            ''
        )
);

cpSync('sw.js', `${dist}/sw.js`);
cpSync('sw-precache.js', `${dist}/sw-precache.js`);
cpSync('sw-precache-list.js', `${dist}/sw-precache-list.js`);
execSync('node scripts/generer-precache.mjs --prod', { stdio: 'inherit' });

const jsFiles = readdirSync(`${dist}/js`).filter((f) => f.endsWith('.js') && !f.endsWith('.map'));

console.log(`Build prod → ${dist}/ (bundle + ${jsFiles.length - 1} chunks, SW a deux etages)`);
