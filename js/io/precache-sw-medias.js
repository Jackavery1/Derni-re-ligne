import { logger } from '../io/logger.js';

function planifierIdle(callback) {
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => callback(), { timeout: 8000 });
    } else {
        setTimeout(callback, 2000);
    }
}

function envoyerPrecacheArrierePlan() {
    navigator.serviceWorker.controller?.postMessage({ type: 'PRECACHE_SCENES_ARRIERE_PLAN' });
}

/** Déclenche le remplissage différé du cache médias SW (hors chemin install). */
export function demarrerPrecacheMediasSwArrierePlan() {
    if (!('serviceWorker' in navigator)) return;

    const lancer = () => {
        try {
            if (navigator.serviceWorker.controller) {
                planifierIdle(envoyerPrecacheArrierePlan);
                return;
            }
            void navigator.serviceWorker.ready.then(() =>
                planifierIdle(envoyerPrecacheArrierePlan)
            );
        } catch (err) {
            logger.debug('[precache-sw] ignoré :', err);
        }
    };

    if (document.readyState === 'complete') lancer();
    else window.addEventListener('load', lancer, { once: true });
}
