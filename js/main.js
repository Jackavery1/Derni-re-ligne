import { chargerEcrans } from './charger-ecrans.js';
import { initialiserApplication } from './moteur.js';
import { logger, afficherErreurUtilisateur } from './logger.js';

window.addEventListener('error', (ev) => {
    logger.error(ev.message, ev.filename, ev.lineno);
    afficherErreurUtilisateur('Erreur JavaScript. Rechargez la page (F5 ou Ctrl+Shift+R).');
});

window.addEventListener('unhandledrejection', (ev) => {
    logger.error('Promesse rejetée:', ev.reason);
    afficherErreurUtilisateur('Erreur de chargement asynchrone. Rechargez la page.');
});

async function demarrer() {
    try {
        await chargerEcrans();
    } catch (err) {
        logger.error('Échec chargement écrans:', err);
        afficherErreurUtilisateur(
            'Impossible de charger les écrans du jeu. Vérifiez votre connexion et rechargez.'
        );
        return;
    }

    try {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
        initialiserApplication();
    } catch (err) {
        logger.error('Échec initialisation moteur:', err);
        afficherErreurUtilisateur(
            "Impossible d'initialiser le jeu. Rechargez la page ou videz le cache (Ctrl+Shift+R)."
        );
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
            .catch((err) => logger.warn('SW non disponible (jeu en ligne uniquement) :', err));

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
