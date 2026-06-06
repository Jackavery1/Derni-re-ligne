const VERSION_CACHE = 'derniere-ligne-2.5.0';

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
    './html/ecran-archi-resultat.html',
    './html/ecran-archi-selection.html',
    './html/ecran-codex.html',
    './html/ecran-game-over-coop.html',
    './html/ecran-game-over.html',
    './html/ecran-histoire-map.html',
    './html/ecran-options.html',
    './html/ecran-pause-coop.html',
    './html/ecran-pause.html',
    './html/ecran-profil.html',
    './html/ecran-selection.html',
    './html/ecran-titre.html',
    './html/interface-jeu-archi.html',
    './html/interface-jeu-coop.html',
    './html/interface-jeu.html',
    './html/overlays.html',
    './js/achievements-donnees.js',
    './js/achievements-histoire.js',
    './js/achievements.js',
    './js/actions-jeu.js',
    './js/actions-piece-communes.js',
    './js/annonces.js',
    './js/archi-donnees.js',
    './js/archi-input.js',
    './js/archi-jeu.js',
    './js/archi-logique.js',
    './js/archi-rendu.js',
    './js/audio-donnees.js',
    './js/audio-effets.js',
    './js/audio-musique.js',
    './js/audio.js',
    './js/biomes-histoire.js',
    './js/biomes.js',
    './js/boss-jeu.js',
    './js/boss-rendu.js',
    './js/boucle-jeu.js',
    './js/bus-jeu.js',
    './js/charger-ecrans.js',
    './js/codex-donnees.js',
    './js/codex-histoire.js',
    './js/codex-illustrations-histoire.js',
    './js/codex-illustrations.js',
    './js/codex.js',
    './js/conditions-secrets.js',
    './js/config-jeu.js',
    './js/config.js',
    './js/constellation.js',
    './js/contenu-jeu.js',
    './js/coop-input.js',
    './js/coop-jeu.js',
    './js/coop-logique.js',
    './js/coop-rendu.js',
    './js/decorations-jeu.js',
    './js/dom-utils.js',
    './js/ecrans-config.js',
    './js/ecrans-ui.js',
    './js/effets-partie.js',
    './js/fin-bg-rendu.js',
    './js/fins-histoire.js',
    './js/histoire-donnees.js',
    './js/histoire-etat.js',
    './js/histoire-illustrations.js',
    './js/histoire-manager-completion.js',
    './js/histoire-manager-ui.js',
    './js/histoire-manager.js',
    './js/histoire-map-rendu.js',
    './js/histoire-map-ui.js',
    './js/histoire-map.js',
    './js/histoire-narratif.js',
    './js/histoire-textes.js',
    './js/hud-jeu.js',
    './js/input-jeu.js',
    './js/layout-jeu.js',
    './js/logger.js',
    './js/logique-partie.js',
    './js/logique-pure.js',
    './js/main.js',
    './js/mecaniques-histoire.js',
    './js/melodie.js',
    './js/menu-fond.js',
    './js/meteo.js',
    './js/monde-paradoxe.js',
    './js/moteur-piece.js',
    './js/moteur.js',
    './js/navigation-ecrans.js',
    './js/notifications-file.js',
    './js/options-ui.js',
    './js/oracle-jeu.js',
    './js/particules-jeu.js',
    './js/partie.js',
    './js/piece-jeu.js',
    './js/profil-jeu.js',
    './js/profil-rendu.js',
    './js/progression.js',
    './js/reliques.js',
    './js/rendu-ambiance-fonds.js',
    './js/rendu-ambiance-histoire.js',
    './js/rendu-ambiance-particules.js',
    './js/rendu-ambiance.js',
    './js/rendu-blocs-styles.js',
    './js/rendu-blocs-utils.js',
    './js/rendu-blocs.js',
    './js/rendu-cellule.js',
    './js/rendu-fx.js',
    './js/rendu-jeu.js',
    './js/rendu-plateau.js',
    './js/rendu-previews.js',
    './js/rendu-vivant.js',
    './js/store-core.js',
    './js/store-etat-partie.js',
    './js/store-histoire.js',
    './js/store-jeu.js',
    './js/store-refs-canvas.js',
    './js/themes-biome.js',
    './js/tutoriel.js',
    './js/types.js',
    './js/ui-init.js',
    './js/vivant-strategies.js',
    './js/vivant.js',
];

/** @param {Request} requete */
async function chercherDansCache(requete) {
    const cache = await caches.open(VERSION_CACHE);
    const direct = await cache.match(requete);
    if (direct) return direct;

    const url = new URL(requete.url);
    const chemins = [url.pathname, `.${url.pathname}`];
    for (const chemin of chemins) {
        const hit = await cache.match(chemin);
        if (hit) return hit;
    }
    return null;
}

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
    const estModuleJeu = url.pathname.includes('/js/') && /\.js$/.test(url.pathname);

    evenement.respondWith(
        chercherDansCache(evenement.request).then((reponseCache) => {
            if (reponseCache && (!estModuleJeu || !navigator.onLine)) {
                return reponseCache;
            }

            return fetch(evenement.request)
                .then((reponseReseau) => {
                    if (
                        !reponseReseau ||
                        reponseReseau.status !== 200 ||
                        reponseReseau.type === 'error'
                    ) {
                        return reponseCache ?? reponseReseau ?? reponseHorsLigne(evenement.request);
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
                    return reponseHorsLigne(evenement.request);
                });
        })
    );
});

function reponseHorsLigne(_requete) {
    return new Response('Ressource indisponible hors ligne', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
