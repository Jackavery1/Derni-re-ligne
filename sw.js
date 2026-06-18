// Versions du cache — bumper VERSION_SHELL a chaque livraison ; VERSION_MEDIAS si le format medias change.
const VERSION_SHELL = 'dl-shell-v51';
const VERSION_MEDIAS = 'dl-medias-v4';

const SCENES_CUTSCENE_PRECACHE = [
    './assets/splash-chargement.png',
    './assets/cutscenes/cutscenes.css',
    './assets/cutscenes/scene_observatoire.png',
    './assets/cutscenes/scene_labo.png',
    './assets/cutscenes/scene_trame.png',
    './assets/cutscenes/scene_fragmentation.png',
    './assets/cutscenes/scene_seuil_brasier.png',
    './assets/cutscenes/scene_seuil_sentinelle.png',
    './assets/cutscenes/scene_seuil_archiviste.png',
    './assets/cutscenes/scene_seuil_avantgarde.png',
];

const MAX_PISTES_EN_CACHE = 12;
const META_ORDRE_MUSIQUE = './__meta_ordre_musique__';

const FICHIERS_A_CACHER = [
    /* PRECACHE:DEBUT */
    './',
    './index.html',
    './manifest.json',
    './styles/base.css',
    './styles/boss.css',
    './styles/boutons-verrouilles.css',
    './styles/controles-tactiles.css',
    './styles/ecran-chargement.css',
    './styles/ecran-game-over.css',
    './styles/ecran-pause.css',
    './styles/ecran-selection.css',
    './styles/ecran-titre.css',
    './styles/ecrans-base.css',
    './styles/interface-jeu.css',
    './styles/main.css',
    './styles/mecaniques-histoire.css',
    './styles/menu-narratif.css',
    './styles/mode-architecte.css',
    './styles/mode-histoire.css',
    './styles/objectifs-histoire.css',
    './styles/overlays-meta.css',
    './styles/responsive.css',
    './styles/typographie.css',
    './styles/variables.css',
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
    './data/achievements-core.json',
    './data/achievements-histoire.json',
    './data/archi-niveaux.json',
    './data/biomes.json',
    './data/codex-textes.json',
    './data/contenu-jeu.json',
    './data/difficulte-mondes.json',
    './data/histoire-donnees.json',
    './data/histoire-textes.json',
    './data/icones-pixel.json',
    './assets/polices/crimson-pro-latin-400-italic.woff2',
    './assets/polices/crimson-pro-latin-400-normal.woff2',
    './assets/polices/orbitron-latin-600-normal.woff2',
    './assets/polices/orbitron-latin-700-normal.woff2',
    './assets/polices/press-start-2p-latin-400-normal.woff2',
    './assets/polices/rajdhani-latin-400-normal.woff2',
    './assets/polices/rajdhani-latin-500-normal.woff2',
    './assets/polices/rajdhani-latin-600-normal.woff2',
    './assets/polices/rajdhani-latin-700-normal.woff2',
    './js/accessibilite.js',
    './js/achievements-conditions-core.js',
    './js/achievements-conditions-histoire.js',
    './js/achievements-donnees.js',
    './js/achievements-histoire.js',
    './js/achievements-icones-map.js',
    './js/achievements-progres.js',
    './js/achievements-stats.js',
    './js/achievements-ui.js',
    './js/achievements.js',
    './js/actions-jeu.js',
    './js/actions-piece-communes.js',
    './js/annonces.js',
    './js/archi-apercu-silhouette.js',
    './js/archi-donnees.js',
    './js/archi-filtre-difficulte.js',
    './js/archi-generateur.js',
    './js/archi-icones-map.js',
    './js/archi-input.js',
    './js/archi-jeu.js',
    './js/archi-logique.js',
    './js/archi-niveaux-loader.js',
    './js/archi-partie.js',
    './js/archi-rendu.js',
    './js/archi-selection.js',
    './js/audio-donnees.js',
    './js/audio-effets.js',
    './js/audio-fallback-biomes.js',
    './js/audio-fichiers-musique.js',
    './js/audio-mix-biome.js',
    './js/audio-musique.js',
    './js/audio-partie.js',
    './js/audio.js',
    './js/biome-fond.js',
    './js/biome-icones-map.js',
    './js/biomes.js',
    './js/boss-attaques.js',
    './js/boss-combat.js',
    './js/boss-dialogues.js',
    './js/boss-jeu-constantes.js',
    './js/boss-jeu.js',
    './js/boss-rendu.js',
    './js/boss-ui-hud.js',
    './js/boucle-jeu.js',
    './js/bus-jeu.js',
    './js/charger-ecrans.js',
    './js/charger-feuille-style.js',
    './js/charger-histoire-textes.js',
    './js/codex-conditions.js',
    './js/codex-donnees.js',
    './js/codex-histoire.js',
    './js/codex-icones-map.js',
    './js/codex-illustrations-histoire.js',
    './js/codex-illustrations.js',
    './js/codex-types.js',
    './js/codex.js',
    './js/conditions-secrets.js',
    './js/config-jeu.js',
    './js/config-sync.js',
    './js/config.js',
    './js/constellation-panneau.js',
    './js/constellation-rendu.js',
    './js/constellation-zone.js',
    './js/constellation.js',
    './js/contenu-jeu.js',
    './js/controles-tactiles.js',
    './js/coop-carte-das.js',
    './js/coop-das.js',
    './js/coop-etat.js',
    './js/coop-input.js',
    './js/coop-jeu.js',
    './js/coop-lignes-score.js',
    './js/coop-logique.js',
    './js/coop-preference.js',
    './js/coop-rendu.js',
    './js/deblocage-ui.js',
    './js/decorations-jeu.js',
    './js/decorations-trainees.js',
    './js/defi-jour.js',
    './js/difficulte-mondes-chargement.js',
    './js/dom-utils.js',
    './js/ecran-chargement.js',
    './js/ecrans-config.js',
    './js/ecrans-ui.js',
    './js/effets-partie.js',
    './js/expressions-cutscene.js',
    './js/file-narrative.js',
    './js/fin-bg-rendu.js',
    './js/fins-histoire.js',
    './js/fond-ecrans-meta.js',
    './js/gestionnaire-difficulte.js',
    './js/haptique.js',
    './js/histoire-actions.js',
    './js/histoire-boss-continue.js',
    './js/histoire-cutscene-config.js',
    './js/histoire-cutscene-fonds.js',
    './js/histoire-cutscene-moteur.js',
    './js/histoire-cutscene-nav.js',
    './js/histoire-cutscene-portraits.js',
    './js/histoire-cutscene-typewriter.js',
    './js/histoire-cutscene-ui.js',
    './js/histoire-cutscene.js',
    './js/histoire-donnees-chargement.js',
    './js/histoire-donnees.js',
    './js/histoire-etat.js',
    './js/histoire-illustrations.js',
    './js/histoire-intro.js',
    './js/histoire-journal-ui.js',
    './js/histoire-manager-completion.js',
    './js/histoire-manager-post-monde.js',
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
    './js/histoire-navigation.js',
    './js/histoire-session.js',
    './js/histoire-textes.fallback.js',
    './js/histoire-textes.fallback.stub.js',
    './js/histoire-textes.js',
    './js/hud-jeu.js',
    './js/icones-pixel.js',
    './js/infobulles-contexte.js',
    './js/input-gamepad.js',
    './js/input-jeu.js',
    './js/input-repetition.js',
    './js/layout-calcul.js',
    './js/layout-jeu.js',
    './js/leaderboard-cloud.js',
    './js/logger.js',
    './js/logique-partie-hold.js',
    './js/logique-partie-mouvement.js',
    './js/logique-partie-pose.js',
    './js/logique-partie-score.js',
    './js/logique-partie-verrouillage.js',
    './js/logique-partie.js',
    './js/logique-pure.js',
    './js/main.js',
    './js/mascotte-robo.js',
    './js/mecaniques-histoire.js',
    './js/melodie.js',
    './js/menu-fond.js',
    './js/menu-titre-campagne.js',
    './js/meteo.js',
    './js/mode-defi-jour.js',
    './js/mode-dev-etat.js',
    './js/mode-developpeur.js',
    './js/mode-histoire.js',
    './js/mode-sprint.js',
    './js/modes-input-lazy.js',
    './js/monde-paradoxe-etat.js',
    './js/monde-paradoxe.js',
    './js/moteur-config-actions.js',
    './js/moteur-init-interface.js',
    './js/moteur-init-systemes.js',
    './js/moteur-piece.js',
    './js/moteur.js',
    './js/navigation-ecrans.js',
    './js/navigation-lazy.js',
    './js/neo-test-api.js',
    './js/notifications-file.js',
    './js/options-progression-ui.js',
    './js/options-sync-cloud-ui.js',
    './js/options-ui.js',
    './js/oracle-jeu.js',
    './js/particules-jeu.js',
    './js/partie-canvas.js',
    './js/partie-fin-commun.js',
    './js/partie-fin.js',
    './js/partie.js',
    './js/piece-jeu.js',
    './js/planificateur-raf.js',
    './js/portrait-archiviste-rendu.js',
    './js/portrait-avantgarde-rendu.js',
    './js/portrait-brasier-rendu.js',
    './js/portrait-distorsion-rendu.js',
    './js/portrait-rendu-utils.js',
    './js/portrait-sentinelle-rendu.js',
    './js/portrait-vera-assets.js',
    './js/portrait-vera-buste.js',
    './js/portrait-vera-donnees.js',
    './js/portrait-vera-effets.js',
    './js/portrait-vera-rendu.js',
    './js/portraits-boss-combat.js',
    './js/portraits-cutscene-etat.js',
    './js/portraits-cutscene-personnages.js',
    './js/portraits-cutscene-utils.js',
    './js/portraits-cutscene.js',
    './js/portraits-vera.js',
    './js/prechargement-medias.js',
    './js/preferences-campagne.js',
    './js/profil-affichage.js',
    './js/profil-donnees.js',
    './js/profil-jeu.js',
    './js/profil-rendu.js',
    './js/progression-export-b10.js',
    './js/progression-histoire.js',
    './js/progression-records.js',
    './js/progression-stockage.js',
    './js/progression-sync-cloud.js',
    './js/progression.js',
    './js/reactions-boss-portrait.js',
    './js/registre-modes.js',
    './js/reinitialiser-campagne.js',
    './js/reliques.js',
    './js/rendu-accessibilite.js',
    './js/rendu-ambiance-fonds.js',
    './js/rendu-ambiance-histoire.js',
    './js/rendu-ambiance-particules-init.js',
    './js/rendu-ambiance-particules.js',
    './js/rendu-ambiance.js',
    './js/rendu-blocs-styles-nature.js',
    './js/rendu-blocs-styles-tech.js',
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
    './js/rendu-robo-corps.js',
    './js/rendu-robo-donnees.js',
    './js/rendu-robo-geometrie.js',
    './js/rendu-robo-mini.js',
    './js/rendu-robo-visage.js',
    './js/rendu-robo.js',
    './js/rendu-vivant.js',
    './js/safe-area.js',
    './js/scenes-cutscene.js',
    './js/score-partie.js',
    './js/store-core.js',
    './js/store-etat-partie.js',
    './js/store-histoire.js',
    './js/store-jeu.js',
    './js/store-refs-canvas.js',
    './js/sw-dev.js',
    './js/texte-jeu.js',
    './js/themes-biome.js',
    './js/timer-niveau.js',
    './js/touches-config.js',
    './js/tutoriel.js',
    './js/types.js',
    './js/ui-boutons-assurer.js',
    './js/ui-boutons-campagne.js',
    './js/ui-boutons-navigation.js',
    './js/ui-boutons-partie.js',
    './js/ui-init.js',
    './js/ui-lier-bouton.js',
    './js/ui-notifications.js',
    './js/ui-objectifs-dom.js',
    './js/ui-objectifs-hud.js',
    './js/ui-panneau-detail.js',
    './js/ui-panneau-objectifs.js',
    './js/ui-raccourcis-histoire.js',
    './js/vivant-strategies.js',
    './js/vivant.js',
    './img/icon-192.png',
    './img/robo-accueil.png',
    /* PRECACHE:FIN */
];

/** @param {string} pathname */
function estCheminMusique(pathname) {
    return pathname.includes('/assets/musique/');
}

/** @param {string} pathname */
function estCheminScene(pathname) {
    return pathname.includes('/assets/cutscenes/');
}

/** @param {string} pathname */
function estCheminSplash(pathname) {
    return pathname.includes('/assets/splash-');
}

/** @param {string} pathname */
function estCheminMedia(pathname) {
    return estCheminMusique(pathname) || estCheminScene(pathname) || estCheminSplash(pathname);
}

/** @param {Request} requete @param {string} nomCache */
async function chercherDansCache(requete, nomCache) {
    const cache = await caches.open(nomCache);
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

/** @param {Cache} cache @param {string} urlAbsolue */
async function evincerPistesMusique(cache, urlAbsolue) {
    const metaReq = new Request(META_ORDRE_MUSIQUE);
    /** @type {string[]} */
    let ordre = [];
    const metaRes = await cache.match(metaReq);
    if (metaRes) {
        try {
            ordre = await metaRes.json();
        } catch {
            ordre = [];
        }
    }

    ordre = ordre.filter((u) => u !== urlAbsolue);
    ordre.push(urlAbsolue);

    while (ordre.length > MAX_PISTES_EN_CACHE) {
        const ancienne = ordre.shift();
        if (!ancienne) break;
        await cache.delete(new Request(ancienne));
        await cache.delete(ancienne);
    }

    await cache.put(
        metaReq,
        new Response(JSON.stringify(ordre), {
            headers: { 'Content-Type': 'application/json' },
        })
    );
}

/**
 * Medias (musique, scenes) : cache-first dans dl-medias, mise en cache a la volee.
 * Lecture audio prevue via fetch + decodeAudioData (Surtension) : pas de Range requests.
 * Aucun element <audio> dans le jeu actuellement.
 *
 * @param {FetchEvent} evenement
 */
async function gererFetchMedia(evenement) {
    const cache = await caches.open(VERSION_MEDIAS);
    const reponseCache = await cache.match(evenement.request);

    if (reponseCache) return reponseCache;

    try {
        const reponseReseau = await fetch(evenement.request);
        if (reponseReseau && reponseReseau.status === 200 && reponseReseau.type !== 'error') {
            const copie = reponseReseau.clone();
            await cache.put(evenement.request, copie);
            if (estCheminMusique(new URL(evenement.request.url).pathname)) {
                await evincerPistesMusique(cache, evenement.request.url);
            }
            return reponseReseau;
        }
        return reponseCache ?? reponseReseau;
    } catch {
        return reponseCache ?? reponseErreurReseau();
    }
}

/** @param {FetchEvent} evenement */
async function gererFetchShell(evenement) {
    const url = new URL(evenement.request.url);
    const estChunkHashe = /\/js\/chunk-[A-Z0-9]+\.js/.test(url.pathname);
    const estNonVersionne = /\.(html|css|js)$/.test(url.pathname) && !estChunkHashe;

    const reponseCache = await chercherDansCache(evenement.request, VERSION_SHELL);
    const prefererReseau = estNonVersionne && navigator.onLine;

    if (reponseCache && !prefererReseau) return reponseCache;

    try {
        const reponseReseau = await fetch(evenement.request);
        if (!reponseReseau || reponseReseau.status !== 200 || reponseReseau.type === 'error') {
            return reponseCache ?? reponseReseau ?? reponseErreurReseau();
        }

        if (evenement.request.url.startsWith(self.location.origin)) {
            const copie = reponseReseau.clone();
            caches.open(VERSION_SHELL).then((c) => c.put(evenement.request, copie));
        }

        return reponseReseau;
    } catch {
        if (reponseCache) return reponseCache;
        if (evenement.request.destination === 'document') {
            return caches.match('./index.html');
        }
        return reponseErreurReseau();
    }
}

function reponseErreurReseau() {
    return new Response('', {
        status: 503,
        statusText: 'Network error',
    });
}

self.addEventListener('install', (evenement) => {
    evenement.waitUntil(
        Promise.all([
            caches.open(VERSION_SHELL).then((cache) => cache.addAll(FICHIERS_A_CACHER)),
            caches.open(VERSION_MEDIAS).then((cache) => cache.addAll(SCENES_CUTSCENE_PRECACHE)),
        ]).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (evenement) => {
    const cachesValides = new Set([VERSION_SHELL, VERSION_MEDIAS]);
    evenement.waitUntil(
        caches
            .keys()
            .then((cles) =>
                Promise.all(
                    cles.filter((cle) => !cachesValides.has(cle)).map((cle) => caches.delete(cle))
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
    if (!evenement.request.url.startsWith(self.location.origin)) return;

    if (estCheminMedia(url.pathname)) {
        evenement.respondWith(gererFetchMedia(evenement));
        return;
    }

    evenement.respondWith(gererFetchShell(evenement));
});
