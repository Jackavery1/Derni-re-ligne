import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';

const dist = 'dist';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

rmSync(dist, { recursive: true, force: true });
mkdirSync(`${dist}/js`, { recursive: true });

await esbuild.build({
    entryPoints: ['js/main.js'],
    bundle: true,
    outfile: `${dist}/js/bundle.js`,
    format: 'esm',
    minify: true,
    sourcemap: true,
    target: ['es2022'],
    logLevel: 'info',
});

cpSync('styles', `${dist}/styles`, { recursive: true });
cpSync('html', `${dist}/html`, { recursive: true });
cpSync('fonts', `${dist}/fonts`, { recursive: true });
cpSync('manifest.json', `${dist}/manifest.json`);
cpSync('icon.svg', `${dist}/icon.svg`);
for (const ic of ['icon-192.png', 'icon-512.png', 'icon-maskable.png']) {
    try {
        cpSync(ic, `${dist}/${ic}`);
    } catch {
        /* optionnel */
    }
}

const html = readFileSync('index.html', 'utf8');
writeFileSync(`${dist}/index.html`, html.replace(/js\/main\.js\?v=[^"']+/, 'js/bundle.js'));

const swDev = readFileSync('sw.js', 'utf8');
const htmlFiles = [...swDev.matchAll(/\.\/html\/[^']+\.html/g)].map((m) => m[0]);
const staticFiles = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './js/bundle.js',
    './js/bundle.js.map',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
    './fonts/PressStart2P-Regular.ttf',
    ...htmlFiles,
];
const bloc = staticFiles.map((f) => `    '${f}',`).join('\n');
writeFileSync(
    `${dist}/sw.js`,
    `const VERSION_CACHE = 'tetris-neo-${pkg.version}-prod';

const FICHIERS_A_CACHER = [
${bloc}
];

self.addEventListener('install', (evenement) => {
    evenement.waitUntil(
        caches.open(VERSION_CACHE).then((cache) => cache.addAll(FICHIERS_A_CACHER)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (evenement) => {
    evenement.waitUntil(
        caches
            .keys()
            .then((cles) =>
                Promise.all(cles.filter((cle) => cle !== VERSION_CACHE).map((cle) => caches.delete(cle)))
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (evenement) => {
    if (evenement.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (evenement) => {
    if (evenement.request.method !== 'GET') return;
    evenement.respondWith(
        caches.match(evenement.request).then((reponseCache) => {
            if (reponseCache) return reponseCache;
            return fetch(evenement.request)
                .then((reponseReseau) => {
                    if (!reponseReseau || reponseReseau.status !== 200 || reponseReseau.type === 'error') {
                        return reponseReseau;
                    }
                    if (evenement.request.url.startsWith(self.location.origin)) {
                        const copie = reponseReseau.clone();
                        caches.open(VERSION_CACHE).then((cache) => cache.put(evenement.request, copie));
                    }
                    return reponseReseau;
                })
                .catch(() => {
                    if (evenement.request.destination === 'document') return caches.match('./index.html');
                });
        })
    );
});
`
);

console.log(`Build prod → ${dist}/ (bundle + ${staticFiles.length} entrées SW)`);
