import { CONFIG } from './config.js';
import { etat, obtenirBiomeActif } from './store-jeu.js';
import { creerParticulesExplosion, pousserParticuleJeu } from './particules-jeu.js';
import { statsGlobales, verifierAchievements } from './achievements.js';
import {
    REGISTRE_CALCUL_VIVANT,
    REGISTRE_DECLENCHEMENT_VIVANT,
    configurerStrategiesVivant,
} from './vivant-strategies.js';
import { proposerInfobulleVivant } from './infobulles-contexte.js';

export const COMPORTEMENTS_VIVANT = {
    classique: null,

    lave: {
        nom: 'CONVECTION',
        icone: '🔥',
        description: "Les blocs anciens s'embrasent et disparaissent",
        couleurAlerte: '#ff4500',
        intervalle: 22000,
        delaiMinimum: 30000,
        seuilAge: 15000,
        nbBlocs: 6,
    },

    ocean: {
        nom: 'COURANT MARIN',
        icone: '🌊',
        description: "Un courant deplace tous les blocs d'une case",
        couleurAlerte: '#00cfff',
        intervalle: 18000,
        delaiMinimum: 25000,
        directionActuelle: 1,
    },

    foret: {
        nom: 'CROISSANCE',
        icone: '🌿',
        description: 'Les blocs anciens font pousser de nouvelles cellules',
        couleurAlerte: '#00cc44',
        intervalle: 15500,
        delaiMinimum: 22000,
        seuilAge: 20000,
        nbPousses: 4,
    },

    glace: {
        nom: 'GIVRE',
        icone: '❄️',
        description: 'Le givre remplit partiellement des rangees vides',
        couleurAlerte: '#aaeeff',
        intervalle: 24000,
        delaiMinimum: 32000,
        nbGivre: 5,
    },

    desert: {
        nom: 'ENSABLEMENT',
        icone: '⌛',
        description: 'Le sable comble les trous les plus profonds',
        couleurAlerte: '#ffbb44',
        intervalle: 17000,
        delaiMinimum: 22000,
        nbGrains: 4,
    },

    cyber: {
        nom: 'CORRUPTION',
        icone: '⚠',
        description: 'Le virus efface des blocs aleatoirement',
        couleurAlerte: '#ff00ff',
        intervalle: 18500,
        delaiMinimum: 24000,
        nbBlocs: 3,
    },

    fuochi: {
        nom: 'EXPLOSION SPONTANÉE',
        icone: '💥',
        description: 'Une zone du plateau explose sans prevenir',
        couleurAlerte: '#ffe600',
        intervalle: 28000,
        delaiMinimum: 38000,
        rayon: 2,
    },

    cosmos: {
        nom: 'ANTIGRAVITÉ',
        icone: '🌌',
        description: "Les blocs flottants montent d'une case",
        couleurAlerte: '#7700ff',
        intervalle: 20000,
        delaiMinimum: 28000,
    },
};

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
        const pct = (vivant.timer / config.intervalle) * 100;
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
    if (vivant.tempsJeu < config.delaiMinimum) {
        mettreAJourIndicateurVivant();
        return;
    }

    switch (vivant.phase) {
        case 'repos':
            vivant.timer += dt;
            if (vivant.timer >= config.intervalle - vivant.DUREE_ALERTE) {
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
