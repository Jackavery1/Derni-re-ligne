import { reagirRoboMeteoActive } from '../ui/mascotte-robo.js';
import {
    meteo,
    ETATS_METEO,
    METEO_BIOMES,
    depsMeteo,
    configurerMeteo,
    intervalleProchainMeteoMs,
    nombreCellulesBarrageMeteo,
    tirerProchainMeteo,
    effacerTimeoutsMeteo,
} from './meteo-etat.js';
import {
    afficherAlerteMeteo,
    cacherBanniereMeteo,
    mettreAJourIndicateurMeteo,
} from './meteo-ui.js';
import { declencherEffetMeteo, terminerEffetMeteo } from './meteo-effets.js';

export {
    ETATS_METEO,
    meteo,
    configurerMeteo,
    intervalleProchainMeteoMs,
    nombreCellulesBarrageMeteo,
    mettreAJourIndicateurMeteo,
};

export function annulerMeteo() {
    effacerTimeoutsMeteo();
    if (meteo.evenementActuel && meteo.etat === ETATS_METEO.ACTIF) {
        terminerEffetMeteo(meteo.evenementActuel);
        return;
    }
    meteo.facteurVitesse = 1;
    meteo.etat = ETATS_METEO.REPOS;
    meteo.evenementActuel = null;
    meteo.timerAlerte = 0;
    meteo.timerActif = 0;
    meteo.timerProchain = tirerProchainMeteo();
    meteo.controleInverse = false;
    meteo.masquerPlateau = false;
    meteo.masquerPiece = false;
    meteo.decalageForce = 0;
    cacherBanniereMeteo();
    mettreAJourIndicateurMeteo();
}

export function initialiserMeteo() {
    annulerMeteo();
    meteo.etat = ETATS_METEO.REPOS;
    meteo.timerProchain = tirerProchainMeteo();
}

export function mettreAJourMeteo(dt) {
    if (
        meteo.etat !== ETATS_METEO.REPOS &&
        meteo.etat !== ETATS_METEO.ALERTE &&
        meteo.etat !== ETATS_METEO.ACTIF
    ) {
        return;
    }

    switch (meteo.etat) {
        case ETATS_METEO.REPOS:
            meteo.timerProchain -= dt;
            if (meteo.timerProchain <= 8000) mettreAJourIndicateurMeteo();
            if (meteo.timerProchain <= 0) {
                meteo.evenementActuel =
                    METEO_BIOMES[depsMeteo.obtenirBiomeActif?.() ?? 'classique'] ??
                    METEO_BIOMES.classique;
                meteo.etat = ETATS_METEO.ALERTE;
                meteo.timerAlerte = 5000;
                afficherAlerteMeteo(meteo.evenementActuel);
            }
            break;

        case ETATS_METEO.ALERTE:
            meteo.timerAlerte -= dt;
            mettreAJourIndicateurMeteo();
            if (meteo.timerAlerte <= 0) {
                declencherEffetMeteo(meteo.evenementActuel);
                if (meteo.evenementActuel.duree === 0) {
                    terminerEffetMeteo(meteo.evenementActuel);
                } else {
                    meteo.etat = ETATS_METEO.ACTIF;
                    meteo.timerActif = meteo.evenementActuel.duree;
                    mettreAJourIndicateurMeteo();
                    reagirRoboMeteoActive();
                }
            }
            break;

        case ETATS_METEO.ACTIF:
            meteo.timerActif -= dt;
            mettreAJourIndicateurMeteo();
            if (meteo.timerActif <= 0) {
                terminerEffetMeteo(meteo.evenementActuel);
            }
            break;
    }
}
