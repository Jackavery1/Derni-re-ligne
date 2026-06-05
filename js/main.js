import { chargerEcrans } from './charger-ecrans.js';
import { initialiserApplication } from './moteur.js';
import { logger, afficherErreurUtilisateur } from './logger.js';

window.addEventListener('error', (ev) => {
    logger.error(ev.message, ev.filename, ev.lineno);
    afficherErreurUtilisateur('Une erreur est survenue. Rechargez la page.');
});

window.addEventListener('unhandledrejection', (ev) => {
    logger.error('Promesse rejetée:', ev.reason);
    afficherErreurUtilisateur('Une erreur est survenue. Rechargez la page.');
});

async function demarrer() {
    try {
        await chargerEcrans();
        initialiserApplication();
    } catch (err) {
        logger.error('Échec initialisation:', err);
        afficherErreurUtilisateur('Impossible de charger le jeu. Rechargez la page.');
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then((reg) => {
                logger.info('Service Worker PWA enregistré');
                reg.addEventListener('updatefound', () => {
                    const nw = reg.installing;
                    nw?.addEventListener('statechange', () => {
                        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                            document.getElementById('notif-maj-sw')?.classList.add('visible');
                        }
                    });
                });
            })
            .catch((err) => logger.warn('SW non disponible :', err));

        document.getElementById('btn-maj-sw')?.addEventListener('click', () => {
            navigator.serviceWorker.getRegistration().then((reg) => {
                reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            });
        });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

demarrer();
