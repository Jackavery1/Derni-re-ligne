import { CONFIG, METEO_BIOMES } from './config.js';
import { majStatsMeteo } from './achievements.js';
import { reagirRoboMeteoActive } from './mascotte-robo.js';

export const ETATS_METEO = { REPOS: 'repos', ALERTE: 'alerte', ACTIF: 'actif' };

export const meteo = {
    etat: ETATS_METEO.REPOS,
    timerProchain: 0,
    timerAlerte: 0,
    timerActif: 0,
    evenementActuel: null,
    /** Multiplicateur de gravite applique en solo (1 = neutre). Ne mute jamais CONFIG. */
    facteurVitesse: 1,
    controleInverse: false,
    masquerPlateau: false,
    masquerPiece: false,
    decalageForce: 0,
    timeoutAlerteTexte: null,
    timeoutBanniere: null,
};

let deps = {};

export function configurerMeteo(dependances) {
    deps = dependances;
}

function tirerProchainMeteo() {
    return (Math.floor(Math.random() * 61) + 90) * 1000;
}

function effacerTimeoutsMeteo() {
    if (meteo.timeoutAlerteTexte) {
        clearTimeout(meteo.timeoutAlerteTexte);
        meteo.timeoutAlerteTexte = null;
    }
    if (meteo.timeoutBanniere) {
        clearTimeout(meteo.timeoutBanniere);
        meteo.timeoutBanniere = null;
    }
}

function cacherBanniereMeteo() {
    document.getElementById('banniere-meteo')?.classList.remove('visible');
}

function afficherAlerteMeteo(evenement) {
    const banniere = document.getElementById('banniere-meteo');
    if (!banniere) return;
    effacerTimeoutsMeteo();
    banniere.style.setProperty('--meteo-couleur', evenement.couleur);
    const iconeEl = document.getElementById('meteo-icone');
    const texteEl = document.getElementById('meteo-texte');
    if (iconeEl) iconeEl.textContent = evenement.icone;
    if (texteEl) texteEl.textContent = evenement.alerte;
    const barre = document.getElementById('meteo-barre-alerte');
    if (barre) {
        barre.style.animation = 'none';
        void barre.offsetWidth;
        barre.style.animation = '';
    }
    banniere.classList.add('visible');
    meteo.timeoutAlerteTexte = setTimeout(() => {
        if (texteEl) texteEl.textContent = evenement.actif;
        meteo.timeoutBanniere = setTimeout(cacherBanniereMeteo, evenement.duree || 1500);
    }, 5000);
}

export function mettreAJourIndicateurMeteo() {
    const indic = document.getElementById('indicateur-meteo');
    if (!indic) return;
    if (
        meteo.etat === ETATS_METEO.ACTIF &&
        meteo.evenementActuel &&
        meteo.evenementActuel.duree > 0
    ) {
        indic.style.display = 'block';
        indic.style.setProperty('--meteo-actif-couleur', meteo.evenementActuel.couleur);
        const iconeEl = document.getElementById('meteo-actif-icone');
        const nomEl = document.getElementById('meteo-actif-nom');
        const barreEl = document.getElementById('meteo-barre-duree');
        if (iconeEl) iconeEl.textContent = meteo.evenementActuel.icone + ' ';
        if (nomEl) nomEl.textContent = meteo.evenementActuel.actif;
        if (barreEl) {
            const pct = ((meteo.timerActif / meteo.evenementActuel.duree) * 100).toFixed(1);
            barreEl.style.width = pct + '%';
        }
    } else {
        indic.style.display = 'none';
    }
}

function declencherEffetMeteo(evenement) {
    const etat = deps.obtenirEtat();

    switch (evenement.effet) {
        case 'acceleration':
            meteo.facteurVitesse = 0.52;
            break;

        case 'eruption': {
            const colsLibres = [];
            for (let c = 0; c < CONFIG.colonnes; c++) {
                if (etat.plateau[0][c] === 0) colsLibres.push(c);
            }
            if (colsLibres.length === 0) break;
            const col = colsLibres[Math.floor(Math.random() * colsLibres.length)];
            for (let cherche = CONFIG.lignes - 1, poses = 0; cherche >= 0 && poses < 3; cherche--) {
                if (etat.plateau[cherche][col] === 0) {
                    etat.plateau[cherche][col] = METEO_BIOMES.lave.couleur;
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
                    if (etat.plateau[l][c] === 0 && etat.plateau[l - 1][c] !== 0) {
                        candidats.push({ x: c, y: l });
                    }
                }
            }
            candidats
                .sort(() => Math.random() - 0.5)
                .slice(0, 6)
                .forEach(({ x, y }) => {
                    etat.plateau[y][x] = METEO_BIOMES.foret.couleur;
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
                    if (etat.plateau[l][c] !== 0) {
                        cellulesBasse.push({ x: c, y: l });
                    }
                }
            }
            cellulesBasse
                .sort(() => Math.random() - 0.5)
                .slice(0, 6)
                .forEach(({ x, y }) => {
                    deps.creerParticulesExplosion(x, y, etat.plateau[y][x]);
                    etat.plateau[y][x] = 0;
                });
            break;
        }

        case 'microgravite':
            meteo.facteurVitesse = 3;
            break;
    }
}

function terminerEffetMeteo(evenement) {
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
            if (meteo.timerProchain <= 0) {
                meteo.evenementActuel =
                    METEO_BIOMES[deps.obtenirBiomeActif()] ?? METEO_BIOMES.classique;
                meteo.etat = ETATS_METEO.ALERTE;
                meteo.timerAlerte = 5000;
                afficherAlerteMeteo(meteo.evenementActuel);
            }
            break;

        case ETATS_METEO.ALERTE:
            meteo.timerAlerte -= dt;
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
