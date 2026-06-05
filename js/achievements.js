import { logger } from './logger.js';
import { lireStockageJson, ecrireStockageJson } from './progression.js';
import { obtenirBiomeActif } from './contexte-jeu.js';
import { melodie } from './melodie.js';

export const ACHIEVEMENTS = {
    premier_tetris: {
        id: 'premier_tetris',
        nom: 'PREMIER CHOC',
        description: 'Effacer 4 lignes en un seul coup',
        icone: '⚡',
        condition: (stats) => stats.maxLignesUnCoup >= 4,
        decoration: 'flash_cyan',
        categorie: 'lignes',
    },
    centenaire: {
        id: 'centenaire',
        nom: 'CENTENAIRE',
        description: '100 lignes effacées au total (toutes parties)',
        icone: '💯',
        condition: (stats) => stats.lignesTotal >= 100,
        decoration: 'bordure_pulse',
        categorie: 'lignes',
    },
    millenaire: {
        id: 'millenaire',
        nom: 'MILLÉNAIRE',
        description: '1000 lignes effacées au total',
        icone: '🏆',
        condition: (stats) => stats.lignesTotal >= 1000,
        decoration: 'aura_dorée',
        categorie: 'lignes',
    },
    score_10k: {
        id: 'score_10k',
        nom: 'DIX MILLE',
        description: 'Atteindre 10 000 points en une partie',
        icone: '✦',
        condition: (stats) => stats.meilleurScore >= 10000,
        decoration: 'trainee_simple',
        categorie: 'score',
    },
    score_50k: {
        id: 'score_50k',
        nom: 'CINQUANTE MILLE',
        description: 'Atteindre 50 000 points en une partie',
        icone: '✦✦',
        condition: (stats) => stats.meilleurScore >= 50000,
        decoration: 'trainee_double',
        categorie: 'score',
    },
    score_100k: {
        id: 'score_100k',
        nom: 'LÉGENDE',
        description: 'Atteindre 100 000 points en une partie',
        icone: '👑',
        condition: (stats) => stats.meilleurScore >= 100000,
        decoration: 'trainee_arc_en_ciel',
        categorie: 'score',
    },
    survivant_3min: {
        id: 'survivant_3min',
        nom: 'RÉSISTANT',
        description: 'Survivre 3 minutes en une partie',
        icone: '⏱',
        condition: (stats) => stats.meilleurTemps >= 180,
        decoration: 'pouls_bordure',
        categorie: 'survie',
    },
    survivant_10min: {
        id: 'survivant_10min',
        nom: 'MARATHONIEN',
        description: 'Survivre 10 minutes en une partie',
        icone: '🔥',
        condition: (stats) => stats.meilleurTemps >= 600,
        decoration: 'flammes_bords',
        categorie: 'survie',
    },
    explorateur: {
        id: 'explorateur',
        nom: 'EXPLORATEUR',
        description: 'Jouer une partie dans 3 biomes différents',
        icone: '🗺',
        condition: (stats) => stats.biomesJoues.size >= 3,
        decoration: 'particules_biome',
        categorie: 'biomes',
    },
    globe_trotter: {
        id: 'globe_trotter',
        nom: 'GLOBE-TROTTEUR',
        description: 'Jouer une partie dans tous les biomes',
        icone: '🌍',
        condition: (stats) => stats.biomesJoues.size >= 9,
        decoration: 'aura_cosmos',
        categorie: 'biomes',
    },
    inferno_survivor: {
        id: 'inferno_survivor',
        nom: 'LAVE-RÉSISTANT',
        description: 'Survivre 5 minutes en biome Inferno',
        icone: '🌋',
        condition: (stats) => (stats.meilleurTempsParBiome.lave || 0) >= 300,
        decoration: 'flammes_intenses',
        categorie: 'biomes',
    },
    cosmos_master: {
        id: 'cosmos_master',
        nom: 'COSMONAUTE',
        description: 'Effacer 50 lignes en biome Cosmos',
        icone: '🌌',
        condition: (stats) => (stats.lignesParBiome.cosmos || 0) >= 50,
        decoration: 'etoiles_trainee',
        categorie: 'biomes',
    },
    reliquaire: {
        id: 'reliquaire',
        nom: 'RELIQUAIRE',
        description: 'Utiliser 10 reliques au total',
        icone: '⊗',
        condition: (stats) => stats.reliquesUtilisees >= 10,
        decoration: 'halo_relique',
        categorie: 'reliques',
    },
    collectionneur: {
        id: 'collectionneur',
        nom: 'COLLECTIONNEUR',
        description: 'Utiliser chaque type de relique au moins une fois',
        icone: '💎',
        condition: (stats) => stats.typesReliquesUtilises.size >= 9,
        decoration: 'gemmes_orbitales',
        categorie: 'reliques',
    },
    meteorologue: {
        id: 'meteorologue',
        nom: 'MÉTÉOROLOGUE',
        description: 'Survivre à 5 événements météo',
        icone: '🌩',
        condition: (stats) => stats.meteosSubies >= 5,
        decoration: 'eclairs_bords',
        categorie: 'meteo',
    },
    chaos_maitrise: {
        id: 'chaos_maitrise',
        nom: 'MAÎTRE DU CHAOS',
        description: 'Survivre à un blizzard ET une inversion dans la même partie',
        icone: '🌀',
        condition: (stats) =>
            stats.meteosPartieActuelle.has('blizzard') &&
            stats.meteosPartieActuelle.has('inversion'),
        decoration: 'vortex_bords',
        categorie: 'meteo',
    },
    combo_fou: {
        id: 'combo_fou',
        nom: 'COMBO FOU',
        description: 'Effacer des lignes 5 fois de suite sans interruption',
        icone: '🔗',
        condition: (stats) => stats.maxCombo >= 5,
        decoration: 'trainee_combo',
        categorie: 'maitrise',
    },
    robo_ami: {
        id: 'robo_ami',
        nom: 'AMI DE ROBO',
        description: 'Faire réagir la mascotte 20 fois',
        icone: '🤖',
        condition: (stats) => stats.reactionsRobo >= 20,
        decoration: 'robo_arc_en_ciel',
        categorie: 'maitrise',
    },
    compositeur: {
        id: 'compositeur',
        nom: 'COMPOSITEUR',
        description: 'Composer une mélodie de 15 notes ou plus',
        icone: '🎵',
        condition: (stats) => stats.maxNotesComposition >= 15,
        decoration: 'notes_flottantes',
        categorie: 'maitrise',
    },
    grand_maitre: {
        id: 'grand_maitre',
        nom: 'GRAND MAÎTRE',
        description: 'Débloquer 10 achievements',
        icone: '🎖',
        condition: (stats) => stats.nbAchievementsDebloques >= 10,
        decoration: 'couronne_lumineuse',
        categorie: 'maitrise',
    },
    oracle_debutant: {
        id: 'oracle_debutant',
        nom: 'APPRENTI',
        description: "Ignorer l'Oracle 5 fois avec succès en une partie",
        icone: '🔮',
        condition: (s) => (s.oracleDeviationsPartieActuelle || 0) >= 5,
        decoration: 'halo_oracle',
        categorie: 'oracle',
    },
    oracle_maitre: {
        id: 'oracle_maitre',
        nom: "MAÎTRE DE L'ORACLE",
        description: 'Atteindre un multiplicateur de ×4.0 ou plus',
        icone: '✦',
        condition: (s) => (s.oracleMeilleuresMult || 1) >= 4.0,
        decoration: 'halo_oracle',
        categorie: 'oracle',
    },
    premiers_pas_coop: {
        id: 'premiers_pas_coop',
        nom: 'PARTENAIRES',
        description: 'Effacer 10 lignes en mode coopératif',
        icone: '👥',
        condition: (s) => (s.lignesCoopTotal || 0) >= 10,
        decoration: 'bordure_bicolore',
        categorie: 'coop',
    },
    synchro_parfaite: {
        id: 'synchro_parfaite',
        nom: 'SYMBIOSE',
        description: 'Effacer 4 lignes simultanées en coop (Tetris Coop)',
        icone: '🔗',
        condition: (s) => (s.coopMaxLignesUnCoup || 0) >= 4,
        decoration: 'eclairs_bords',
        categorie: 'coop',
    },
};

function creerStatsVides() {
    return {
        lignesTotal: 0,
        meilleurScore: 0,
        meilleurTemps: 0,
        maxLignesUnCoup: 0,
        maxCombo: 0,
        biomesJoues: new Set(),
        meilleurTempsParBiome: {},
        lignesParBiome: {},
        reliquesUtilisees: 0,
        typesReliquesUtilises: new Set(),
        meteosSubies: 0,
        meteosPartieActuelle: new Set(),
        reactionsRobo: 0,
        maxNotesComposition: 0,
        nbAchievementsDebloques: 0,
        debloqués: {},
        decorationsActives: [],
        oraclePartiesJouees: 0,
        oracleMeilleuresMult: 1.0,
        oracleTotalDeviations: 0,
        oracleDeviationsPartieActuelle: 0,
        lignesCoopTotal: 0,
        coopMaxLignesUnCoup: 0,
    };
}

export const statsGlobales = creerStatsVides();

const fileNotifications = [];
let notificationEnCours = false;

const CLE_STATS = 'tetrisNeo_statsGlobales';

export function chargerStats() {
    try {
        const parsed = lireStockageJson(CLE_STATS, null);
        if (!parsed || typeof parsed !== 'object') return;
        const base = creerStatsVides();
        statsGlobales.lignesTotal = parsed.lignesTotal ?? base.lignesTotal;
        statsGlobales.meilleurScore = parsed.meilleurScore ?? base.meilleurScore;
        statsGlobales.meilleurTemps = parsed.meilleurTemps ?? base.meilleurTemps;
        statsGlobales.maxLignesUnCoup = parsed.maxLignesUnCoup ?? base.maxLignesUnCoup;
        statsGlobales.maxCombo = parsed.maxCombo ?? base.maxCombo;
        statsGlobales.biomesJoues = new Set(parsed.biomesJoues || []);
        statsGlobales.meilleurTempsParBiome = parsed.meilleurTempsParBiome ?? {};
        statsGlobales.lignesParBiome = parsed.lignesParBiome ?? {};
        statsGlobales.reliquesUtilisees = parsed.reliquesUtilisees ?? 0;
        statsGlobales.typesReliquesUtilises = new Set(parsed.typesReliquesUtilises || []);
        statsGlobales.meteosSubies = parsed.meteosSubies ?? 0;
        statsGlobales.reactionsRobo = parsed.reactionsRobo ?? 0;
        statsGlobales.maxNotesComposition = parsed.maxNotesComposition ?? 0;
        statsGlobales.nbAchievementsDebloques = parsed.nbAchievementsDebloques ?? 0;
        statsGlobales.debloqués = parsed.debloqués ?? {};
        statsGlobales.decorationsActives = parsed.decorationsActives ?? [];
        statsGlobales.oraclePartiesJouees = parsed.oraclePartiesJouees ?? 0;
        statsGlobales.oracleMeilleuresMult = parsed.oracleMeilleuresMult ?? 1.0;
        statsGlobales.oracleTotalDeviations = parsed.oracleTotalDeviations ?? 0;
        statsGlobales.oracleDeviationsPartieActuelle = 0;
        statsGlobales.lignesCoopTotal = parsed.lignesCoopTotal ?? 0;
        statsGlobales.coopMaxLignesUnCoup = parsed.coopMaxLignesUnCoup ?? 0;
        statsGlobales.meteosPartieActuelle = new Set();
    } catch (err) {
        logger.warn('Erreur chargement stats achievements:', err);
    }
}

export function sauvegarderStats() {
    try {
        const toSave = {
            lignesTotal: statsGlobales.lignesTotal,
            meilleurScore: statsGlobales.meilleurScore,
            meilleurTemps: statsGlobales.meilleurTemps,
            maxLignesUnCoup: statsGlobales.maxLignesUnCoup,
            maxCombo: statsGlobales.maxCombo,
            biomesJoues: [...statsGlobales.biomesJoues],
            meilleurTempsParBiome: statsGlobales.meilleurTempsParBiome,
            lignesParBiome: statsGlobales.lignesParBiome,
            reliquesUtilisees: statsGlobales.reliquesUtilisees,
            typesReliquesUtilises: [...statsGlobales.typesReliquesUtilises],
            meteosSubies: statsGlobales.meteosSubies,
            reactionsRobo: statsGlobales.reactionsRobo,
            maxNotesComposition: statsGlobales.maxNotesComposition,
            nbAchievementsDebloques: statsGlobales.nbAchievementsDebloques,
            debloqués: statsGlobales.debloqués,
            decorationsActives: statsGlobales.decorationsActives,
            oraclePartiesJouees: statsGlobales.oraclePartiesJouees,
            oracleMeilleuresMult: statsGlobales.oracleMeilleuresMult,
            oracleTotalDeviations: statsGlobales.oracleTotalDeviations,
            lignesCoopTotal: statsGlobales.lignesCoopTotal,
            coopMaxLignesUnCoup: statsGlobales.coopMaxLignesUnCoup,
        };
        ecrireStockageJson(CLE_STATS, toSave);
    } catch (err) {
        logger.warn('Erreur sauvegarde stats achievements:', err);
    }
}

export function initStatsPartie() {
    statsGlobales.biomesJoues.add(obtenirBiomeActif());
    statsGlobales.meteosPartieActuelle = new Set();
    statsGlobales.oracleDeviationsPartieActuelle = 0;
}

export function majStatsLignesEffacees(nbSupprimees) {
    if (nbSupprimees <= 0) return;
    statsGlobales.lignesTotal += nbSupprimees;
    const biomeActif = obtenirBiomeActif();
    statsGlobales.lignesParBiome[biomeActif] =
        (statsGlobales.lignesParBiome[biomeActif] || 0) + nbSupprimees;
}

export function majStatsScorePartie(nbLignes, comboActuel) {
    if (nbLignes > statsGlobales.maxLignesUnCoup) {
        statsGlobales.maxLignesUnCoup = nbLignes;
    }
    if (nbLignes > 0 && comboActuel > statsGlobales.maxCombo) {
        statsGlobales.maxCombo = comboActuel;
    }
}

export function majStatsRelique(effet) {
    statsGlobales.reliquesUtilisees++;
    if (effet) statsGlobales.typesReliquesUtilises.add(effet);
}

export function majStatsMeteo(effet) {
    statsGlobales.meteosSubies++;
    if (effet) statsGlobales.meteosPartieActuelle.add(effet);
}

export function majStatsReactionRobo(humeur) {
    if (humeur !== 'neutre') statsGlobales.reactionsRobo++;
}

export function finaliserStatsPartie(score, tempsSecondes) {
    if (tempsSecondes > statsGlobales.meilleurTemps) {
        statsGlobales.meilleurTemps = tempsSecondes;
    }
    const biome = obtenirBiomeActif();
    if (tempsSecondes > (statsGlobales.meilleurTempsParBiome[biome] || 0)) {
        statsGlobales.meilleurTempsParBiome[biome] = tempsSecondes;
    }
    if (score > statsGlobales.meilleurScore) {
        statsGlobales.meilleurScore = score;
    }
    if (melodie.notes.length > statsGlobales.maxNotesComposition) {
        statsGlobales.maxNotesComposition = melodie.notes.length;
    }
    verifierAchievements();
    sauvegarderStats();
}

export function verifierAchievements() {
    let nouveaux = 0;
    for (const [, ach] of Object.entries(ACHIEVEMENTS)) {
        if (statsGlobales.debloqués[ach.id]) continue;
        if (!ach.condition(statsGlobales)) continue;
        statsGlobales.debloqués[ach.id] = Date.now();
        statsGlobales.nbAchievementsDebloques++;
        if (!statsGlobales.decorationsActives.includes(ach.decoration)) {
            statsGlobales.decorationsActives.push(ach.decoration);
        }
        fileNotifications.push(ach);
        nouveaux++;
    }
    if (nouveaux > 0) afficherProchaineNotification();
}

function afficherProchaineNotification() {
    if (typeof document === 'undefined') return;
    if (notificationEnCours || fileNotifications.length === 0) return;
    notificationEnCours = true;
    const ach = fileNotifications.shift();
    const notif = document.getElementById('notif-achievement');
    if (!notif) {
        notificationEnCours = false;
        return;
    }
    const icone = document.getElementById('ach-icone');
    const nom = document.getElementById('ach-nom');
    const desc = document.getElementById('ach-description');
    if (icone) icone.textContent = ach.icone;
    if (nom) nom.textContent = ach.nom;
    if (desc) desc.textContent = ach.description;
    notif.classList.add('visible');
    setTimeout(() => {
        notif.classList.remove('visible');
        setTimeout(() => {
            notificationEnCours = false;
            afficherProchaineNotification();
        }, 600);
    }, 3500);
}

export function genererGalerieAchievements() {
    if (typeof document === 'undefined') return;
    const grille = document.getElementById('ach-galerie-grille');
    if (!grille) return;
    grille.textContent = '';

    const nb = Object.keys(statsGlobales.debloqués).length;
    const total = Object.keys(ACHIEVEMENTS).length;
    const compteur = document.getElementById('ach-compteur');
    if (compteur) compteur.textContent = `${nb} / ${total} DÉBLOQUÉS`;

    for (const [, ach] of Object.entries(ACHIEVEMENTS)) {
        const debloque = !!statsGlobales.debloqués[ach.id];
        const carte = document.createElement('div');
        carte.className = `ach-carte ${debloque ? 'debloque' : 'verrouille'}`;

        const iconeEl = document.createElement('div');
        iconeEl.className = 'ach-carte-icone';
        iconeEl.textContent = debloque ? ach.icone : '🔒';

        const nomEl = document.createElement('div');
        nomEl.className = 'ach-carte-nom';
        nomEl.textContent = debloque ? ach.nom : '???';

        const descEl = document.createElement('div');
        descEl.className = 'ach-carte-desc';
        descEl.textContent = debloque ? ach.description : 'Non débloqué';

        carte.appendChild(iconeEl);
        carte.appendChild(nomEl);
        carte.appendChild(descEl);

        if (debloque) {
            const d = new Date(statsGlobales.debloqués[ach.id]);
            const dateEl = document.createElement('div');
            dateEl.className = 'ach-carte-date';
            dateEl.textContent = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            carte.appendChild(dateEl);
        }

        grille.appendChild(carte);
    }
}
