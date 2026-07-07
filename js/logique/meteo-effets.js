import { majStatsMeteo } from '../achievements.js';
import {
    meteo,
    ETATS_METEO,
    CONFIG,
    METEO_BIOMES,
    depsMeteo,
    effacerTimeoutsMeteo,
    tirerProchainMeteo,
    nombreCellulesBarrageMeteo,
} from './meteo-etat.js';
import { cacherBanniereMeteo, mettreAJourIndicateurMeteo } from './meteo-ui.js';

function declencherEffetMeteo(evenement) {
    const etatPartie = depsMeteo.obtenirEtat();

    switch (evenement.effet) {
        case 'acceleration':
            meteo.facteurVitesse = 0.52;
            break;

        case 'eruption': {
            const colsLibres = [];
            for (let c = 0; c < CONFIG.colonnes; c++) {
                if (etatPartie.plateau[0][c] === 0) colsLibres.push(c);
            }
            if (colsLibres.length === 0) break;
            const col = colsLibres[Math.floor(Math.random() * colsLibres.length)];
            for (let cherche = CONFIG.lignes - 1, poses = 0; cherche >= 0 && poses < 3; cherche--) {
                if (etatPartie.plateau[cherche][col] === 0) {
                    etatPartie.plateau[cherche][col] = METEO_BIOMES.lave.couleur;
                    poses++;
                }
            }
            break;
        }

        case 'courant':
            meteo.decalageForce = 1;
            break;

        case 'germination': {
            const candidats = [];
            for (let l = 1; l < CONFIG.lignes; l++) {
                for (let c = 0; c < CONFIG.colonnes; c++) {
                    if (etatPartie.plateau[l][c] === 0 && etatPartie.plateau[l - 1][c] !== 0) {
                        candidats.push({ x: c, y: l });
                    }
                }
            }
            candidats
                .sort(() => Math.random() - 0.5)
                .slice(0, 6)
                .forEach(({ x, y }) => {
                    etatPartie.plateau[y][x] = METEO_BIOMES.foret.couleur;
                });
            break;
        }

        case 'blizzard':
            meteo.masquerPlateau = true;
            break;

        case 'tempete':
            meteo.masquerPiece = true;
            break;

        case 'inversion':
            meteo.controleInverse = true;
            break;

        case 'barrage': {
            const cellulesBasse = [];
            for (let l = Math.floor(CONFIG.lignes / 2); l < CONFIG.lignes; l++) {
                for (let c = 0; c < CONFIG.colonnes; c++) {
                    if (etatPartie.plateau[l][c] !== 0) {
                        cellulesBasse.push({ x: c, y: l });
                    }
                }
            }
            cellulesBasse
                .sort(() => Math.random() - 0.5)
                .slice(0, nombreCellulesBarrageMeteo(etatPartie.niveau ?? 1))
                .forEach(({ x, y }) => {
                    depsMeteo.creerParticulesExplosion(x, y, etatPartie.plateau[y][x]);
                    etatPartie.plateau[y][x] = 0;
                });
            break;
        }

        case 'microgravite':
            meteo.facteurVitesse = 3;
            break;
    }
}

export function terminerEffetMeteo(evenement) {
    if (!evenement) return;
    majStatsMeteo(evenement.effet);
    switch (evenement.effet) {
        case 'acceleration':
        case 'microgravite':
            meteo.facteurVitesse = 1;
            break;
        case 'courant':
            meteo.decalageForce = 0;
            break;
        case 'blizzard':
            meteo.masquerPlateau = false;
            break;
        case 'tempete':
            meteo.masquerPiece = false;
            break;
        case 'inversion':
            meteo.controleInverse = false;
            break;
    }
    meteo.etat = ETATS_METEO.REPOS;
    meteo.evenementActuel = null;
    meteo.timerActif = 0;
    meteo.timerAlerte = 0;
    meteo.timerProchain = tirerProchainMeteo();
    effacerTimeoutsMeteo();
    cacherBanniereMeteo();
    mettreAJourIndicateurMeteo();
}

export { declencherEffetMeteo };
