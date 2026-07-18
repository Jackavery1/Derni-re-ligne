import { CONFIG } from '../config/config-jeu.js';
import { etat, obtenirBiomeActif } from '../etat/store-jeu.js';
import { creerParticulesExplosion, pousserParticuleJeu } from '../etat/particules-spawn.js';
import { statsGlobales, verifierAchievements } from '../achievements.js';
import {
    REGISTRE_CALCUL_VIVANT,
    REGISTRE_DECLENCHEMENT_VIVANT,
    configurerStrategiesVivant,
} from './vivant-strategies.js';
import { proposerInfobulleVivant } from '../ui/infobulles-contexte.js';
import { COMPORTEMENTS_VIVANT } from './vivant-comportements.js';

export { COMPORTEMENTS_VIVANT };

export const vivant = {
    timer: 0,
    tempsJeu: 0,
    phase: 'repos',
    timerAlerte: 0,
    DUREE_ALERTE: 8000,
    cellulesAlerte: [],
    couleurAlerte: '#ffffff',
    plateauTemps: [],
    directionCourant: 1,
};

let timeoutDeclenchementVivant = null;

export function vivantPlateauTempsPret() {
    return vivant.plateauTemps.length === CONFIG.lignes;
}

export function annulerTimersVivant() {
    if (timeoutDeclenchementVivant !== null) {
        clearTimeout(timeoutDeclenchementVivant);
        timeoutDeclenchementVivant = null;
    }
    vivant.plateauTemps = [];
}

export function initialiserVivant() {
    annulerTimersVivant();
    vivant.timer = 0;
    vivant.tempsJeu = 0;
    vivant.phase = 'repos';
    vivant.timerAlerte = 0;
    vivant.cellulesAlerte = [];
    vivant.directionCourant = COMPORTEMENTS_VIVANT.ocean?.directionActuelle ?? 1;
    vivant.plateauTemps = Array.from({ length: CONFIG.lignes }, () =>
        Array(CONFIG.colonnes).fill(0)
    );
    etat.compteurEvenementsPartie = 0;
    mettreAJourIndicateurVivant();
    cacherBanniereVivant();
}

export function vivant_supprimerCellule(x, y) {
    if (y < 0 || y >= CONFIG.lignes) return;
    if (x < 0 || x >= CONFIG.colonnes) return;
    if (etat.plateau[y][x] === 0) return;
    creerParticulesExplosion(x, y, etat.plateau[y][x] || '#ffffff');
    etat.plateau[y][x] = 0;
    vivant.plateauTemps[y][x] = 0;
}

export function vivant_poserCellule(x, y, couleur) {
    if (y < 0 || y >= CONFIG.lignes) return;
    if (x < 0 || x >= CONFIG.colonnes) return;
    if (etat.plateau[y][x] !== 0) return;
    etat.plateau[y][x] = couleur;
    vivant.plateauTemps[y][x] = Date.now();
}

export function vivant_enregistrerDepot(x, y) {
    if (!vivantPlateauTempsPret()) return;
    if (y < 0 || y >= CONFIG.lignes || x < 0 || x >= CONFIG.colonnes) return;
    vivant.plateauTemps[y][x] = Date.now();
}

export function vivant_synchroniserApresLignes(lignesEffacees) {
    if (!lignesEffacees?.length || !vivantPlateauTempsPret()) return;
    const aRetirer = new Set(lignesEffacees);
    const conserve = vivant.plateauTemps.filter((_, i) => !aRetirer.has(i));
    const nbVides = CONFIG.lignes - conserve.length;
    vivant.plateauTemps = [
        ...Array.from({ length: nbVides }, () => Array(CONFIG.colonnes).fill(0)),
        ...conserve,
    ];
}

export function vivant_recompenserActivite() {
    vivant.timer = 0;
    if (vivant.phase === 'alerte') {
        vivant.phase = 'repos';
        vivant.cellulesAlerte = [];
        cacherBanniereVivant();
    }
}

export function vivant_enregistrerLignesScore(nbLignes) {
    if (nbLignes <= 0) return;
    if (vivant.phase === 'alerte' || vivant.timer < 2000) {
        statsGlobales.lignesPendantVivant = (statsGlobales.lignesPendantVivant || 0) + nbLignes;
    }
}

function obtenirConfigVivant() {
    return COMPORTEMENTS_VIVANT[obtenirBiomeActif()];
}

/** @param {{ intervalle: number, delaiMinimum: number }} config @param {number} [niveau] */
export function intervalleVivantEffectif(config, niveau = 1) {
    let facteur = niveau <= 5 ? 1.35 : niveau <= 8 ? 1.15 : 1;
    if (niveau >= 10) facteur *= 1.2;
    return Math.round(config.intervalle * facteur);
}

/** @param {{ intervalle: number, delaiMinimum: number }} config @param {number} [niveau] */
export function delaiMinimumVivantEffectif(config, niveau = 1) {
    let facteur = niveau <= 5 ? 1.25 : niveau <= 8 ? 1.1 : 1;
    if (niveau >= 10) facteur *= 1.15;
    return Math.round(config.delaiMinimum * facteur);
}

function pousserParticuleVivant(config) {
    pousserParticuleJeu({ type: 'defaut', ...config });
}

configurerStrategiesVivant({
    supprimerCellule: vivant_supprimerCellule,
    poserCellule: vivant_poserCellule,
    pousserParticule: pousserParticuleVivant,
    vivant,
    comportements: COMPORTEMENTS_VIVANT,
});

export function calculerCellulesAffectees(biomeId) {
    const config = COMPORTEMENTS_VIVANT[biomeId];
    if (!config) return [];
    const calculer = REGISTRE_CALCUL_VIVANT[biomeId];
    return calculer ? calculer(config) : [];
}

function enregistrerStatsEvenement(biomeId) {
    statsGlobales.evenementsVivantSubis = (statsGlobales.evenementsVivantSubis || 0) + 1;
    if (!statsGlobales.biomesVivantSubis) statsGlobales.biomesVivantSubis = new Set();
    statsGlobales.biomesVivantSubis.add(biomeId);
    etat.compteurEvenementsPartie = (etat.compteurEvenementsPartie || 0) + 1;
    if (etat.compteurEvenementsPartie > (statsGlobales.maxEvenementsUnePartie || 0)) {
        statsGlobales.maxEvenementsUnePartie = etat.compteurEvenementsPartie;
    }
    verifierAchievements();
}

export function declencherComportementVivant(biomeId) {
    enregistrerStatsEvenement(biomeId);
    cacherBanniereVivant();
    const declencher = REGISTRE_DECLENCHEMENT_VIVANT[biomeId];
    if (declencher) declencher(vivant.cellulesAlerte);
}

export function afficherNotifVivant(config) {
    const b = document.getElementById('banniere-vivant');
    if (!b) return;
    const icone = document.getElementById('vivant-icone');
    const nom = document.getElementById('vivant-nom');
    const desc = document.getElementById('vivant-desc');
    if (icone) icone.textContent = config.icone;
    if (nom) {
        nom.textContent = config.nom;
        nom.style.color = config.couleurAlerte;
        nom.style.textShadow = `0 0 8px ${config.couleurAlerte}`;
    }
    if (desc) desc.textContent = config.description;
    b.style.borderColor = config.couleurAlerte;
    b.style.boxShadow = `0 0 15px ${config.couleurAlerte}44`;
    b.classList.add('visible');
}

export function cacherBanniereVivant() {
    document.getElementById('banniere-vivant')?.classList.remove('visible');
}

export function mettreAJourCompteRebours() {
    const el = document.getElementById('vivant-compte-rebours');
    if (el && vivant.phase === 'alerte') {
        el.textContent = String(Math.ceil(vivant.timerAlerte / 1000));
    }
}

export function mettreAJourIndicateurVivant() {
    const config = obtenirConfigVivant();
    const sect = document.getElementById('section-vivant');
    if (!sect) return;

    if (!config) {
        sect.classList.add('element-masque');
        return;
    }

    sect.classList.remove('element-masque');
    const elNom = document.getElementById('vivant-label-nom');
    const elBar = document.getElementById('vivant-barre');
    const elTitr = document.getElementById('vivant-label-titre');

    if (elNom) elNom.textContent = config.nom;
    if (elTitr) {
        elTitr.style.color = config.couleurAlerte;
        elTitr.style.textShadow = `0 0 6px ${config.couleurAlerte}`;
    }

    if (elBar) {
        const intervalle = intervalleVivantEffectif(config, etat.niveau ?? 1);
        const pct = (vivant.timer / intervalle) * 100;
        elBar.style.width = `${Math.min(100, pct)}%`;
        elBar.style.background =
            vivant.phase === 'alerte' ? config.couleurAlerte : `${config.couleurAlerte}88`;
    }

    if (vivant.phase === 'alerte') {
        sect.classList.add('vivant-phase-alerte');
    } else {
        sect.classList.remove('vivant-phase-alerte');
    }
}

export function mettreAJourVivant(dt) {
    if (etat.estEnPause) return;

    const biomeId = obtenirBiomeActif();
    const config = COMPORTEMENTS_VIVANT[biomeId];
    if (!config) return;

    vivant.tempsJeu += dt;
    const delaiMinimum = delaiMinimumVivantEffectif(config, etat.niveau ?? 1);
    if (vivant.tempsJeu < delaiMinimum) {
        mettreAJourIndicateurVivant();
        return;
    }

    const intervalle = intervalleVivantEffectif(config, etat.niveau ?? 1);

    switch (vivant.phase) {
        case 'repos':
            vivant.timer += dt;
            if (vivant.timer >= intervalle - vivant.DUREE_ALERTE) {
                vivant.phase = 'alerte';
                vivant.timerAlerte = vivant.DUREE_ALERTE;
                vivant.couleurAlerte = config.couleurAlerte;
                vivant.cellulesAlerte = calculerCellulesAffectees(biomeId);
                afficherNotifVivant(config);
                proposerInfobulleVivant(biomeId, config);
            }
            break;

        case 'alerte':
            vivant.timerAlerte -= dt;
            vivant.timer += dt;
            mettreAJourCompteRebours();
            if (vivant.timerAlerte <= 0) {
                vivant.phase = 'declenchement';
                declencherComportementVivant(biomeId);
                annulerTimersVivant();
                timeoutDeclenchementVivant = setTimeout(() => {
                    timeoutDeclenchementVivant = null;
                    vivant.phase = 'repos';
                    vivant.timer = 0;
                    vivant.cellulesAlerte = [];
                    cacherBanniereVivant();
                }, 600);
            }
            break;
    }

    mettreAJourIndicateurVivant();
}
