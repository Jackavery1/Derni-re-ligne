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
    './html/controles.html',
    './html/ecran-achievements.html',
    './html/ecran-codex.html',
    './html/ecran-game-over-coop.html',
    './html/ecran-game-over.html',
    './html/ecran-options.html',
    './html/ecran-pause-coop.html',
    './html/ecran-pause.html',
    './html/ecran-profil.html',
    './html/ecran-selection.html',
    './html/ecran-titre.html',
    './html/interface-jeu-coop.html',
    './html/interface-jeu.html',
    './html/overlays.html',
    './js/achievements.js',
    './js/actions-jeu.js',
    './js/annonces.js',
    './js/audio.js',
    './js/biomes.js',
    './js/boucle-jeu.js',
    './js/charger-ecrans.js',
    './js/codex-donnees.js',
    './js/codex-illustrations.js',
    './js/codex.js',
    './js/config-jeu.js',
    './js/config.js',
    './js/constellation.js',
    './js/contenu-jeu.js',
    './js/coop-input.js',
    './js/coop-jeu.js',
    './js/coop-logique.js',
    './js/coop-rendu.js',
    './js/decorations-jeu.js',
    './js/ecrans-config.js',
    './js/ecrans-ui.js',
    './js/hud-jeu.js',
    './js/input-jeu.js',
    './js/layout-jeu.js',
    './js/logger.js',
    './js/logique-partie.js',
    './js/logique-pure.js',
    './js/main.js',
    './js/melodie.js',
    './js/menu-fond.js',
    './js/meteo.js',
    './js/moteur-piece.js',
    './js/moteur.js',
    './js/navigation-ecrans.js',
    './js/options-ui.js',
    './js/oracle-jeu.js',
    './js/particules-jeu.js',
    './js/partie.js',
    './js/piece-jeu.js',
    './js/profil-jeu.js',
    './js/progression.js',
    './js/reliques.js',
    './js/rendu-ambiance.js',
    './js/rendu-blocs-styles.js',
    './js/rendu-blocs-utils.js',
    './js/rendu-blocs.js',
    './js/rendu-cellule.js',
    './js/rendu-fx.js',
    './js/rendu-jeu.js',
    './js/rendu-plateau.js',
    './js/rendu-previews.js',
    './js/store-jeu.js',
    './js/themes-biome.js',
    './js/types.js',
    './js/ui-init.js',
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
