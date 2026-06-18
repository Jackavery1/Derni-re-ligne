import { chargerEcrans } from './charger-ecrans.js';
import { chargerBiomesJeu } from './biomes.js';
import { chargerContenuJeu } from './contenu-jeu.js';
import { chargerDifficulteMondes } from './difficulte-mondes-chargement.js';
import { chargerAchievementsDonnees } from './achievements-donnees.js';
import { chargerHistoireDonneesMetier } from './histoire-donnees.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import { initialiserApplication } from './moteur.js';
import { attendreBoutonsPretes } from './ui-init.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import { lireStockage } from './progression-stockage.js';
import { swAutorise, libererSwEnDevLocal } from './sw-dev.js';
import { precchargerNavigation } from './navigation-lazy.js';
import {
    definirProgressionChargement,
    definirMessageChargement,
    masquerEcranChargement,
} from './ecran-chargement.js';

if (window.top !== window.self) {
    window.top.location.replace(window.self.location.href);
}

window.addEventListener('error', (ev) => {
    logger.error(ev.message, ev.filename, ev.lineno);
    afficherErreurUtilisateur('Erreur JavaScript. Rechargez la page (F5 ou Ctrl+Shift+R).');
});

window.addEventListener('unhandledrejection', (ev) => {
    logger.error('Promesse rejetee:', ev.reason);
    afficherErreurUtilisateur('Erreur de chargement asynchrone. Rechargez la page.');
});

async function demarrer() {
    if (await libererSwEnDevLocal()) return;

    definirProgressionChargement(0.08);
    definirMessageChargement('Preparation…');

    document.body?.classList.toggle(
        'contraste-eleve',
        lireStockage('derniereLigne_contraste', 'false') === 'true'
    );
    try {
        definirMessageChargement('Chargement des ecrans…');
        definirProgressionChargement(0.25);
        await chargerEcrans();
    } catch (err) {
        logger.error('Échec chargement ecrans:', err);
        masquerEcranChargement();
        afficherErreurUtilisateur(
            'Impossible de charger les ecrans du jeu. Verifiez votre connexion et rechargez.'
        );
        return;
    }

    try {
        definirMessageChargement('Chargement des biomes…');
        definirProgressionChargement(0.55);
        await Promise.all([
            chargerBiomesJeu(),
            chargerContenuJeu(),
            chargerDifficulteMondes(),
            chargerAchievementsDonnees(),
            chargerHistoireDonneesMetier(),
            chargerHistoireTextes(),
        ]);

        definirMessageChargement('Initialisation…');
        definirProgressionChargement(0.72);
        await precchargerNavigation();
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
        definirProgressionChargement(0.9);
        initialiserApplication();
        await attendreBoutonsPretes();
        if (typeof document !== 'undefined') {
            document.body.dataset.neoTestReady = '1';
        }
        definirProgressionChargement(1);
        masquerEcranChargement();
    } catch (err) {
        logger.error('Échec initialisation moteur:', err);
        masquerEcranChargement();
        afficherErreurUtilisateur(
            "Impossible d'initialiser le jeu. Rechargez la page ou videz le cache (Ctrl+Shift+R)."
        );
    }
}

if ('serviceWorker' in navigator && swAutorise()) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then((reg) => {
                logger.info('Service Worker PWA enregistre');
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
