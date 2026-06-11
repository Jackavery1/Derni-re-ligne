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

const dist = 'dist';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

execSync('node scripts/exporter-donnees-json.mjs', { stdio: 'inherit' });

rmSync(dist, { recursive: true, force: true });
mkdirSync(`${dist}/js`, { recursive: true });
mkdirSync(`${dist}/data`, { recursive: true });

cpSync('data', `${dist}/data`, { recursive: true });

await esbuild.build({
    entryPoints: ['js/main.js'],
    bundle: true,
    splitting: true,
    format: 'esm',
    outdir: `${dist}/js`,
    entryNames: 'bundle',
    chunkNames: 'chunk-[hash]',
    minify: true,
    sourcemap: true,
    target: ['es2022'],
    logLevel: 'info',
});

cpSync('styles', `${dist}/styles`, { recursive: true });
cpSync('html', `${dist}/html`, { recursive: true });
cpSync('fonts', `${dist}/fonts`, { recursive: true });
if (existsSync('assets')) cpSync('assets', `${dist}/assets`, { recursive: true });
cpSync('manifest.json', `${dist}/manifest.json`);
cpSync('img', `${dist}/img`, { recursive: true });

const bundlePath = `${dist}/js/bundle.js`;
const bundleIntegrity =
    'sha384-' + createHash('sha384').update(readFileSync(bundlePath)).digest('base64');

const html = readFileSync('index.html', 'utf8');
writeFileSync(
    `${dist}/index.html`,
    html.replace(
        /<script type="module" src="js\/main\.js\?v=[^"']+"><\/script>/,
        `<script type="module" src="js/bundle.js" integrity="${bundleIntegrity}" crossorigin="anonymous"></script>`
    )
);

cpSync('sw.js', `${dist}/sw.js`);
execSync('node scripts/generer-precache.mjs --prod', { stdio: 'inherit' });

const jsFiles = readdirSync(`${dist}/js`).filter((f) => f.endsWith('.js') && !f.endsWith('.map'));

console.log(`Build prod → ${dist}/ (bundle + ${jsFiles.length - 1} chunks, SW a deux etages)`);
