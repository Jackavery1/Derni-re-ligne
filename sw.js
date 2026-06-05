const VERSION_CACHE = 'tetris-neo-2.4.2';

const FICHIERS_A_CACHER = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png',
    './fonts/PressStart2P-Regular.ttf',
    './html/ecran-titre.html',
    './html/ecran-achievements.html',
    './html/ecran-profil.html',
    './html/ecran-codex.html',
    './html/ecran-selection.html',
    './html/ecran-options.html',
    './html/ecran-pause.html',
    './html/ecran-game-over.html',
    './html/overlays.html',
    './html/interface-jeu.html',
    './html/controles.html',
    './js/config.js',
    './js/config-jeu.js',
    './js/biomes.js',
    './js/contenu-jeu.js',
    './js/logique-pure.js',
    './js/logger.js',
    './js/audio.js',
    './js/progression.js',
    './js/store-jeu.js',
    './js/actions-jeu.js',
    './js/charger-ecrans.js',
    './js/rendu-blocs.js',
    './js/rendu-blocs-utils.js',
    './js/rendu-blocs-styles.js',
    './js/constellation.js',
    './js/meteo.js',
    './js/reliques.js',
    './js/contexte-jeu.js',
    './js/piece-jeu.js',
    './js/rendu-jeu.js',
    './js/particules-jeu.js',
    './js/logique-partie.js',
    './js/melodie.js',
    './js/achievements.js',
    './js/decorations-jeu.js',
    './js/profil-jeu.js',
    './js/codex-donnees.js',
    './js/codex-illustrations.js',
    './js/codex.js',
    './js/boucle-jeu.js',
    './js/ecrans-ui.js',
    './js/partie.js',
    './js/menu-fond.js',
    './js/input-jeu.js',
    './js/layout-jeu.js',
    './js/options-ui.js',
    './js/ui-init.js',
    './js/moteur.js',
    './js/main.js',
];

self.addEventListener('install', (evenement) => {
    evenement.waitUntil(
        caches
            .open(VERSION_CACHE)
            .then((cache) => cache.addAll(FICHIERS_A_CACHER))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (evenement) => {
    evenement.waitUntil(
        caches
            .keys()
            .then((cles) =>
                Promise.all(
                    cles.filter((cle) => cle !== VERSION_CACHE).map((cle) => caches.delete(cle))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (evenement) => {
    if (evenement.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (evenement) => {
    if (evenement.request.method !== 'GET') return;

    const url = new URL(evenement.request.url);
    const estModuleJeu = url.pathname.startsWith('/js/') && /\.js$/.test(url.pathname);

    evenement.respondWith(
        caches.match(evenement.request).then((reponseCache) => {
            if (reponseCache && !estModuleJeu) return reponseCache;

            return fetch(evenement.request)
                .then((reponseReseau) => {
                    if (
                        !reponseReseau ||
                        reponseReseau.status !== 200 ||
                        reponseReseau.type === 'error'
                    ) {
                        return reponseReseau ?? reponseCache;
                    }

                    if (evenement.request.url.startsWith(self.location.origin)) {
                        const copie = reponseReseau.clone();
                        caches
                            .open(VERSION_CACHE)
                            .then((cache) => cache.put(evenement.request, copie));
                    }

                    return reponseReseau;
                })
                .catch(() => {
                    if (reponseCache) return reponseCache;
                    if (evenement.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
        })
    );
});
