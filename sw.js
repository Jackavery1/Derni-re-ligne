// Versions du cache — bumper VERSION_SHELL a chaque livraison ; VERSION_MEDIAS si le format medias change.
const VERSION_SHELL = 'dl-shell-v80';
const VERSION_MEDIAS = 'dl-medias-v8';

/** Precache install : splash, CSS cutscenes (+ partials DEV), scènes prologue (parcours early). */
const SCENES_CUTSCENE_INSTALL = [
    './assets/splash-chargement.png',
    './assets/cutscenes/cutscenes.css',
    './assets/cutscenes/cutscenes-structure.css',
    './assets/cutscenes/cutscenes-dialogue-layout.css',
    './assets/cutscenes/cutscenes-themes.css',
    './assets/cutscenes/cutscenes-typo-controles.css',
    './assets/cutscenes/cutscenes-responsive.css',
    './assets/cutscenes/cutscenes-journal.css',
    './assets/cutscenes/scene_observatoire.png',
    './assets/cutscenes/scene_labo.png',
    './assets/cutscenes/scene_trame.png',
    './assets/cutscenes/scene_fragmentation.png',
    './assets/cutscenes/scene_seuil_brasier.png',
    './assets/cutscenes/scene_interlude_gardiens.png',
    './assets/cutscenes/scene_interlude_elle.png',
];

/** Precache différé post-boot (idle) — scènes eager hors prologue. */
const SCENES_CUTSCENE_ARRIERE_PLAN = [
    './assets/cutscenes/scene_seuil_sentinelle.png',
    './assets/cutscenes/scene_seuil_archiviste.png',
    './assets/cutscenes/scene_seuil_avantgarde.png',
    './assets/cutscenes/scene_antre_distorsion.png',
    './assets/cutscenes/scene_miroir.png',
    './assets/cutscenes/scene_trame_primordiale.png',
    './assets/cutscenes/scene_interlude_veille.png',
    './assets/cutscenes/scene_fin_crepuscule.png',
    './assets/cutscenes/scene_fin_lumineuse.png',
    './assets/cutscenes/scene_fin_recommencement.png',
    './assets/cutscenes/scene_vide_errance.png',
];

/** PNG portraits cutscene — aligné sur js/portraits-precache.js */
const PORTRAITS_SHELL_PRECACHE = ['./img/vera.png'];

const MAX_PISTES_EN_CACHE = 12;
const META_ORDRE_MUSIQUE = './__meta_ordre_musique__';

importScripts('./sw-precache.js');

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
    const reponseCache = await chercherDansCache(evenement.request, VERSION_MEDIAS);

    if (reponseCache) return reponseCache;

    // Partials CSS cutscenes (DEV @import) peuvent aussi etre dans le shell.
    if (/\.css$/.test(new URL(evenement.request.url).pathname)) {
        const shellHit = await chercherDansCache(evenement.request, VERSION_SHELL);
        if (shellHit) return shellHit;
    }

    const cache = await caches.open(VERSION_MEDIAS);
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

/** @param {string[]} urls */
async function precacherUrlsMedias(urls) {
    const cache = await caches.open(VERSION_MEDIAS);
    await Promise.all(
        urls.map(async (url) => {
            try {
                const reponse = await fetch(url);
                if (reponse.ok) await cache.put(url, reponse);
            } catch {
                /* ignore — fallback runtime */
            }
        })
    );
}

self.addEventListener('install', (evenement) => {
    evenement.waitUntil(
        Promise.all([
            caches
                .open(VERSION_SHELL)
                .then((cache) => cache.addAll([...FICHIERS_A_CACHER, ...PORTRAITS_SHELL_PRECACHE])),
            caches.open(VERSION_MEDIAS).then((cache) => cache.addAll(SCENES_CUTSCENE_INSTALL)),
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
    if (evenement.data?.type === 'PRECACHE_SCENES_ARRIERE_PLAN') {
        evenement.waitUntil(precacherUrlsMedias(SCENES_CUTSCENE_ARRIERE_PLAN));
    }
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
