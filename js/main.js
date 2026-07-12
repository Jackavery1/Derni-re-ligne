import { chargerEcrans } from './ui/charger-ecrans.js';
import { chargerBiomesJeu } from './config/biomes.js';
import { chargerContenuJeu } from './config/contenu-jeu.js';
import { chargerHistoireDonneesMetier } from './histoire-donnees.js';
import { demarrerPrecacheMediasSwArrierePlan } from './io/precache-sw-medias.js';
import { initialiserApplication } from './moteur.js';
import { attendreBoutonsPretes } from './ui/ui-init.js';
import { logger, afficherErreurUtilisateur } from './io/logger.js';
import { lireStockage } from './io/progression-stockage.js';
import { swAutorise, libererSwEnDevLocal } from './io/sw-dev.js';
import { precchargerNavigation } from './ui/navigation-lazy.js';
import {
    definirProgressionChargement,
    definirMessageChargement,
    masquerEcranChargement,
} from './ui/ecran-chargement.js';
import { prefetchIconesPixel } from './rendu/icones-pixel.js';
import { mettreAJourVisibiliteModesDebloques } from './ui/deblocage-ui.js';

if (window.top !== window.self) {
    window.top.location.replace(window.self.location.href);
}

window.addEventListener('error', (ev) => {
    logger.error(ev.message, ev.filename, ev.lineno);
    afficherErreurUtilisateur('Erreur JavaScript. Rechargez la page (F5 ou Ctrl+Shift+R).');
});

window.addEventListener('unhandledrejection', (ev) => {
    logger.error('Promesse rejetée :', ev.reason);
    afficherErreurUtilisateur('Erreur de chargement asynchrone. Rechargez la page.');
});

async function demarrer() {
    if (await libererSwEnDevLocal()) return;

    definirProgressionChargement(0.08);
    definirMessageChargement('Préparation…');

    document.body?.classList.toggle(
        'contraste-eleve',
        lireStockage('derniereLigne_contraste', 'false') === 'true'
    );
    try {
        definirMessageChargement('Chargement des écrans…');
        definirProgressionChargement(0.25);
        prefetchIconesPixel();
        await chargerEcrans();
    } catch (err) {
        logger.error('Échec chargement écrans :', err);
        masquerEcranChargement();
        afficherErreurUtilisateur(
            'Impossible de charger les écrans du jeu. Vérifiez votre connexion et rechargez.'
        );
        return;
    }

    try {
        definirMessageChargement('Chargement des biomes…');
        definirProgressionChargement(0.55);
        const prefetchNavigation = precchargerNavigation();
        await Promise.all([
            chargerBiomesJeu(),
            chargerContenuJeu(),
            chargerHistoireDonneesMetier(),
        ]);
        definirProgressionChargement(0.9);
        initialiserApplication();
        await attendreBoutonsPretes();
        mettreAJourVisibiliteModesDebloques();
        void prefetchNavigation;
        if (typeof document !== 'undefined') {
            document.body.dataset.neoTestReady = '1';
        }
        definirProgressionChargement(1);
        masquerEcranChargement();
        demarrerPrecacheMediasSwArrierePlan();
    } catch (err) {
        logger.error('Échec initialisation moteur:', err);
        masquerEcranChargement();
        afficherErreurUtilisateur(
            "Impossible d'initialiser le jeu. Rechargez la page ou videz le cache (Ctrl+Shift+R)."
        );
    }
}

if ('serviceWorker' in navigator && swAutorise()) {
    const enregistrerSw = () => {
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
    };

    if (document.readyState === 'complete') {
        enregistrerSw();
    } else {
        window.addEventListener('load', enregistrerSw);
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

demarrer();
