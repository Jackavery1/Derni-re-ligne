const VERSION_CACHE = 'derniere-ligne-2.5.9-r5';

const FICHIERS_A_CACHER = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './styles/objectifs-histoire.css',
    './fonts/PressStart2P-Regular.ttf',
    './img/icon-192.png',
    './img/icon-512.png',
    './img/icon-maskable-512.png',
    './img/robo-accueil.png',
    './img/robo-favicon.png',
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
    './js/accessibilite.js',
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
    './js/audio-partie.js',
    './js/audio.js',
    './js/biome-fond.js',
    './js/biomes-histoire.js',
    './js/biomes.js',
    './js/boss-attaques.js',
    './js/boss-dialogues.js',
    './js/boss-jeu.js',
    './js/boss-rendu.js',
    './js/boucle-jeu.js',
    './js/bus-jeu.js',
    './js/charger-ecrans.js',
    './js/charger-histoire-textes.js',
    './js/codex-donnees.js',
    './js/codex-histoire.js',
    './js/codex-illustrations-histoire.js',
    './js/codex-illustrations.js',
    './js/codex.js',
    './js/conditions-secrets.js',
    './js/config-jeu.js',
    './js/config.js',
    './js/constellation-rendu.js',
    './js/constellation.js',
    './js/contenu-jeu.js',
    './js/coop-carte-das.js',
    './js/coop-das.js',
    './js/coop-input.js',
    './js/coop-jeu.js',
    './js/coop-logique.js',
    './js/coop-rendu.js',
    './js/deblocage-ui.js',
    './js/decorations-jeu.js',
    './js/dom-utils.js',
    './js/ecrans-config.js',
    './js/ecrans-ui.js',
    './js/effets-partie.js',
    './js/expressions-cutscene.js',
    './js/file-narrative.js',
    './js/fin-bg-rendu.js',
    './js/fins-histoire.js',
    './js/gestionnaire-difficulte.js',
    './js/histoire-actions.js',
    './js/histoire-cutscene-config.js',
    './js/histoire-cutscene-fonds.js',
    './js/histoire-cutscene-nav.js',
    './js/histoire-cutscene-portraits.js',
    './js/histoire-cutscene-typewriter.js',
    './js/histoire-cutscene-ui.js',
    './js/histoire-cutscene.js',
    './js/histoire-donnees.js',
    './js/histoire-etat.js',
    './js/histoire-illustrations.js',
    './js/histoire-intro.js',
    './js/histoire-journal-ui.js',
    './js/histoire-manager-completion.js',
    './js/histoire-manager-ui.js',
    './js/histoire-manager.js',
    './js/histoire-map-camera.js',
    './js/histoire-map-fond.js',
    './js/histoire-map-noeuds.js',
    './js/histoire-map-rendu.js',
    './js/histoire-map-ui.js',
    './js/histoire-map.js',
    './js/histoire-mondes.js',
    './js/histoire-narratif.js',
    './js/histoire-session.js',
    './js/histoire-textes.js',
    './js/hud-jeu.js',
    './js/input-jeu.js',
    './js/input-repetition.js',
    './js/layout-calcul.js',
    './js/layout-jeu.js',
    './js/logger.js',
    './js/logique-partie.js',
    './js/logique-pure.js',
    './js/main.js',
    './js/mascotte-robo.js',
    './js/mecaniques-histoire.js',
    './js/melodie.js',
    './js/menu-fond.js',
    './js/meteo.js',
    './js/mode-dev-etat.js',
    './js/mode-developpeur.js',
    './js/mode-histoire.js',
    './js/monde-paradoxe-etat.js',
    './js/monde-paradoxe.js',
    './js/moteur-config-actions.js',
    './js/moteur-init-interface.js',
    './js/moteur-init-systemes.js',
    './js/moteur-piece.js',
    './js/moteur.js',
    './js/navigation-ecrans.js',
    './js/notifications-file.js',
    './js/options-ui.js',
    './js/oracle-jeu.js',
    './js/particules-jeu.js',
    './js/partie-canvas.js',
    './js/partie-fin-commun.js',
    './js/partie-fin.js',
    './js/partie.js',
    './js/piece-jeu.js',
    './js/portraits-cutscene-etat.js',
    './js/portraits-cutscene-personnages.js',
    './js/portraits-cutscene-utils.js',
    './js/portraits-cutscene.js',
    './js/portraits-vera.js',
    './js/profil-jeu.js',
    './js/profil-rendu.js',
    './js/progression-histoire.js',
    './js/progression-records.js',
    './js/progression-stockage.js',
    './js/progression.js',
    './js/reactions-boss-portrait.js',
    './js/registre-modes.js',
    './js/reliques.js',
    './js/rendu-accessibilite.js',
    './js/rendu-ambiance-fonds.js',
    './js/rendu-ambiance-histoire.js',
    './js/rendu-ambiance-particules.js',
    './js/rendu-ambiance.js',
    './js/rendu-blocs-styles.js',
    './js/rendu-blocs-utils.js',
    './js/rendu-blocs.js',
    './js/rendu-cellule.js',
    './js/rendu-fond-biome.js',
    './js/rendu-fx.js',
    './js/rendu-jeu.js',
    './js/rendu-motifs-biome.js',
    './js/rendu-plateau.js',
    './js/rendu-previews.js',
    './js/rendu-robo.js',
    './js/rendu-vivant.js',
    './js/scenes-cutscene.js',
    './js/score-partie.js',
    './js/store-core.js',
    './js/store-etat-partie.js',
    './js/store-histoire.js',
    './js/store-jeu.js',
    './js/store-refs-canvas.js',
    './js/texte-jeu.js',
    './js/themes-biome.js',
    './js/tutoriel.js',
    './js/types.js',
    './js/ui-boutons-histoire.js',
    './js/ui-boutons-navigation.js',
    './js/ui-boutons-partie.js',
    './js/ui-init.js',
    './js/ui-notifications.js',
    './js/ui-panneau-objectifs.js',
    './js/vivant-strategies.js',
    './js/vivant.js',
    './data/histoire-textes.json',
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
    const estHtmlOuCss = /\.(html|css)$/.test(url.pathname);

    evenement.respondWith(
        chercherDansCache(evenement.request).then((reponseCache) => {
            const prefererReseau = (estModuleJeu || estHtmlOuCss) && navigator.onLine;
            if (reponseCache && !prefererReseau) {
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
